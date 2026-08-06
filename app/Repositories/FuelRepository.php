<?php

namespace App\Repositories;

use App\Contracts\FuelRepositoryInterface;
use App\DTO\CreateFuelLogDTO;
use App\Models\FuelLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FuelRepository implements FuelRepositoryInterface
{
    public function getAllPaginated(int $perPage = 15, ?string $vehicleId = null): LengthAwarePaginator
    {
        $query = FuelLog::with(['vehicle', 'driver']);

        if ($vehicleId) {
            $query->where('vehicle_id', $vehicleId);
        }

        return $query->latest('fuel_date')->paginate($perPage);
    }

    public function create(CreateFuelLogDTO $dto): FuelLog
    {
        return FuelLog::create([
            'vehicle_id' => $dto->vehicleId,
            'driver_id' => $dto->driverId,
            'fuel_date' => $dto->fuelDate,
            'fuel_amount' => $dto->fuelAmount,
            'fuel_cost' => $dto->fuelCost,
            'odometer' => $dto->odometer,
            'notes' => $dto->notes,
        ]);
    }
}
