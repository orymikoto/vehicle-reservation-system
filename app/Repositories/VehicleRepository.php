<?php

namespace App\Repositories;

use App\Contracts\VehicleRepositoryInterface;
use App\DTO\CreateVehicleDTO;
use App\Enums\VehicleStatus;
use App\Models\Vehicle;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class VehicleRepository implements VehicleRepositoryInterface
{
    public function getAllPaginated(
        int $perPage = 15,
        ?string $search = null,
        ?string $status = null,
        ?string $locationId = null,
        string $sortBy = 'created_at',
        string $sortDirection = 'desc'
    ): LengthAwarePaginator {
        $query = Vehicle::with('location');

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $searchTerm = '%'.strtolower($search).'%';
            $isPgsql = DB::getDriverName() === 'pgsql';

            $query->where(function ($q) use ($search, $searchTerm, $isPgsql) {
                if ($isPgsql) {
                    $q->where('plate_number', 'ILIKE', "%{$search}%")
                        ->orWhere('brand', 'ILIKE', "%{$search}%")
                        ->orWhere('model', 'ILIKE', "%{$search}%");
                } else {
                    $q->whereRaw('LOWER(plate_number) LIKE ?', [$searchTerm])
                        ->orWhereRaw('LOWER(brand) LIKE ?', [$searchTerm])
                        ->orWhereRaw('LOWER(model) LIKE ?', [$searchTerm]);
                }
            });
        }

        $allowedSorts = ['plate_number', 'brand', 'model', 'type', 'ownership', 'status', 'created_at'];
        $sortColumn = in_array($sortBy, $allowedSorts) ? $sortBy : 'created_at';
        $direction = strtolower($sortDirection) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortColumn, $direction)->paginate($perPage);
    }

    public function getAllAvailable(): Collection
    {
        return Vehicle::where('status', VehicleStatus::AVAILABLE->value)->get();
    }

    public function findById(string $id): ?Vehicle
    {
        return Vehicle::with('location')->find($id);
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
