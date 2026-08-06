<?php

namespace App\Repositories;

use App\Contracts\MaintenanceRepositoryInterface;
use App\DTO\CreateMaintenanceLogDTO;
use App\Models\MaintenanceLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MaintenanceRepository implements MaintenanceRepositoryInterface
{
    public function getAllPaginated(int $perPage = 15, ?string $vehicleId = null): LengthAwarePaginator
    {
        $query = MaintenanceLog::with('vehicle');

        if ($vehicleId) {
            $query->where('vehicle_id', $vehicleId);
        }

        return $query->latest('service_date')->paginate($perPage);
    }

    public function create(CreateMaintenanceLogDTO $dto): MaintenanceLog
    {
        return MaintenanceLog::create([
            'vehicle_id' => $dto->vehicleId,
            'service_date' => $dto->serviceDate,
            'service_type' => $dto->serviceType,
            'workshop' => $dto->workshop,
            'cost' => $dto->cost,
            'next_service_date' => $dto->nextServiceDate,
            'notes' => $dto->notes,
        ]);
    }
}
