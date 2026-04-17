<?php

use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ItemController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All billing system API endpoints live here. They are prefixed with /api
| by Laravel's RouteServiceProvider.
|
*/

Route::get('/health', fn () => response()->json(['ok' => true]));

// Customers
Route::apiResource('customers', CustomerController::class);

// Items
Route::apiResource('items', ItemController::class);

// Invoices
Route::apiResource('invoices', InvoiceController::class);
Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf']);
