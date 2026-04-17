<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Single-row model for the company details shown on every invoice.
 */
class Company extends Model
{
    use HasFactory;

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
            'company_name' => 'Your Company Pvt. Ltd.',
            'address' => '123 Business Street, City',
            'phone' => '+00 0000 0000',
            'email' => 'billing@example.com',
        ]);
    }
}
