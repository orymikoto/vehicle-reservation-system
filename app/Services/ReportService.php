<?php

namespace App\Services;

use App\Exports\ReservationsExport;
use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportService
{
    public function exportReservations(
        User $user,
        ?string $startDate = null,
        ?string $endDate = null,
        array $locationIds = []
    ): BinaryFileResponse {
        activity()
            ->causedBy($user)
            ->log("User {$user->name} exported Reservations Report Excel");

        $userLocationId = $user->isSuperAdmin() ? null : $user->location_id;

        return Excel::download(
            new ReservationsExport($startDate, $endDate, $locationIds, $userLocationId),
            'reservations-report-'.date('Y-m-d').'.xlsx'
        );
    }
}
