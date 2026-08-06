<?php

namespace App\Repositories;

use App\Contracts\VehicleRepositoryInterface;
use App\DTO\CreateVehicleDTO;
use App\Enums\VehicleStatus;
use App\Models\Vehicle;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class VehicleRepository implements VehicleRepositoryInterface
{
    public function getAllPaginated(int $perPage = 15, ?string $search = null, ?string $status = null): LengthAwarePaginator
    {
        $query = Vehicle::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('plate_number', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->latest()->paginate($perPage);
    }

    public function getAllAvailable(): Collection
    {
        return Vehicle::where('status', VehicleStatus::AVAILABLE->value)->get();
    }

    public function findById(string $id): ?Vehicle
    {
        return Vehicle::find($id);
    }

    public function create(CreateVehicleDTO $dto): Vehicle
    {
        return Vehicle::create([
            'plate_number' => $dto->plateNumber,
            'brand' => $dto->brand,
            'model' => $dto->model,
            'type' => $dto->type->value,
            'ownership' => $dto->ownership->value,
            'status' => $dto->status->value,
        ]);
    }

    public function updateStatus(string $id, string $status): bool
    {
        $vehicle = Vehicle::find($id);
        if (! $vehicle) {
            return false;
        }

        return $vehicle->update(['status' => $status]);
    }
}
