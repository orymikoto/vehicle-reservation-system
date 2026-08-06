<?php

namespace App\Contracts;

use App\DTO\CreateMaintenanceLogDTO;
use App\Models\MaintenanceLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface MaintenanceRepositoryInterface
{
    public function getAllPaginated(int $perPage = 15, ?string $vehicleId = null): LengthAwarePaginator;

    public function create(CreateMaintenanceLogDTO $dto): MaintenanceLog;
}
