<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\InvoiceCounter;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;
    
    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::deleting(function ($invoice) {
            // If it's a soft delete (not a force delete), rename the invoice number
            // to free up the original number for future use.
            if (!$invoice->isForceDeleting()) {
                $originalNumber = $invoice->invoice_number;
                $invoice->invoice_number = $originalNumber . '-DEL-' . time();
                $invoice->save();

                // Roll back the global counter if this was the most recent invoice created.
                // This allows the user to immediately reuse the number.
                $counter = InvoiceCounter::first();
                if ($counter) {
                    preg_match('/INV-(\d+)/', $originalNumber, $matches);
                    if (isset($matches[1])) {
                        $num = (int) $matches[1];
                        if ($num === ($counter->invoice_counter - 1)) {
                            $counter->decrement('invoice_counter');
                        }
                    }
                }
            }
        });
    }

    protected $fillable = [
        'invoice_number',
        'customer_id',
        'invoice_date',
        'subtotal',
        'sgst_percent',
        'cgst_percent',
        'sgst_amount',
        'cgst_amount',
        'tax_total',
        'total_tax',
        'grand_total',
        'inclusive_tax',
        'notes',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'subtotal' => 'decimal:2',
        'sgst_percent' => 'decimal:2',
        'cgst_percent' => 'decimal:2',
        'sgst_amount' => 'decimal:2',
        'cgst_amount' => 'decimal:2',
        'tax_total' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'inclusive_tax' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class)->withTrashed();
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Generate the next sequential invoice number from the dedicated counter table.
     */
    public static function generateInvoiceNumber(): string
    {
        $counter = InvoiceCounter::firstOrCreate([], ['invoice_counter' => 1]);
        
        $currentValue = $counter->invoice_counter;
        
        // Increment for the next one
        $counter->increment('invoice_counter');

        return 'INV-'.str_pad((string) $currentValue, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Format number to Indian Currency style.
     */
    public static function formatIndianCurrency($number): string
    {
        if ($number === null || $number === '') {
            return '0.00';
        }
        
        $number = (float) $number;
        $number_str = sprintf("%.2f", $number);
        
        list($amount, $decimal) = explode('.', $number_str);

        $lastThree = substr($amount, -3);
        $restUnits = substr($amount, 0, -3);
        if ($restUnits != '') {
            $restUnits = preg_replace("/\B(?=(\d{2})+(?!\d))/", ",", $restUnits);
            $lastThree = "," . $lastThree;
        }
        return $restUnits . $lastThree . '.' . $decimal;
    }
}
