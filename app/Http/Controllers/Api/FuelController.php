<?php

namespace App\Http\Controllers\Api;

use App\DTO\CreateFuelLogDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateFuelLogRequest;
use App\Services\FuelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FuelController extends Controller
{
    public function __construct(
        protected FuelService $fuelService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $logs = $this->fuelService->getPaginatedFuelLogs(
            $request->integer('per_page', 15),
            $request->query('vehicle_id')
        );

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ]);
    }

    public function store(CreateFuelLogRequest $request): JsonResponse
    {
        $dto = CreateFuelLogDTO::fromArray($request->validated());
        $log = $this->fuelService->createFuelLog($dto, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Fuel log saved successfully',
            'data' => $log,
        ], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (! ($user->isSuperAdmin() || $user->isVehicleAdmin())) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete fuel log records.',
            ], 403);
        }

        $this->fuelService->deleteFuelLog($id, $user);

        return response()->json([
            'status' => 'success',
            'message' => 'Fuel log deleted successfully',
        ]);
    }
}
