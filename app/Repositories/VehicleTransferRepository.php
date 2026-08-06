<?php

namespace App\Repositories;

use App\Models\VehicleTransfer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class VehicleTransferRepository
{
    public function getPaginated(int $perPage = 15, ?string $locationId = null): LengthAwarePaginator
    {
        $query = VehicleTransfer::with([
            'vehicle',
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

    public function findById(string $id): ?VehicleTransfer
    {
        return VehicleTransfer::with(['vehicle', 'originLocation', 'destinationLocation'])->find($id);
    }

    public function create(array $data): VehicleTransfer
    {
        return VehicleTransfer::create($data);
    }

    public function update(VehicleTransfer $transfer, array $data): VehicleTransfer
    {
        $transfer->update($data);

        return $transfer->fresh();
    }
}
