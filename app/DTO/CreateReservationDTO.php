<?php

namespace App\DTO;

readonly class CreateReservationDTO
{
    public function __construct(
        public string $userId,
        public string $vehicleId,
        public string $driverId,
        public string $purpose,
        public string $destination,
        public string $startDatetime,
        public string $endDatetime,
        public string $approver1Id,
        public string $approver2Id
    ) {}

    public static function fromRequest(array $data, string $userId): self
    {
        return new self(
            userId: $userId,
            vehicleId: $data['vehicle_id'],
            driverId: $data['driver_id'],
            purpose: $data['purpose'],
            destination: $data['destination'],
            startDatetime: $data['start_datetime'],
            endDatetime: $data['end_datetime'],
            approver1Id: $data['approver_1_id'],
            approver2Id: $data['approver_2_id']
        );
    }
}
