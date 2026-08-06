<?php

namespace App\DTO;

readonly class CreateMaintenanceLogDTO
{
    public function __construct(
        public string $vehicleId,
        public string $serviceDate,
        public string $serviceType,
        public string $workshop,
        public float $cost,
        public ?string $nextServiceDate = null,
        public ?string $notes = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            vehicleId: $data['vehicle_id'],
            serviceDate: $data['service_date'],
            serviceType: strtoupper($data['service_type']),
            workshop: $data['workshop'],
            cost: (float) $data['cost'],
            nextServiceDate: $data['next_service_date'] ?? null,
            notes: $data['notes'] ?? null
        );
    }
}
