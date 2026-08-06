<?php

namespace App\Exports;

use App\Models\Reservation;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ReservationsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        protected ?string $startDate = null,
        protected ?string $endDate = null,
        protected array $locationIds = [],
        protected ?string $userLocationId = null,
        protected ?string $search = null,
        protected ?string $status = null
    ) {}

    public function collection()
    {
        $query = Reservation::with(['user', 'vehicle', 'driver', 'location']);

        if ($this->userLocationId) {
            $query->where('location_id', $this->userLocationId);
        } elseif (! empty($this->locationIds)) {
            $query->whereIn('location_id', $this->locationIds);
        }

        if ($this->startDate) {
            $query->whereDate('start_datetime', '>=', $this->startDate);
        }

        if ($this->endDate) {
            $query->whereDate('end_datetime', '<=', $this->endDate);
        }

        if ($this->status) {
            $query->where('status', $this->status);
        }

        if ($this->search) {
            $searchTerm = '%'.strtolower($this->search).'%';
            $query->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(reservation_code) LIKE ?', [$searchTerm])
                    ->orWhereRaw('LOWER(purpose) LIKE ?', [$searchTerm])
                    ->orWhereRaw('LOWER(destination) LIKE ?', [$searchTerm])
                    ->orWhereHas('vehicle', function ($vq) use ($searchTerm) {
                        $vq->whereRaw('LOWER(plate_number) LIKE ?', [$searchTerm])
                            ->orWhereRaw('LOWER(brand) LIKE ?', [$searchTerm])
                            ->orWhereRaw('LOWER(model) LIKE ?', [$searchTerm]);
                    });
            });
        }

        return $query->latest()->get();
    }

    public function headings(): array
    {
        return [
            'Reservation Code',
            'Location Site',
            'Creator (Admin)',
            'Vehicle Plate',
            'Vehicle Model',
            'Driver Name',
            'Purpose',
            'Destination',
            'Start Time',
            'End Time',
            'Status',
            'Created At',
        ];
    }

    public function map($reservation): array
    {
        return [
            $reservation->reservation_code,
            $reservation->location->name ?? 'N/A',
            $reservation->user->name ?? 'N/A',
            $reservation->vehicle->plate_number ?? 'N/A',
            $reservation->vehicle->model ?? 'N/A',
            $reservation->driver->name ?? 'N/A',
            $reservation->purpose,
            $reservation->destination,
            $reservation->start_datetime,
            $reservation->end_datetime,
            is_object($reservation->status) ? $reservation->status->value : $reservation->status,
            $reservation->created_at,
        ];
    }
}
