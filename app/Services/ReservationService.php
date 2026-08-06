<?php

namespace App\Services;

use App\Contracts\ApprovalRepositoryInterface;
use App\Contracts\DriverRepositoryInterface;
use App\Contracts\ReservationRepositoryInterface;
use App\Contracts\VehicleRepositoryInterface;
use App\DTO\CreateReservationDTO;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ReservationService
{
    public function __construct(
        protected ReservationRepositoryInterface $reservationRepository,
        protected ApprovalRepositoryInterface $approvalRepository,
        protected VehicleRepositoryInterface $vehicleRepository,
        protected DriverRepositoryInterface $driverRepository
    ) {}

    public function getPaginatedReservations(int $perPage = 15, ?string $search = null, ?string $status = null): LengthAwarePaginator
    {
        return $this->reservationRepository->getAllPaginated($perPage, $search, $status);
    }

    public function createReservation(CreateReservationDTO $dto, User $creator): Reservation
    {
        if ($dto->approver1Id === $dto->approver2Id) {
            throw ValidationException::withMessages([
                'approver_2_id' => ['Level 1 and Level 2 approvers must be different users.'],
            ]);
        }

        return DB::transaction(function () use ($dto, $creator) {
            $code = 'RSV-'.date('Ymd').'-'.strtoupper(Str::random(4));

            $reservation = $this->reservationRepository->create($dto, $code);

            // Create Level 1 & Level 2 Approval Steps
            $this->approvalRepository->createApprovalStep($reservation->id, $dto->approver1Id, 1);
            $this->approvalRepository->createApprovalStep($reservation->id, $dto->approver2Id, 2);

            activity()
                ->causedBy($creator)
                ->performedOn($reservation)
                ->log("Reservation created: {$reservation->reservation_code} for purpose {$reservation->purpose}");

            return $reservation->load(['user', 'vehicle', 'driver', 'approvals.approver']);
        });
    }
}
