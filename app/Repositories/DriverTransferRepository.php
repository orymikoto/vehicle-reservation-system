<?php

namespace App\Repositories;

use App\Models\DriverTransfer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DriverTransferRepository
{
    public function getPaginated(int $perPage = 15, ?string $locationId = null): LengthAwarePaginator
    {
        $query = DriverTransfer::with([
            'driver',
            'originLocation',
            'destinationLocation',
            'requester',
            'originApprover',
            'destinationApprover',
        ]);

        if ($locationId) {
            $query->where(function ($q) use ($locationId) {
                $q->where('origin_location_id', $locationId)
                    ->orWhere('destination_location_id', $locationId);
            });
        }

        return $query->latest()->paginate($perPage);
    }

    public function findById(string $id): ?DriverTransfer
    {
        return DriverTransfer::with(['driver', 'originLocation', 'destinationLocation'])->find($id);
    }

    public function create(array $data): DriverTransfer
    {
        return DriverTransfer::create($data);
    }

    public function update(DriverTransfer $transfer, array $data): DriverTransfer
    {
        $transfer->update($data);

        return $transfer->fresh();
    }
}
