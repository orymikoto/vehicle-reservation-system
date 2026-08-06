<?php

namespace App\Repositories;

use App\Contracts\ApprovalRepositoryInterface;
use App\Enums\ApprovalStatus;
use App\Models\ReservationApproval;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ApprovalRepository implements ApprovalRepositoryInterface
{
    public function getPendingForApprover(string $approverId, int $perPage = 15): LengthAwarePaginator
    {
        return ReservationApproval::with(['reservation.user', 'reservation.vehicle', 'reservation.driver'])
            ->where('approver_id', $approverId)
            ->where('status', ApprovalStatus::PENDING->value)
            ->whereHas('reservation', function ($query) {
                // Approver can only see pending approvals where reservation current level matches this approval level
                $query->whereColumn('reservations.current_approval_level', 'reservation_approvals.approval_level');
            })
            ->latest()
            ->paginate($perPage);
    }

    public function findById(string $id): ?ReservationApproval
    {
        return ReservationApproval::with(['reservation.user', 'reservation.vehicle', 'reservation.driver', 'approver'])->find($id);
    }

    public function createApprovalStep(string $reservationId, string $approverId, int $level): ReservationApproval
    {
        return ReservationApproval::create([
            'reservation_id' => $reservationId,
            'approver_id' => $approverId,
            'approval_level' => $level,
            'status' => ApprovalStatus::PENDING->value,
        ]);
    }

    public function updateApprovalStatus(string $id, string $status, ?string $notes = null): bool
    {
        $approval = ReservationApproval::find($id);
        if (! $approval) {
            return false;
        }

        return $approval->update([
            'status' => $status,
            'notes' => $notes,
            'approved_at' => now(),
        ]);
    }
}
