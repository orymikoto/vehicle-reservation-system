<?php

namespace App\Services;

use App\Enums\DriverStatus;
use App\Enums\TransferStatus;
use App\Models\Driver;
use App\Models\DriverTransfer;
use App\Models\User;
use App\Repositories\DriverTransferRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DriverTransferService
{
    public function __construct(
        protected DriverTransferRepository $transferRepository
    ) {}

    public function getPaginatedTransfers(int $perPage = 15, ?string $locationId = null): LengthAwarePaginator
    {
        return $this->transferRepository->getPaginated($perPage, $locationId);
    }

    public function initiateTransfer(string $driverId, string $destinationLocationId, User $requester, ?string $remarks = null): DriverTransfer
    {
        return DB::transaction(function () use ($driverId, $destinationLocationId, $requester, $remarks) {
            $driver = Driver::findOrFail($driverId);

            if ($driver->location_id === $destinationLocationId) {
                throw new \InvalidArgumentException('Destination location must be different from origin location.');
            }

            if ($driver->status === DriverStatus::TRANSFERRED) {
                throw new \InvalidArgumentException('Driver is already in an active transfer process.');
            }

            $transfer = $this->transferRepository->create([
                'driver_id' => $driver->id,
                'origin_location_id' => $driver->location_id,
                'destination_location_id' => $destinationLocationId,
                'requested_by' => $requester->id,
                'status' => TransferStatus::PENDING_ORIGIN->value,
                'remarks' => $remarks,
            ]);

            $driver->update(['status' => DriverStatus::TRANSFERRED->value]);

            activity()
                ->causedBy($requester)
                ->performedOn($transfer)
                ->log("Initiated driver transfer for {$driver->name} to destination location.");

            return $transfer;
        });
    }

    public function approveOrigin(string $transferId, User $approver): DriverTransfer
    {
        return DB::transaction(function () use ($transferId, $approver) {
            $transfer = $this->transferRepository->findById($transferId);
            if (! $transfer || $transfer->status !== TransferStatus::PENDING_ORIGIN) {
                throw new \InvalidArgumentException('Transfer is not pending origin approval.');
            }

            $transfer = $this->transferRepository->update($transfer, [
                'origin_approved_by' => $approver->id,
                'status' => TransferStatus::PENDING_DESTINATION->value,
            ]);

            activity()
                ->causedBy($approver)
                ->performedOn($transfer)
                ->log("Approved origin location release for driver {$transfer->driver->name}.");

            return $transfer;
        });
    }

    public function approveDestination(string $transferId, User $approver): DriverTransfer
    {
        return DB::transaction(function () use ($transferId, $approver) {
            $transfer = $this->transferRepository->findById($transferId);
            if (! $transfer || $transfer->status !== TransferStatus::PENDING_DESTINATION) {
                throw new \InvalidArgumentException('Transfer is not pending destination approval.');
            }

            $transfer = $this->transferRepository->update($transfer, [
                'destination_approved_by' => $approver->id,
                'status' => TransferStatus::COMPLETED->value,
                'transferred_at' => now(),
            ]);

            // Finalize driver location assignment
            $transfer->driver->update([
                'location_id' => $transfer->destination_location_id,
                'status' => DriverStatus::ACTIVE->value,
            ]);

            activity()
                ->causedBy($approver)
                ->performedOn($transfer)
                ->log("Completed driver transfer for {$transfer->driver->name} to new location.");

            return $transfer;
        });
    }

    public function rejectTransfer(string $transferId, User $approver, ?string $reason = null): DriverTransfer
    {
        return DB::transaction(function () use ($transferId, $approver, $reason) {
            $transfer = $this->transferRepository->findById($transferId);
            if (! $transfer || in_array($transfer->status, [TransferStatus::COMPLETED, TransferStatus::REJECTED])) {
                throw new \InvalidArgumentException('Transfer cannot be rejected.');
            }

            $transfer = $this->transferRepository->update($transfer, [
                'status' => TransferStatus::REJECTED->value,
                'remarks' => $reason ? "Rejected: {$reason}" : $transfer->remarks,
            ]);

            $transfer->driver->update(['status' => DriverStatus::ACTIVE->value]);

            activity()
                ->causedBy($approver)
                ->performedOn($transfer)
                ->log("Rejected driver transfer for {$transfer->driver->name}.");

            return $transfer;
        });
    }
}
