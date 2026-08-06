<?php

namespace App\Services;

use App\Contracts\DriverRepositoryInterface;
use App\DTO\CreateDriverDTO;
use App\Models\Driver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class DriverService
{
    public function __construct(
        protected DriverRepositoryInterface $driverRepository
    ) {}

    public function getPaginatedDrivers(
        int $perPage = 15,
        ?string $search = null,
        ?string $status = null,
        ?string $locationId = null,
        string $sortBy = 'created_at',
        string $sortDirection = 'desc'
    ): LengthAwarePaginator {
        return $this->driverRepository->getAllPaginated(
            $perPage,
            $search,
            $status,
            $locationId,
            $sortBy,
            $sortDirection
        );
    }

    public function getAvailableDrivers(): Collection
    {
        return $this->driverRepository->getAllAvailable();
    }

    public function createDriver(CreateDriverDTO $dto, $user): Driver
    {
        $driver = $this->driverRepository->create($dto);

        activity()
            ->causedBy($user)
            ->performedOn($driver)
            ->log("Driver registered: {$driver->name} (License: {$driver->license_number})");

        return $driver;
    }

    public function updateDriver(string $id, array $data, $user): Driver
    {
        $driver = Driver::findOrFail($id);
        $driver->update($data);

        activity()
            ->causedBy($user)
            ->performedOn($driver)
            ->log("Driver updated: {$driver->name}");

        return $driver->fresh(['location']);
    }

    public function deleteDriver(string $id, $user): bool
    {
        $driver = Driver::findOrFail($id);

        activity()
            ->causedBy($user)
            ->performedOn($driver)
            ->log("Driver deleted: {$driver->name}");

        return $driver->delete();
    }
}
