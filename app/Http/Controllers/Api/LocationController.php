<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function __construct(
        protected LocationService $locationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        // Public/Active location list for selectors
        if ($request->boolean('active_only', true)) {
            $locations = $this->locationService->getAllActiveLocations();

            return response()->json([
                'status' => 'success',
                'data' => $locations,
            ]);
        }

        $this->authorize('viewAny', Location::class);

        $locations = $this->locationService->getPaginatedLocations(
            $request->integer('per_page', 15),
            $request->query('search')
        );

        return response()->json([
            'status' => 'success',
            'data' => $locations,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Location::class);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20', 'unique:locations,code'],
            'name' => ['required', 'string', 'max:255'],
            'region' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:HEADQUARTERS,BRANCH,MINE'],
            'is_active' => ['boolean'],
        ]);

        $location = $this->locationService->createLocation($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Location created successfully.',
            'data' => $location,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $this->authorize('update', Location::class);

        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:20', "unique:locations,code,{$id}"],
            'name' => ['sometimes', 'string', 'max:255'],
            'region' => ['sometimes', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'type' => ['sometimes', 'string', 'in:HEADQUARTERS,BRANCH,MINE'],
            'is_active' => ['boolean'],
        ]);

        $location = $this->locationService->updateLocation($id, $validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Location updated successfully.',
            'data' => $location,
        ]);
    }
}
