<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ItemController extends Controller
{
    /**
     * GET /api/items
     * List items with optional search and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Item::query();

            if ($search = $request->query('search')) {
                $query->where('name', 'like', "%$search%")
                    ->orWhere('description', 'like', "%$search%");
            }

            $perPage = (int) $request->query('per_page', 10);
            $items = $query->orderByDesc('id')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => ItemResource::collection($items),
                'meta' => [
                    'current_page' => $items->currentPage(),
                    'last_page' => $items->lastPage(),
                    'per_page' => $items->perPage(),
                    'total' => $items->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to list items: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to fetch items.'], 500);
        }
    }

    /**
     * POST /api/items
     * Create a new item.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            $item = Item::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Item created successfully.',
                'data' => new ItemResource($item),
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Failed to create item: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to create item.'], 500);
        }
    }

    /**
     * GET /api/items/{id}
     * Show a single item by id.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $item = Item::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => new ItemResource($item),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => 'Item not found.'], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to show item: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to fetch item.'], 500);
        }
    }

    /**
     * PUT /api/items/{id}
     * Update an existing item.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            $item = Item::findOrFail($id);
            $item->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Item updated successfully.',
                'data' => new ItemResource($item),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => 'Item not found.'], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to update item: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to update item.'], 500);
        }
    }

    /**
     * DELETE /api/items/{id}
     * Delete an item.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $item = Item::findOrFail($id);
            $item->delete();

            return response()->json(['success' => true, 'message' => 'Item deleted successfully.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => 'Item not found.'], 404);
        } catch (\Throwable $e) {
            Log::error('Failed to delete item: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to delete item.'], 500);
        }
    }
}
