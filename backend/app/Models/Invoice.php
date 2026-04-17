<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'customer_id',
        'invoice_date',
        'subtotal',
        'tax_total',
        'grand_total',
        'notes',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_total' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Generate the next sequential invoice number like INV-000001.
     */
    public static function generateInvoiceNumber(): string
    {
        $lastId = static::max('id');
        $next = (int) $lastId + 1;

        return 'INV-'.str_pad((string) $next, 6, '0', STR_PAD_LEFT);
    }
}
