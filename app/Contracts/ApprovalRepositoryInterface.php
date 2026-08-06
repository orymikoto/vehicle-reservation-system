<?php

namespace App\Contracts;

use App\Models\ReservationApproval;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ApprovalRepositoryInterface
{
    public function getPendingForApprover(string $approverId, int $perPage = 15): LengthAwarePaginator;

    public function findById(string $id): ?ReservationApproval;

    public function createApprovalStep(string $reservationId, string $approverId, int $level): ReservationApproval;

    public function updateApprovalStatus(string $id, string $status, ?string $notes = null): bool;
}
