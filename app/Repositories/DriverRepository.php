<?php

namespace App\Repositories;

use App\Contracts\DriverRepositoryInterface;
use App\DTO\CreateDriverDTO;
use App\Enums\DriverStatus;
use App\Models\Driver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class DriverRepository implements DriverRepositoryInterface
{
    public function getAllPaginated(int $perPage = 15, ?string $search = null): LengthAwarePaginator
    {
        $query = Driver::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('license_number', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate($perPage);
    }

    public function getAllAvailable(): Collection
    {
        return Driver::where('status', DriverStatus::AVAILABLE->value)->get();
    }

    public function findById(string $id): ?Driver
    {
        return Driver::find($id);
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
