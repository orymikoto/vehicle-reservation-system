<?php

namespace App\Http\Controllers\Api;

use App\DTO\CreateVehicleDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateVehicleRequest;
use App\Models\Vehicle;
use App\Services\VehicleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function __construct(
        protected VehicleService $vehicleService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Vehicle::class);

        $vehicles = $this->vehicleService->getPaginatedVehicles(
            $request->integer('per_page', 15),
            $request->query('search'),
            $request->query('status')
        );

        return response()->json([
            'status' => 'success',
            'data' => $vehicles,
        ]);
    }

    public function available(): JsonResponse
    {
        $this->authorize('viewAny', Vehicle::class);

        return response()->json([
            'status' => 'success',
            'data' => $this->vehicleService->getAvailableVehicles(),
        ]);
    }

    public function store(CreateVehicleRequest $request): JsonResponse
    {
        $dto = CreateVehicleDTO::fromArray($request->validated());
        $vehicle = $this->vehicleService->createVehicle($dto, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Vehicle added successfully',
            'data' => $vehicle,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $vehicle = Vehicle::findOrFail($id);
        $this->authorize('update', $vehicle);

        $validated = $request->validate([
            'plate_number' => ['sometimes', 'string', 'max:20', "unique:vehicles,plate_number,{$id}"],
            'brand' => ['sometimes', 'string', 'max:100'],
            'model' => ['sometimes', 'string', 'max:100'],
            'type' => ['sometimes', 'string'],
            'ownership' => ['sometimes', 'string'],
            'location_id' => ['sometimes', 'uuid', 'exists:locations,id'],
            'status' => ['sometimes', 'string'],
        ]);

        $updated = $this->vehicleService->updateVehicle($id, $validated, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Vehicle updated successfully',
            'data' => $updated,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $vehicle = Vehicle::findOrFail($id);
        $this->authorize('delete', $vehicle);

        $this->vehicleService->deleteVehicle($id, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Vehicle deleted successfully',
        ]);
    }
}
