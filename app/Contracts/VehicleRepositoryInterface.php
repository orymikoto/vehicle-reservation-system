<?php

namespace App\Contracts;

use App\DTO\CreateVehicleDTO;
use App\Models\Vehicle;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface VehicleRepositoryInterface
{
    public function getAllPaginated(
        int $perPage = 15,
        ?string $search = null,
        ?string $status = null,
        ?string $locationId = null,
        string $sortBy = 'created_at',
        string $sortDirection = 'desc'
    ): LengthAwarePaginator;

    public function getAllAvailable(): Collection;

    public function findById(string $id): ?Vehicle;

    public function create(CreateVehicleDTO $dto): Vehicle;

    public function updateStatus(string $id, string $status): bool;
}
