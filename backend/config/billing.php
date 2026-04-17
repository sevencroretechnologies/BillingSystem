<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Invoice Presentation
    |--------------------------------------------------------------------------
    |
    | Company details now live in the `company` database table and are
    | managed through the /api/company endpoint. Only presentation-level
    | values that don't belong to a tenant remain here.
    |
    */
    'currency' => env('BILLING_CURRENCY', 'INR'),
    'currency_symbol' => env('BILLING_CURRENCY_SYMBOL', '₹'),
];
