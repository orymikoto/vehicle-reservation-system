<?php

namespace App\Repositories;

use App\Contracts\ReservationRepositoryInterface;
use App\DTO\CreateReservationDTO;
use App\Enums\ReservationStatus;
use App\Models\Reservation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReservationRepository implements ReservationRepositoryInterface
{
    public function getAllPaginated(
        int $perPage = 15,
        ?string $search = null,
        ?string $status = null,
        ?string $locationId = null,
        string $sortBy = 'created_at',
        string $sortDirection = 'desc'
    ): LengthAwarePaginator {
        $query = Reservation::with(['user', 'vehicle', 'driver', 'location', 'approvals.approver']);

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $searchTerm = '%'.strtolower($search).'%';
            $query->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(reservation_code) LIKE ?', [$searchTerm])
                    ->orWhereRaw('LOWER(purpose) LIKE ?', [$searchTerm])
                    ->orWhereRaw('LOWER(destination) LIKE ?', [$searchTerm])
                    ->orWhereHas('vehicle', function ($vq) use ($searchTerm) {
                        $vq->whereRaw('LOWER(plate_number) LIKE ?', [$searchTerm])
                            ->orWhereRaw('LOWER(brand) LIKE ?', [$searchTerm])
                            ->orWhereRaw('LOWER(model) LIKE ?', [$searchTerm]);
                    });
            });
        }

        $allowedSorts = ['reservation_code', 'start_datetime', 'end_datetime', 'status', 'created_at'];
        $sortColumn = in_array($sortBy, $allowedSorts) ? $sortBy : 'created_at';
        $direction = strtolower($sortDirection) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortColumn, $direction)->paginate($perPage);
    }

    public function findById(string $id): ?Reservation
    {
        return Reservation::with(['user', 'vehicle', 'driver', 'location', 'approvals.approver'])->find($id);
    }

    public function create(CreateReservationDTO $dto, string $reservationCode): Reservation
    {
        return Reservation::create([
            'reservation_code' => $reservationCode,
            'user_id' => $dto->userId,
            'vehicle_id' => $dto->vehicleId,
            'driver_id' => $dto->driverId,
            'location_id' => $dto->locationId,
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
