<?php

namespace App\Exports;

use App\Models\Reservation;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ReservationsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Reservation::with(['user', 'vehicle', 'driver'])->get();
    }

    public function headings(): array
    {
        return [
            'Reservation Code',
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
