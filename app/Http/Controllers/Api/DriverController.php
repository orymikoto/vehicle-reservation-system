<?php

namespace App\Http\Controllers\Api;

use App\DTO\CreateDriverDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateDriverRequest;
use App\Models\Driver;
use App\Services\DriverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function __construct(
        protected DriverService $driverService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Driver::class);

        $drivers = $this->driverService->getPaginatedDrivers(
            $request->integer('per_page', 15),
            $request->query('search')
        );

        return response()->json([
            'status' => 'success',
            'data' => $drivers,
        ]);
    }

    public function available(): JsonResponse
    {
        $this->authorize('viewAny', Driver::class);

        return response()->json([
            'status' => 'success',
            'data' => $this->driverService->getAvailableDrivers(),
        ]);
    }

    public function store(CreateDriverRequest $request): JsonResponse
    {
        $dto = CreateDriverDTO::fromArray($request->validated());
        $driver = $this->driverService->createDriver($dto, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Driver added successfully',
            'data' => $driver,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $driver = Driver::findOrFail($id);
        $this->authorize('update', $driver);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'license_number' => ['sometimes', 'string', 'max:50', "unique:drivers,license_number,{$id}"],
            'phone' => ['sometimes', 'string', 'max:20'],
            'status' => ['sometimes', 'string'],
            'location_id' => ['sometimes', 'uuid', 'exists:locations,id'],
        ]);

        $updated = $this->driverService->updateDriver($id, $validated, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Driver updated successfully',
            'data' => $updated,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $driver = Driver::findOrFail($id);
        $this->authorize('delete', $driver);

        $this->driverService->deleteDriver($id, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Driver deleted successfully',
        ]);
    }
}
