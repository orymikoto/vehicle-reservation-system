<?php

namespace App\Services;

use App\Contracts\FuelRepositoryInterface;
use App\DTO\CreateFuelLogDTO;
use App\Models\FuelLog;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FuelService
{
    public function __construct(
        protected FuelRepositoryInterface $fuelRepository
    ) {}

    public function getPaginatedFuelLogs(int $perPage = 15, ?string $vehicleId = null): LengthAwarePaginator
    {
        return $this->fuelRepository->getAllPaginated($perPage, $vehicleId);
    }

    public function createFuelLog(CreateFuelLogDTO $dto, User $user): FuelLog
    {
        $log = $this->fuelRepository->create($dto);

        activity()
            ->causedBy($user)
            ->performedOn($log)
            ->log("Fuel log created for vehicle ID {$log->vehicle_id}: {$log->fuel_amount} L (Cost: {$log->fuel_cost})");

        return $log;
    }
}
