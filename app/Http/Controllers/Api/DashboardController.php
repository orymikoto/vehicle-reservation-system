<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index(): JsonResponse
    {
        $data = $this->dashboardService->getDashboardMetrics();

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }
}
