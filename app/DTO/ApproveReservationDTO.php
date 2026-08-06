<?php

namespace App\DTO;

readonly class ApproveReservationDTO
{
    public function __construct(
        public string $approvalId,
        public string $approverId,
        public ?string $notes = null
    ) {}

    public static function fromArray(array $data, string $approvalId, string $approverId): self
    {
        return new self(
            approvalId: $approvalId,
            approverId: $approverId,
            notes: $data['notes'] ?? null
        );
    }
}
