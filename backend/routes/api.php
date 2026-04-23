<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\TaxController;
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

// Public Auth Routes
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Customers
    Route::apiResource('customers', CustomerController::class);

    // Items
    Route::apiResource('items', ItemController::class);

    // Invoices
    Route::apiResource('invoices', InvoiceController::class);
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf']);

    // Tax settings (single-row resource)
    Route::get('tax', [TaxController::class, 'show']);
    Route::put('tax', [TaxController::class, 'update']);

    // Company settings (single-row resource). POST is accepted alongside PUT
    // because browsers can only send multipart/form-data via POST, so the
    // frontend uses POST with a hidden _method=PUT field for logo uploads.
    Route::get('company', [CompanyController::class, 'show']);
    Route::match(['put', 'post'], 'company', [CompanyController::class, 'update']);
});
