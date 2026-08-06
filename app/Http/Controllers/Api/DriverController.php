<?php

namespace App\Http\Controllers\Api;

use App\DTO\CreateDriverDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateDriverRequest;
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
}
