<?php

namespace App\Services;

use App\Contracts\MaintenanceRepositoryInterface;
use App\DTO\CreateMaintenanceLogDTO;
use App\Models\MaintenanceLog;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MaintenanceService
{
    public function __construct(
        protected MaintenanceRepositoryInterface $maintenanceRepository
    ) {}

    public function getPaginatedMaintenanceLogs(int $perPage = 15, ?string $vehicleId = null): LengthAwarePaginator
    {
        return $this->maintenanceRepository->getAllPaginated($perPage, $vehicleId);
    }

    public function createMaintenanceLog(CreateMaintenanceLogDTO $dto, User $user): MaintenanceLog
    {
        $log = $this->maintenanceRepository->create($dto);

        activity()
            ->causedBy($user)
            ->performedOn($log)
            ->log("Maintenance log created for vehicle ID {$log->vehicle_id}: {$log->service_type} at workshop {$log->workshop}");

        return $log;
    }
}
