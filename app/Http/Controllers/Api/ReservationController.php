<?php

namespace App\Http\Controllers\Api;

use App\DTO\CreateReservationDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateReservationRequest;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $reservationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Reservation::class);

        $reservations = $this->reservationService->getPaginatedReservations(
            $request->integer('per_page', 15),
            $request->query('search'),
            $request->query('status'),
            $request->query('location_id'),
            $request->query('sort_by', 'created_at'),
            $request->query('sort_direction', 'desc')
        );

        return response()->json([
            'status' => 'success',
            'data' => $reservations,
        ]);
    }

    public function store(CreateReservationRequest $request): JsonResponse
    {
        $dto = CreateReservationDTO::fromRequest($request->validated(), $request->user()->id);
        $reservation = $this->reservationService->createReservation($dto, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Reservation created successfully and submitted for Level 1 approval.',
            'data' => $reservation,
        ], 201);
    }
}
