<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Item;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Tax;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create many customers
        for ($i = 1; $i <= 50; $i++) {
            Customer::create([
                'name' => "Customer $i",
                'phone' => "9" . str_pad($i, 9, '0', STR_PAD_LEFT),
                'email' => "customer$i@example.com",
                'address' => "Address of Customer $i",
            ]);
        }

        // 2. Create many items
        for ($i = 1; $i <= 50; $i++) {
            Item::create([
                'name' => "Product $i",
                'description' => "Description for Product $i",
            ]);
        }

        // 3. Create many invoices
        $customers = Customer::all();
        $items = Item::all();
        $tax = Tax::first() ?? Tax::create(['sgst' => 9, 'cgst' => 9]);

        for ($i = 1; $i <= 30; $i++) {
            $customer = $customers->random();
            $invoiceDate = now()->subDays(rand(0, 30))->format('Y-m-d');
            
            $invoice = Invoice::create([
                'invoice_number' => "INV-" . str_pad($i, 5, '0', STR_PAD_LEFT),
                'customer_id' => $customer->id,
                'invoice_date' => $invoiceDate,
                'notes' => "Dummy invoice $i",
                'subtotal' => 0,
                'sgst_percent' => $tax->sgst,
                'cgst_percent' => $tax->cgst,
                'sgst_amount' => 0,
                'cgst_amount' => 0,
                'tax_total' => 0,
                'grand_total' => 0,
            ]);

            $subtotal = 0;
            $numItems = rand(1, 4);
            for ($j = 0; $j < $numItems; $j++) {
                $product = $items->random();
                $qty = rand(1, 10);
                $price = rand(100, 5000);
                $lineTotal = $qty * $price;

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'item_id' => $product->id,
                    'item_name' => $product->name,
                    'quantity' => $qty,
                    'price' => $price,
                    'line_total' => $lineTotal,
                ]);

                $subtotal += $lineTotal;
            }

            $sgstAmount = round($subtotal * ($tax->sgst / 100), 2);
            $cgstAmount = round($subtotal * ($tax->cgst / 100), 2);
            $taxTotal = $sgstAmount + $cgstAmount;

            $invoice->update([
                'subtotal' => $subtotal,
                'sgst_amount' => $sgstAmount,
                'cgst_amount' => $cgstAmount,
                'tax_total' => $taxTotal,
                'grand_total' => $subtotal + $taxTotal,
            ]);
        }
    }
}
