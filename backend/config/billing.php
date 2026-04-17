<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Company Details
    |--------------------------------------------------------------------------
    |
    | These values are rendered on the PDF invoice and can be customised
    | through the .env file without touching code.
    |
    */
    'company' => [
        'name' => env('COMPANY_NAME', 'Your Company Pvt. Ltd.'),
        'address' => env('COMPANY_ADDRESS', '123 Business Street, City, State'),
        'phone' => env('COMPANY_PHONE', '+00 0000 0000'),
        'email' => env('COMPANY_EMAIL', 'billing@example.com'),
        'website' => env('COMPANY_WEBSITE', 'www.example.com'),
        'tax_id' => env('COMPANY_TAX_ID', ''),
        'currency' => env('COMPANY_CURRENCY', 'INR'),
        'currency_symbol' => env('COMPANY_CURRENCY_SYMBOL', '₹'),
    ],
];
