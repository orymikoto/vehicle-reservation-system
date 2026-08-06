<?php

namespace App\Repositories;

use App\Contracts\DriverRepositoryInterface;
use App\DTO\CreateDriverDTO;
use App\Enums\DriverStatus;
use App\Models\Driver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class DriverRepository implements DriverRepositoryInterface
{
    public function getAllPaginated(
        int $perPage = 15,
        ?string $search = null,
        ?string $status = null,
        ?string $locationId = null,
        string $sortBy = 'created_at',
        string $sortDirection = 'desc'
    ): LengthAwarePaginator {
        $query = Driver::with('location');

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
                    $q->where('name', 'ILIKE', "%{$search}%")
                        ->orWhere('license_number', 'ILIKE', "%{$search}%")
                        ->orWhere('phone', 'ILIKE', "%{$search}%");
                } else {
                    $q->whereRaw('LOWER(name) LIKE ?', [$searchTerm])
                        ->orWhereRaw('LOWER(license_number) LIKE ?', [$searchTerm])
                        ->orWhereRaw('LOWER(phone) LIKE ?', [$searchTerm]);
                }
            });
        }

        $allowedSorts = ['name', 'license_number', 'phone', 'status', 'created_at'];
        $sortColumn = in_array($sortBy, $allowedSorts) ? $sortBy : 'created_at';
        $direction = strtolower($sortDirection) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortColumn, $direction)->paginate($perPage);
    }

    public function getAllAvailable(): Collection
    {
        return Driver::where('status', DriverStatus::ACTIVE->value)->get();
    }

    public function findById(string $id): ?Driver
    {
        return Driver::with('location')->find($id);
    }

    public function create(CreateDriverDTO $dto): Driver
    {
        return Driver::create([
            'name' => $dto->name,
            'license_number' => $dto->licenseNumber,
            'phone' => $dto->phone,
            'status' => $dto->status->value,
        ]);
    }

    public function updateStatus(string $id, string $status): bool
    {
        $driver = Driver::find($id);
        if (! $driver) {
            return false;
        }

        return $driver->update(['status' => $status]);
    }
}
