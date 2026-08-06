<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    public function exportReservations(Request $request): BinaryFileResponse
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $locationIds = $request->query('location_ids', []);

        if (is_string($locationIds)) {
            $locationIds = array_filter(explode(',', $locationIds));
        }

        return $this->reportService->exportReservations(
            $request->user(),
            $startDate,
            $endDate,
            $locationIds
        );
    }
}
