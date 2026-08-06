<?php

namespace App\DTO;

readonly class CreateFuelLogDTO
{
    public function __construct(
        public string $vehicleId,
        public string $driverId,
        public string $fuelDate,
        public float $fuelAmount,
        public float $fuelCost,
        public int $odometer,
        public ?string $notes = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            vehicleId: $data['vehicle_id'],
            driverId: $data['driver_id'],
            fuelDate: $data['fuel_date'],
            fuelAmount: (float) $data['fuel_amount'],
            fuelCost: (float) $data['fuel_cost'],
            odometer: (int) $data['odometer'],
            notes: $data['notes'] ?? null
        );
    }
}
