<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaxResource;
use App\Models\Tax;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Manages the single-row taxes table (SGST + CGST percentages used on
 * every invoice). Exposes GET + PUT so the front-end can read and edit
 * the current configuration without worrying about ids.
 */
class TaxController extends Controller
{
    /**
     * GET /api/tax
     * Return the current tax configuration (auto-created if missing).
     */
    public function show(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new TaxResource(Tax::current()),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch tax settings: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to fetch tax settings.'], 500);
        }
    }

    /**
     * PUT /api/tax
     * Update the SGST / CGST percentages.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sgst' => 'required|numeric|min:0|max:100',
            'cgst' => 'required|numeric|min:0|max:100',
        ]);

        try {
            $tax = Tax::current();
            $tax->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tax settings updated successfully.',
                'data' => new TaxResource($tax),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update tax settings: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to update tax settings.'], 500);
        }
    }
}
