<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DriverTransferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverTransferController extends Controller
{
    public function __construct(
        protected DriverTransferService $transferService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $locationId = $user->isSuperAdmin() ? $request->query('location_id') : $user->location_id;

        $transfers = $this->transferService->getPaginatedTransfers(
            $request->integer('per_page', 15),
            $locationId
        );

        return response()->json([
            'status' => 'success',
            'data' => $transfers,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'driver_id' => ['required', 'uuid', 'exists:drivers,id'],
            'destination_location_id' => ['required', 'uuid', 'exists:locations,id'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $transfer = $this->transferService->initiateTransfer(
            $validated['driver_id'],
            $validated['destination_location_id'],
            $request->user(),
            $validated['remarks'] ?? null
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Driver transfer request initiated successfully.',
            'data' => $transfer,
        ], 201);
    }

    public function approveOrigin(Request $request, string $id): JsonResponse
    {
        $transfer = $this->transferService->approveOrigin($id, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Origin location driver release approved.',
            'data' => $transfer,
        ]);
    }

    public function approveDestination(Request $request, string $id): JsonResponse
    {
        $transfer = $this->transferService->approveDestination($id, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Destination location driver transfer completed successfully.',
            'data' => $transfer,
        ]);
    }

    public function reject(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $transfer = $this->transferService->rejectTransfer($id, $request->user(), $validated['remarks'] ?? null);

        return response()->json([
            'status' => 'success',
            'message' => 'Driver transfer rejected.',
            'data' => $transfer,
        ]);
    }
}
