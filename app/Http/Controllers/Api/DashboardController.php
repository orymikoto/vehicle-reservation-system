<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // If user is locked to a single location (not Super Admin), force their location_id
        $locationId = $user->isSuperAdmin() ? $request->query('location_id') : $user->location_id;
        $timeframe = $request->query('timeframe', '3_months');

        $metrics = $this->dashboardService->getDashboardMetrics($locationId, $timeframe);

        return response()->json([
            'status' => 'success',
            'data' => $metrics,
        ]);
    }
}
