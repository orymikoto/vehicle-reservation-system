<?php

namespace App\Http\Controllers\Api;

use App\DTO\CreateMaintenanceLogDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateMaintenanceLogRequest;
use App\Services\MaintenanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function __construct(
        protected MaintenanceService $maintenanceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $logs = $this->maintenanceService->getPaginatedMaintenanceLogs(
            $request->integer('per_page', 15),
            $request->query('vehicle_id')
        );

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ]);
    }

    public function store(CreateMaintenanceLogRequest $request): JsonResponse
    {
        $dto = CreateMaintenanceLogDTO::fromArray($request->validated());
        $log = $this->maintenanceService->createMaintenanceLog($dto, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Maintenance log recorded successfully',
            'data' => $log,
        ], 201);
    }
}
