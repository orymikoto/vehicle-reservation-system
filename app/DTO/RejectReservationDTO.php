<?php

namespace App\DTO;

readonly class RejectReservationDTO
{
    public function __construct(
        public string $approvalId,
        public string $approverId,
        public string $notes
    ) {}

    public static function fromArray(array $data, string $approvalId, string $approverId): self
    {
        return new self(
            approvalId: $approvalId,
            approverId: $approverId,
            notes: $data['notes']
        );
    }
}
