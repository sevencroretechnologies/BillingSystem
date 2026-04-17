<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Item;
use App\Models\Tax;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with sample customers, items and
     * the default single-row tax / company settings so the UI has
     * something to show on a fresh install.
     */
    public function run(): void
    {
        if (Customer::count() === 0) {
            Customer::create([
                'name' => 'Acme Corp',
                'phone' => '9999999999',
                'email' => 'billing@acme.test',
                'address' => '123 Market Street, Bengaluru, KA',
            ]);
            Customer::create([
                'name' => 'Globex Ltd',
                'phone' => '8888888888',
                'email' => 'accounts@globex.test',
                'address' => '42 Residency Road, Mumbai, MH',
            ]);
        }

        if (Item::count() === 0) {
            Item::create([
                'name' => 'Consulting Hour',
                'description' => 'General consulting service, billed per hour.',
            ]);
            Item::create([
                'name' => 'Software License',
                'description' => 'Annual software license per seat.',
            ]);
            Item::create([
                'name' => 'Printer Paper (A4)',
                'description' => 'Ream of 500 sheets, 80 GSM.',
            ]);
        }

        // Default SGST / CGST of 9% each (18% combined) — matches the
        // common GST rate for standard services in India.
        if (Tax::count() === 0) {
            Tax::create(['sgst' => 9.00, 'cgst' => 9.00]);
        }

        if (Company::count() === 0) {
            Company::create([
                'company_name' => 'Your Company Pvt. Ltd.',
                'address' => '123 Business Street, City, State',
                'phone' => '+00 0000 0000',
                'email' => 'billing@example.com',
            ]);
        }
    }
}
