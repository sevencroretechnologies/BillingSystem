<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvoiceCounter;
use Illuminate\Http\Request;

class InvoiceCounterController extends Controller
{
    public function show()
    {
        $counter = InvoiceCounter::firstOrCreate([], ['invoice_counter' => 1]);
        return response()->json(['success' => true, 'data' => $counter]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'invoice_counter' => 'required|integer|min:1'
        ]);

        $counter = InvoiceCounter::firstOrCreate([], ['invoice_counter' => 1]);
        $counter->update([
            'invoice_counter' => $request->invoice_counter
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Invoice counter updated successfully.',
            'data' => $counter
        ]);
    }
}
