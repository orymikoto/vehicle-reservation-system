<?php

namespace App\Services;

use App\Contracts\VehicleRepositoryInterface;
use App\DTO\CreateVehicleDTO;
use App\Models\Vehicle;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class VehicleService
{
    public function __construct(
        protected VehicleRepositoryInterface $vehicleRepository
    ) {}

    public function getPaginatedVehicles(int $perPage = 15, ?string $search = null, ?string $status = null): LengthAwarePaginator
    {
        return $this->vehicleRepository->getAllPaginated($perPage, $search, $status);
    }

    public function getAvailableVehicles(): Collection
    {
        return $this->vehicleRepository->getAllAvailable();
    }

    public function createVehicle(CreateVehicleDTO $dto, $user): Vehicle
    {
        $vehicle = $this->vehicleRepository->create($dto);

        activity()
            ->causedBy($user)
            ->performedOn($vehicle)
            ->log("Vehicle created: {$vehicle->plate_number} ({$vehicle->brand} {$vehicle->model})");

        return $vehicle;
    }

    public function updateVehicle(string $id, array $data, $user): Vehicle
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update($data);

        activity()
            ->causedBy($user)
            ->performedOn($vehicle)
            ->log("Vehicle updated: {$vehicle->plate_number}");

        return $vehicle->fresh(['location']);
    }

    public function deleteVehicle(string $id, $user): bool
    {
        $vehicle = Vehicle::findOrFail($id);

        activity()
            ->causedBy($user)
            ->performedOn($vehicle)
            ->log("Vehicle deleted: {$vehicle->plate_number}");

        return $vehicle->delete();
    }
}
