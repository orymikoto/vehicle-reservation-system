<?php

namespace App\Contracts;

use App\DTO\CreateDriverDTO;
use App\Models\Driver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface DriverRepositoryInterface
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

    public function findById(string $id): ?Driver;

    public function create(CreateDriverDTO $dto): Driver;

    public function updateStatus(string $id, string $status): bool;
}
