<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Manages the single-row company table holding the name, address, phone,
 * email and logo shown at the top of every invoice.
 */
class CompanyController extends Controller
{
    /**
     * GET /api/company
     * Return the current company record (auto-created if missing).
     */
    public function show(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new CompanyResource(Company::current()),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to fetch company: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to fetch company.'], 500);
        }
    }

    /**
     * POST /api/company   (multipart allowed for logo uploads)
     * PUT  /api/company
     *
     * Both methods are routed here — `POST` is exposed because browsers
     * cannot send `multipart/form-data` with a `PUT` request directly,
     * so the React form posts with a `_method=PUT` field.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|digits:10',
            'whatsapp_no' => 'nullable|digits:10',
            'email' => 'nullable|email|max:255',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,gif,svg,webp|max:2048',
            'remove_logo' => 'nullable|boolean',
            'k2_recipient_code' => 'nullable|string|max:50',
            'gstin' => 'nullable|string|max:20',
            'pan' => 'nullable|string|max:15',
            'signature' => 'nullable|image|mimes:jpg,jpeg,png,gif,svg,webp|max:2048',
            'remove_signature' => 'nullable|boolean',
        ]);

        try {
            $company = Company::current();

            if ($request->hasFile('logo')) {
                if ($company->logo) {
                    Storage::disk('public')->delete($company->logo);
                }
                $validated['logo'] = $request->file('logo')->store('company', 'public');
            } elseif ($request->boolean('remove_logo')) {
                if ($company->logo) {
                    Storage::disk('public')->delete($company->logo);
                }
                $validated['logo'] = null;
            }

            // Handle signature image upload / removal
            if ($request->hasFile('signature')) {
                if ($company->signature) {
                    Storage::disk('public')->delete($company->signature);
                }
                $validated['signature'] = $request->file('signature')->store('company/signatures', 'public');
            } elseif ($request->boolean('remove_signature')) {
                if ($company->signature) {
                    Storage::disk('public')->delete($company->signature);
                }
                $validated['signature'] = null;
            }

            unset($validated['remove_logo'], $validated['remove_signature']);
            $company->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Company details updated successfully.',
                'data' => new CompanyResource($company->fresh()),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update company: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to update company.'], 500);
        }
    }
}
