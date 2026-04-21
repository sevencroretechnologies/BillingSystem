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
                    'total_tax' => 0,
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
                    $invoice->items()->forceDelete();

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
            $invoice->items()->delete();
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

            // Explicitly define variables for the template as requested
            $subtotal = (float) $invoice->subtotal;
            $cgst = (float) $invoice->cgst_amount;
            $sgst = (float) $invoice->sgst_amount;
            $grand_total = (float) $invoice->grand_total;
            
            // Generate grand total in words
            $amount_in_words = "";
            if (class_exists('\NumberFormatter')) {
                $formatter = new \NumberFormatter('en_IN', \NumberFormatter::SPELLOUT);
                $amount_in_words = ucwords($formatter->format($grand_total)) . " Only";
            } else {
                // Fallback to internal method if intl is missing
                $amount_in_words = $this->convertToWords($grand_total);
            }

            $pdf = Pdf::loadView('invoices.pdf', compact(
                'invoice', 
                'company', 
                'currencySymbol',
                'subtotal',
                'cgst',
                'sgst',
                'grand_total',
                'amount_in_words'
            ));
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
     * Internal fallback for converting numbers to words (Indian style)
     */
    private function convertToWords($number)
    {
        $decimal = round($number - ($no = floor($number)), 2) * 100;
        $hundred = null;
        $digits_length = strlen($no);
        $i = 0;
        $str = array();
        $words = array(
            0 => '', 1 => 'One', 2 => 'Two',
            3 => 'Three', 4 => 'Four', 5 => 'Five', 6 => 'Six',
            7 => 'Seven', 8 => 'Eight', 9 => 'Nine',
            10 => 'Ten', 11 => 'Eleven', 12 => 'Twelve',
            13 => 'Thirteen', 14 => 'Fourteen', 15 => 'Fifteen',
            16 => 'Sixteen', 17 => 'Seventeen', 18 => 'Eighteen',
            19 => 'Nineteen', 20 => 'Twenty', 30 => 'Thirty',
            40 => 'Forty', 50 => 'Fifty', 60 => 'Sixty',
            70 => 'Seventy', 80 => 'Eighty', 90 => 'Ninety'
        );
        $digits = array('', 'Hundred', 'Thousand', 'Lakh', 'Crore');
        while ($i < $digits_length) {
            $divider = ($i == 2) ? 10 : 100;
            $number = floor($no % $divider);
            $no = floor($no / $divider);
            $i += $divider == 10 ? 1 : 2;
            if ($number) {
                $plural = (($counter = count($str)) && $number > 9) ? 's' : null;
                $hundred = ($counter == 1 && $str[0]) ? ' and ' : null;
                $str [] = ($number < 21) ? $words[$number] . ' ' . $digits[$counter] . $plural . ' ' . $hundred : $words[floor($number / 10) * 10] . ' ' . $words[$number % 10] . ' ' . $digits[$counter] . $plural . ' ' . $hundred;
            } else $str[] = null;
        }
        $Rupees = implode('', array_reverse($str));
        $paise = ($decimal > 0) ? "." . ($words[$decimal / 10] . " " . $words[$decimal % 10]) . ' Paise' : '';
        return ($Rupees ? $Rupees . 'Rupees ' : '') . $paise . ' Only';
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

            $itemId = $row['item_id'] ?? null;
            $itemName = $row['item_name'];

            // If no item ID is provided, try to find/create it in the master Items table.
            if (!$itemId && !empty($itemName)) {
                $masterItem = \App\Models\Item::firstOrCreate(['name' => $itemName]);
                $itemId = $masterItem->id;
            }

            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'item_id' => $itemId,
                'item_name' => $itemName,
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
            'total_tax' => $taxTotal,
            'grand_total' => round($subtotal + $taxTotal, 2),
        ]);
    }
}
