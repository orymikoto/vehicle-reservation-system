<?php

namespace App\Repositories;

use App\Contracts\ReservationRepositoryInterface;
use App\DTO\CreateReservationDTO;
use App\Enums\ReservationStatus;
use App\Models\Reservation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReservationRepository implements ReservationRepositoryInterface
{
    public function getAllPaginated(int $perPage = 15, ?string $search = null, ?string $status = null): LengthAwarePaginator
    {
        $query = Reservation::with(['user', 'vehicle', 'driver', 'approvals.approver']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('reservation_code', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%")
                    ->orWhere('destination', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->latest()->paginate($perPage);
    }

    public function findById(string $id): ?Reservation
    {
        return Reservation::with(['user', 'vehicle', 'driver', 'approvals.approver'])->find($id);
    }

    public function create(CreateReservationDTO $dto, string $reservationCode): Reservation
    {
        return Reservation::create([
            'reservation_code' => $reservationCode,
            'user_id' => $dto->userId,
            'vehicle_id' => $dto->vehicleId,
            'driver_id' => $dto->driverId,
            'purpose' => $dto->purpose,
            'destination' => $dto->destination,
            'start_datetime' => $dto->startDatetime,
            'end_datetime' => $dto->endDatetime,
            'status' => ReservationStatus::PENDING->value,
            'current_approval_level' => 1,
        ]);
    }

    public function updateStatus(string $id, string $status): bool
    {
        $reservation = Reservation::find($id);
        if (! $reservation) {
            return false;
        }

        return $reservation->update(['status' => $status]);
    }

    public function advanceApprovalLevel(string $id, int $nextLevel): bool
    {
        $reservation = Reservation::find($id);
        if (! $reservation) {
            return false;
        }

        return $reservation->update(['current_approval_level' => $nextLevel]);
    }
}
