<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Tax;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvoiceController extends Controller
{
    /**
     * GET /api/invoices
     * List invoices with optional search (invoice_number / customer name),
     * date range filter and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Invoice::query()->with('customer');

            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%$search%")
                        ->orWhereHas('customer', function ($qq) use ($search) {
                            $qq->where('name', 'like', "%$search%");
                        });
                });
            }

            if ($from = $request->query('from_date')) {
                $query->whereDate('invoice_date', '>=', $from);
            }
            if ($to = $request->query('to_date')) {
                $query->whereDate('invoice_date', '<=', $to);
            }

            $perPage = (int) $request->query('per_page', 10);
            $invoices = $query->orderByDesc('id')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => InvoiceResource::collection($invoices),
                'meta' => [
                    'current_page' => $invoices->currentPage(),
                    'last_page' => $invoices->lastPage(),
                    'per_page' => $invoices->perPage(),
                    'total' => $invoices->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to list invoices: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to fetch invoices.'], 500);
        }
    }

    /**
     * POST /api/invoices
     * Create a new invoice with line items. Price is entered per line; tax
     * is pulled from the taxes table (SGST + CGST) and applied on the
     * invoice subtotal. Totals are computed on the server for safety.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|integer|exists:customers,id',
            'invoice_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'nullable|integer|exists:items,id',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        try {
            $invoice = DB::transaction(function () use ($validated) {
                $tax = Tax::current();

                $invoice = Invoice::create([
                    'invoice_number' => Invoice::generateInvoiceNumber(),
                    'customer_id' => $validated['customer_id'],
                    'invoice_date' => $validated['invoice_date'],
                    'notes' => $validated['notes'] ?? null,
                    'subtotal' => 0,
                    'sgst_percent' => $tax->sgst,
                    'cgst_percent' => $tax->cgst,
                    'sgst_amount' => 0,
                    'cgst_amount' => 0,
                    'tax_total' => 0,
                    'grand_total' => 0,
                ]);

                $subtotal = $this->persistItems($invoice, $validated['items']);
                $this->applyTotals($invoice, $subtotal, $tax);

                return $invoice->load(['customer', 'items']);
            });

            return response()->json([
                'success' => true,
                'message' => 'Invoice created successfully.',
                'data' => new InvoiceResource($invoice),
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Failed to create invoice: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to create invoice.'], 500);
        }
    }

    /**
     * GET /api/invoices/{id}
     * Show a single invoice with its items and customer.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $invoice = Invoice::with(['customer', 'items'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => new InvoiceResource($invoice),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => 'Invoice not found.'], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to show invoice: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to fetch invoice.'], 500);
        }
    }

    /**
     * PUT /api/invoices/{id}
     * Update an existing invoice. Replaces all items and recomputes totals
     * against the current SGST / CGST configuration.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'sometimes|required|integer|exists:customers,id',
            'invoice_date' => 'sometimes|required|date',
            'notes' => 'nullable|string',
            'items' => 'sometimes|required|array|min:1',
            'items.*.item_id' => 'nullable|integer|exists:items,id',
            'items.*.item_name' => 'required_with:items|string|max:255',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.price' => 'required_with:items|numeric|min:0',
        ]);

        try {
            $invoice = Invoice::findOrFail($id);

            $invoice = DB::transaction(function () use ($invoice, $validated) {
                $invoice->update(array_filter([
                    'customer_id' => $validated['customer_id'] ?? null,
                    'invoice_date' => $validated['invoice_date'] ?? null,
                    'notes' => $validated['notes'] ?? $invoice->notes,
                ], fn ($v) => $v !== null));

                if (isset($validated['items'])) {
                    $tax = Tax::current();
                    $invoice->items()->delete();

                    $subtotal = $this->persistItems($invoice, $validated['items']);

                    $invoice->update([
                        'sgst_percent' => $tax->sgst,
                        'cgst_percent' => $tax->cgst,
                    ]);

                    $this->applyTotals($invoice, $subtotal, $tax);
                }

                return $invoice->load(['customer', 'items']);
            });

            return response()->json([
                'success' => true,
                'message' => 'Invoice updated successfully.',
                'data' => new InvoiceResource($invoice),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => 'Invoice not found.'], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to update invoice: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to update invoice.'], 500);
        }
    }

    /**
     * DELETE /api/invoices/{id}
     * Delete an invoice (cascades to its items).
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);
            $invoice->delete();

            return response()->json(['success' => true, 'message' => 'Invoice deleted successfully.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => 'Invoice not found.'], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to delete invoice: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to delete invoice.'], 500);
        }
    }

    /**
     * GET /api/invoices/{id}/pdf
     * Stream a PDF for the invoice. Pass ?download=1 to force a download.
     * Company details are pulled from the company table.
     */
    public function pdf(Request $request, int $id): Response
    {
        try {
            $invoice = Invoice::with(['customer', 'items'])->findOrFail($id);
            $company = Company::current();
            $currencySymbol = config('billing.currency_symbol', '₹');

            $pdf = Pdf::loadView('invoices.pdf', compact('invoice', 'company', 'currencySymbol'));
            $filename = $invoice->invoice_number.'.pdf';

            return $request->boolean('download')
                ? $pdf->download($filename)
                : $pdf->stream($filename);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response('Invoice not found.', 404);
        } catch (\Throwable $e) {
            Log::error('Failed to render invoice PDF: '.$e->getMessage());

            return response('Failed to render invoice PDF.', 500);
        }
    }

    /**
     * Persist the submitted item rows and return the running subtotal
     * (sum of quantity × price). Prices are taken verbatim from the
     * request so the caller's entered rate is always honoured.
     */
    private function persistItems(Invoice $invoice, array $items): float
    {
        $subtotal = 0;

        foreach ($items as $row) {
            $qty = (int) $row['quantity'];
            $price = (float) $row['price'];
            $lineTotal = round($qty * $price, 2);

            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'item_id' => $row['item_id'] ?? null,
                'item_name' => $row['item_name'],
                'quantity' => $qty,
                'price' => $price,
                'line_total' => $lineTotal,
            ]);

            $subtotal += $lineTotal;
        }

        return round($subtotal, 2);
    }

    /**
     * Apply the tax rates against the invoice subtotal and persist the
     * SGST / CGST amounts, combined tax total and grand total.
     */
    private function applyTotals(Invoice $invoice, float $subtotal, Tax $tax): void
    {
        $sgstAmount = round($subtotal * ((float) $tax->sgst / 100), 2);
        $cgstAmount = round($subtotal * ((float) $tax->cgst / 100), 2);
        $taxTotal = round($sgstAmount + $cgstAmount, 2);

        $invoice->update([
            'subtotal' => $subtotal,
            'sgst_amount' => $sgstAmount,
            'cgst_amount' => $cgstAmount,
            'tax_total' => $taxTotal,
            'grand_total' => round($subtotal + $taxTotal, 2),
        ]);
    }
}
