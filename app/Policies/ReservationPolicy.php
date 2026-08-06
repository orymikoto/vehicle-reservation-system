<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Reservation $reservation): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $reservation->location_id === $user->location_id;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isVehicleAdmin();
    }
}
