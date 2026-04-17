<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Single-row settings model holding the current SGST and CGST
 * percentages used by the invoice pipeline.
 */
class Tax extends Model
{
    use HasFactory;

    protected $fillable = ['sgst', 'cgst'];

    protected $casts = [
        'sgst' => 'decimal:2',
        'cgst' => 'decimal:2',
    ];

    /**
     * Return the active tax row, creating a default one if needed.
     */
    public static function current(): self
    {
        return static::query()->orderBy('id')->firstOrCreate([], [
            'sgst' => 0,
            'cgst' => 0,
        ]);
    }
}
