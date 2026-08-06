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

    public function getPaginatedDrivers(int $perPage = 15, ?string $search = null): LengthAwarePaginator
    {
        return $this->driverRepository->getAllPaginated($perPage, $search);
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
}
