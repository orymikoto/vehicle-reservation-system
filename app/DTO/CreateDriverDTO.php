<?php

namespace App\DTO;

use App\Enums\DriverStatus;

readonly class CreateDriverDTO
{
    public function __construct(
        public string $name,
        public string $licenseNumber,
        public string $phone,
        public DriverStatus $status = DriverStatus::AVAILABLE
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            licenseNumber: strtoupper(trim($data['license_number'])),
            phone: $data['phone'],
            status: isset($data['status']) ? DriverStatus::from($data['status']) : DriverStatus::AVAILABLE
        );
    }
}
