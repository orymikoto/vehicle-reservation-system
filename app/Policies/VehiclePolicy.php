<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehicle;

class VehiclePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Vehicle $vehicle): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isVehicleAdmin();
    }

    public function update(User $user, Vehicle $vehicle): bool
    {
        return $user->isSuperAdmin() || ($user->isVehicleAdmin() && $user->location_id === $vehicle->location_id);
    }

    public function delete(User $user, Vehicle $vehicle): bool
    {
        return $user->isSuperAdmin() || ($user->isVehicleAdmin() && $user->location_id === $vehicle->location_id);
    }
}
