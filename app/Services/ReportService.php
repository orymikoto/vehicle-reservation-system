<?php

namespace App\Services;

use App\Exports\ReservationsExport;
use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportService
{
    public function exportReservations(User $user): BinaryFileResponse
    {
        activity()
            ->causedBy($user)
            ->log("User {$user->name} exported Reservations Report Excel");

        return Excel::download(new ReservationsExport, 'reservations-report-'.date('Y-m-d').'.xlsx');
    }
}
