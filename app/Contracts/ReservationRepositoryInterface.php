<?php

namespace App\Contracts;

use App\DTO\CreateReservationDTO;
use App\Models\Reservation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ReservationRepositoryInterface
{
    public function getAllPaginated(
        int $perPage = 15,
        ?string $search = null,
        ?string $status = null,
        ?string $locationId = null,
        string $sortBy = 'created_at',
        string $sortDirection = 'desc'
    ): LengthAwarePaginator;

    public function findById(string $id): ?Reservation;

    public function create(CreateReservationDTO $dto, string $reservationCode): Reservation;

    public function updateStatus(string $id, string $status): bool;

    public function advanceApprovalLevel(string $id, int $nextLevel): bool;
}
