<?php

namespace App\DTO;

use App\Enums\VehicleOwnership;
use App\Enums\VehicleStatus;
use App\Enums\VehicleType;

readonly class CreateVehicleDTO
{
    public function __construct(
        public string $plateNumber,
        public string $brand,
        public string $model,
        public VehicleType $type,
        public VehicleOwnership $ownership,
        public VehicleStatus $status = VehicleStatus::AVAILABLE
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            plateNumber: strtoupper(trim($data['plate_number'])),
            brand: $data['brand'],
            model: $data['model'],
            type: VehicleType::from($data['type']),
            ownership: VehicleOwnership::from($data['ownership']),
            status: isset($data['status']) ? VehicleStatus::from($data['status']) : VehicleStatus::AVAILABLE
        );
    }
}
