<?php

namespace App\Services;

use App\Models\Location;
use App\Repositories\LocationRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class LocationService
{
    public function __construct(
        protected LocationRepository $locationRepository
    ) {}

    public function getAllActiveLocations(): Collection
    {
        return $this->locationRepository->getAllActive();
    }

    public function getPaginatedLocations(int $perPage = 15, ?string $search = null): LengthAwarePaginator
    {
        return $this->locationRepository->getAllPaginated($perPage, $search);
    }

    public function createLocation(array $data): Location
    {
        return $this->locationRepository->create($data);
    }

    public function updateLocation(string $id, array $data): Location
    {
        $location = $this->locationRepository->findById($id);
        if (! $location) {
            throw new \InvalidArgumentException('Location not found.');
        }

        return $this->locationRepository->update($location, $data);
    }
}
