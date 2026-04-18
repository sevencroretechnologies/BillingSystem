<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Single-row model for the company details shown on every invoice.
 */
class Company extends Model
{
    use HasFactory, SoftDeletes;

    // Custom table name (singular to match the business meaning).
    protected $table = 'company';

    protected $fillable = [
        'company_name',
        'address',
        'phone',
        'email',
        'logo',
    ];

    /**
     * Return the active company row, creating a default one if needed so
     * the app never ends up with no company on a fresh install.
     */
    public static function current(): self
    {
        return static::query()->orderBy('id')->firstOrCreate([], [
            'company_name' => env('COMPANY_NAME', 'Your Company Pvt. Ltd.'),
            'address' => env('COMPANY_ADDRESS', '123 Business Street, City'),
            'phone' => env('COMPANY_PHONE', '+00 0000 0000'),
            'email' => env('COMPANY_EMAIL', 'billing@example.com'),
        ]);
    }
}
