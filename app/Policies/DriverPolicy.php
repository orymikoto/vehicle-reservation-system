<?php

namespace App\Policies;

use App\Models\Driver;
use App\Models\User;

class DriverPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Driver $driver): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isVehicleAdmin();
    }

    public function update(User $user, Driver $driver): bool
    {
        return $user->isSuperAdmin() || ($user->isVehicleAdmin() && $user->location_id === $driver->location_id);
    }

    public function delete(User $user, Driver $driver): bool
    {
        return $user->isSuperAdmin() || ($user->isVehicleAdmin() && $user->location_id === $driver->location_id);
    }
}
