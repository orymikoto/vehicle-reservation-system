<?php

namespace App\Contracts;

use App\DTO\CreateFuelLogDTO;
use App\Models\FuelLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface FuelRepositoryInterface
{
    public function getAllPaginated(int $perPage = 15, ?string $vehicleId = null): LengthAwarePaginator;

    public function create(CreateFuelLogDTO $dto): FuelLog;
}
