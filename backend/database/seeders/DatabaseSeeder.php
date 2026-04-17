<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Item;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with a few sample customers and items
     * so the UI has something to show on a fresh install.
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
                'price' => 1500.00,
                'tax_percent' => 18.00,
                'description' => 'General consulting service, billed per hour.',
            ]);
            Item::create([
                'name' => 'Software License',
                'price' => 9999.00,
                'tax_percent' => 18.00,
                'description' => 'Annual software license per seat.',
            ]);
            Item::create([
                'name' => 'Printer Paper (A4)',
                'price' => 250.00,
                'tax_percent' => 12.00,
                'description' => 'Ream of 500 sheets, 80 GSM.',
            ]);
        }
    }
}
