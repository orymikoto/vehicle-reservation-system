<?php

namespace App\Policies;

use App\Models\ReservationApproval;
use App\Models\User;

class ReservationApprovalPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isApprover() || $user->isAdmin();
    }

    public function approve(User $user, ReservationApproval $approval): bool
    {
        return $approval->approver_id === $user->id;
    }
}
