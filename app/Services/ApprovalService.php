<?php

namespace App\Services;

use App\Contracts\ApprovalRepositoryInterface;
use App\Contracts\DriverRepositoryInterface;
use App\Contracts\ReservationRepositoryInterface;
use App\Contracts\VehicleRepositoryInterface;
use App\DTO\ApproveReservationDTO;
use App\DTO\RejectReservationDTO;
use App\Enums\ApprovalStatus;
use App\Enums\DriverStatus;
use App\Enums\ReservationStatus;
use App\Enums\VehicleStatus;
use App\Models\ReservationApproval;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApprovalService
{
    public function __construct(
        protected ApprovalRepositoryInterface $approvalRepository,
        protected ReservationRepositoryInterface $reservationRepository,
        protected VehicleRepositoryInterface $vehicleRepository,
        protected DriverRepositoryInterface $driverRepository
    ) {}

    public function getPendingApprovalsForUser(string $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->approvalRepository->getPendingForApprover($userId, $perPage);
    }

    public function approve(ApproveReservationDTO $dto, User $approver): ReservationApproval
    {
        $approval = $this->approvalRepository->findById($dto->approvalId);

        if (! $approval) {
            throw ValidationException::withMessages(['approval' => ['Approval record not found.']]);
        }

        if ($approval->approver_id !== $approver->id) {
            throw ValidationException::withMessages(['approval' => ['Unauthorized approver for this level.']]);
        }

        if ($approval->status !== ApprovalStatus::PENDING) {
            throw ValidationException::withMessages(['approval' => ['This approval step has already been processed.']]);
        }

        $reservation = $approval->reservation;

        if ($reservation->status === ReservationStatus::REJECTED) {
            throw ValidationException::withMessages(['reservation' => ['Rejected reservations cannot be approved.']]);
        }

        if ($reservation->current_approval_level !== $approval->approval_level) {
            throw ValidationException::withMessages(['reservation' => ['Current reservation status is not waiting for this level.']]);
        }

        return DB::transaction(function () use ($approval, $reservation, $dto, $approver) {
            $this->approvalRepository->updateApprovalStatus($approval->id, ApprovalStatus::APPROVED->value, $dto->notes);

            if ($approval->approval_level === 1) {
                // Advance to Level 2
                $this->reservationRepository->advanceApprovalLevel($reservation->id, 2);

                activity()
                    ->causedBy($approver)
                    ->performedOn($reservation)
                    ->log("Level 1 Approval granted for reservation {$reservation->reservation_code}");
            } elseif ($approval->approval_level === 2) {
                // Final Approval
                $this->reservationRepository->updateStatus($reservation->id, ReservationStatus::APPROVED->value);
                $this->vehicleRepository->updateStatus($reservation->vehicle_id, VehicleStatus::RESERVED->value);
                $this->driverRepository->updateStatus($reservation->driver_id, DriverStatus::ASSIGNED->value);

                activity()
                    ->causedBy($approver)
                    ->performedOn($reservation)
                    ->log("Final Level 2 Approval granted for reservation {$reservation->reservation_code}. Status set to APPROVED.");
            }

            return $approval->fresh(['reservation.user', 'reservation.vehicle', 'reservation.driver', 'approver']);
        });
    }

    public function reject(RejectReservationDTO $dto, User $approver): ReservationApproval
    {
        $approval = $this->approvalRepository->findById($dto->approvalId);

        if (! $approval) {
            throw ValidationException::withMessages(['approval' => ['Approval record not found.']]);
        }

        if ($approval->approver_id !== $approver->id) {
            throw ValidationException::withMessages(['approval' => ['Unauthorized approver for this level.']]);
        }

        if ($approval->status !== ApprovalStatus::PENDING) {
            throw ValidationException::withMessages(['approval' => ['This approval step has already been processed.']]);
        }

        $reservation = $approval->reservation;

        return DB::transaction(function () use ($approval, $reservation, $dto, $approver) {
            $this->approvalRepository->updateApprovalStatus($approval->id, ApprovalStatus::REJECTED->value, $dto->notes);
            $this->reservationRepository->updateStatus($reservation->id, ReservationStatus::REJECTED->value);

            activity()
                ->causedBy($approver)
                ->performedOn($reservation)
                ->log("Reservation {$reservation->reservation_code} REJECTED at Level {$approval->approval_level}. Reason: {$dto->notes}");

            return $approval->fresh(['reservation.user', 'reservation.vehicle', 'reservation.driver', 'approver']);
        });
    }
}
