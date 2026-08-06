<?php

namespace App\Services;

use App\Enums\TransferStatus;
use App\Enums\VehicleStatus;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleTransfer;
use App\Repositories\VehicleTransferRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class VehicleTransferService
{
    public function __construct(
        protected VehicleTransferRepository $transferRepository
    ) {}

    public function getPaginatedTransfers(int $perPage = 15, ?string $locationId = null): LengthAwarePaginator
    {
        return $this->transferRepository->getPaginated($perPage, $locationId);
    }

    public function initiateTransfer(string $vehicleId, string $destinationLocationId, User $requester, ?string $remarks = null): VehicleTransfer
    {
        return DB::transaction(function () use ($vehicleId, $destinationLocationId, $requester, $remarks) {
            $vehicle = Vehicle::findOrFail($vehicleId);

            if ($vehicle->location_id === $destinationLocationId) {
                throw new \InvalidArgumentException('Destination location must be different from origin location.');
            }

            if ($vehicle->status === VehicleStatus::IN_TRANSFER) {
                throw new \InvalidArgumentException('Vehicle is already in an active transfer process.');
            }

            $transfer = $this->transferRepository->create([
                'vehicle_id' => $vehicle->id,
                'origin_location_id' => $vehicle->location_id,
                'destination_location_id' => $destinationLocationId,
                'requested_by' => $requester->id,
                'status' => TransferStatus::PENDING_ORIGIN->value,
                'remarks' => $remarks,
            ]);

            $vehicle->update(['status' => VehicleStatus::IN_TRANSFER->value]);

            activity()
                ->causedBy($requester)
                ->performedOn($transfer)
                ->log("Initiated vehicle transfer for {$vehicle->plate_number} to destination location.");

            return $transfer;
        });
    }

    public function approveOrigin(string $transferId, User $approver): VehicleTransfer
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
                ->log("Approved origin location release for vehicle {$transfer->vehicle->plate_number}.");

            return $transfer;
        });
    }

    public function approveDestination(string $transferId, User $approver): VehicleTransfer
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

            // Finalize vehicle location assignment
            $transfer->vehicle->update([
                'location_id' => $transfer->destination_location_id,
                'status' => VehicleStatus::AVAILABLE->value,
            ]);

            activity()
                ->causedBy($approver)
                ->performedOn($transfer)
                ->log("Completed vehicle transfer for {$transfer->vehicle->plate_number} to new location.");

            return $transfer;
        });
    }

    public function rejectTransfer(string $transferId, User $approver, ?string $reason = null): VehicleTransfer
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

            $transfer->vehicle->update(['status' => VehicleStatus::AVAILABLE->value]);

            activity()
                ->causedBy($approver)
                ->performedOn($transfer)
                ->log("Rejected vehicle transfer for {$transfer->vehicle->plate_number}.");

            return $transfer;
        });
    }
}
