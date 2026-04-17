<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    /**
     * GET /api/customers
     * List customers with optional search (name/phone/email) and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Customer::query();

            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%$search%")
                        ->orWhere('phone', 'like', "%$search%")
                        ->orWhere('email', 'like', "%$search%");
                });
            }

            $perPage = (int) $request->query('per_page', 10);
            $customers = $query->orderByDesc('id')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => CustomerResource::collection($customers),
                'meta' => [
                    'current_page' => $customers->currentPage(),
                    'last_page' => $customers->lastPage(),
                    'per_page' => $customers->perPage(),
                    'total' => $customers->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to list customers: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to fetch customers.'], 500);
        }
    }

    /**
     * POST /api/customers
     * Create a new customer.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        try {
            $customer = Customer::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully.',
                'data' => new CustomerResource($customer),
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Failed to create customer: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to create customer.'], 500);
        }
    }

    /**
     * GET /api/customers/{id}
     * Show a single customer by id.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $customer = Customer::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => new CustomerResource($customer),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => 'Customer not found.'], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to show customer: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to fetch customer.'], 500);
        }
    }

    /**
     * PUT /api/customers/{id}
     * Update an existing customer.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        try {
            $customer = Customer::findOrFail($id);
            $customer->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully.',
                'data' => new CustomerResource($customer),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => 'Customer not found.'], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to update customer: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to update customer.'], 500);
        }
    }

    /**
     * DELETE /api/customers/{id}
     * Delete a customer.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $customer = Customer::findOrFail($id);
            $customer->delete();

            return response()->json(['success' => true, 'message' => 'Customer deleted successfully.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => 'Customer not found.'], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to delete customer: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to delete customer.'], 500);
        }
    }
}
