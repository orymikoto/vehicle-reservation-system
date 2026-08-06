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
        array $locationIds = [],
        ?string $search = null,
        ?string $status = null
    ): BinaryFileResponse {
        activity()
            ->causedBy($user)
            ->log("User {$user->name} exported Reservations Report Excel");

        $userLocationId = $user->isSuperAdmin() ? null : $user->location_id;

        return Excel::download(
            new ReservationsExport($startDate, $endDate, $locationIds, $userLocationId, $search, $status),
            'reservations-report-'.date('Y-m-d').'.xlsx'
        );
    }
}
