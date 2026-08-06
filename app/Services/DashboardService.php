<?php

namespace App\Services;

use App\Enums\ApprovalStatus;
use App\Enums\TransferStatus;
use App\Enums\VehicleStatus;
use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\Location;
use App\Models\MaintenanceLog;
use App\Models\Reservation;
use App\Models\ReservationApproval;
use App\Models\Vehicle;
use App\Models\VehicleTransfer;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getDashboardMetrics(?string $locationId = null, string $timeframe = '3_months'): array
    {
        $driver = DB::getDriverName();

        // Determine date cut-off based on timeframe parameter
        $cutOffDate = match ($timeframe) {
            '1_month' => now()->subMonth(),
            '1_year' => now()->subYear(),
            '3_years' => now()->subYears(3),
            default => now()->subMonths(3), // '3_months'
        };

        $dateCutoffStr = $cutOffDate->format('Y-m-d');

        // 1. Top Cards Vehicle Metrics
        $vehicleQuery = Vehicle::query();
        if ($locationId) {
            $vehicleQuery->where('location_id', $locationId);
        }

        $totalVehicles = (clone $vehicleQuery)->count();
        $availableVehicles = (clone $vehicleQuery)->where('status', VehicleStatus::AVAILABLE->value)->count();
        $reservedVehicles = (clone $vehicleQuery)->where('status', VehicleStatus::RESERVED->value)->count();
        $maintenanceVehicles = (clone $vehicleQuery)->where('status', VehicleStatus::MAINTENANCE->value)->count();
        $inTransferVehicles = (clone $vehicleQuery)->where('status', VehicleStatus::IN_TRANSFER->value)->count();

        // 2. Location Summary Cards Grid (Only Mine Sites)
        $locations = Location::where('is_active', true)->orderBy('name', 'asc')->get();
        $todayStr = now()->format('Y-m-d');

        $locationSummaries = $locations->map(function ($loc) use ($todayStr) {
            $vehCount = Vehicle::where('location_id', $loc->id)->count();
            $drvCount = Driver::where('location_id', $loc->id)->count();

            $rsvToday = Reservation::where('location_id', $loc->id)
                ->whereDate('start_datetime', '<=', $todayStr)
                ->whereDate('end_datetime', '>=', $todayStr)
                ->count();

            $pendingApprovals = ReservationApproval::where('status', ApprovalStatus::PENDING->value)
                ->whereHas('reservation', function ($q) use ($loc) {
                    $q->where('location_id', $loc->id);
                })->count();

            $activeTransfers = VehicleTransfer::where(function ($q) use ($loc) {
                $q->where('origin_location_id', $loc->id)->orWhere('destination_location_id', $loc->id);
            })->whereIn('status', [TransferStatus::PENDING_ORIGIN->value, TransferStatus::PENDING_DESTINATION->value])->count();

            return [
                'id' => $loc->id,
                'code' => $loc->code,
                'name' => $loc->name,
                'region' => $loc->region,
                'type' => $loc->type->value,
                'vehicles' => $vehCount,
                'drivers' => $drvCount,
                'reservations_today' => $rsvToday,
                'pending_approvals' => $pendingApprovals,
                'transfers' => $activeTransfers,
            ];
        })->toArray();

        // 3. Fuel Consumption & Cost Trend (by month over timeframe)
        $fuelDateExpr = match ($driver) {
            'pgsql' => "TO_CHAR(fuel_date, 'Mon YYYY')",
            'sqlite' => "strftime('%m-%Y', fuel_date)",
            default => "DATE_FORMAT(fuel_date, '%b %Y')",
        };

        $fuelQuery = FuelLog::select(
            DB::raw("{$fuelDateExpr} as month"),
            DB::raw('SUM(fuel_amount) as liters'),
            DB::raw('SUM(fuel_cost) as cost')
        )->where('fuel_date', '>=', $dateCutoffStr);

        if ($locationId) {
            $fuelQuery->whereHas('vehicle', fn ($q) => $q->where('location_id', $locationId));
        }

        $fuelLogsRaw = $fuelQuery
            ->groupBy('month')
            ->orderBy(DB::raw('MIN(fuel_date)'), 'asc')
            ->get();

        $fuelTrend = $fuelLogsRaw->map(fn ($item) => [
            'month' => $item->month,
            'liters' => round((float) $item->liters, 1),
            'cost' => (float) $item->cost,
        ])->toArray();

        // 4. Maintenance Expenses Trend (by month over timeframe)
        $maintDateExpr = match ($driver) {
            'pgsql' => "TO_CHAR(service_date, 'Mon YYYY')",
            'sqlite' => "strftime('%m-%Y', service_date)",
            default => "DATE_FORMAT(service_date, '%b %Y')",
        };

        $maintQuery = MaintenanceLog::select(
            DB::raw("{$maintDateExpr} as month"),
            DB::raw('SUM(cost) as cost')
        )->where('service_date', '>=', $dateCutoffStr);

        if ($locationId) {
            $maintQuery->whereHas('vehicle', fn ($q) => $q->where('location_id', $locationId));
        }

        $maintLogsRaw = $maintQuery
            ->groupBy('month')
            ->orderBy(DB::raw('MIN(service_date)'), 'asc')
            ->get();

        $maintenanceTrend = $maintLogsRaw->map(fn ($item) => [
            'month' => $item->month,
            'cost' => (float) $item->cost,
        ])->toArray();

        // 5. Total Combined Expenses Trend (Fuel Cost + Maintenance Cost per month)
        $monthMap = [];
        foreach ($fuelTrend as $f) {
            $monthMap[$f['month']] = ($monthMap[$f['month']] ?? 0) + $f['cost'];
        }
        foreach ($maintenanceTrend as $m) {
            $monthMap[$m['month']] = ($monthMap[$m['month']] ?? 0) + $m['cost'];
        }

        $combinedExpensesTrend = [];
        foreach ($monthMap as $monthName => $totalCost) {
            $combinedExpensesTrend[] = [
                'month' => $monthName,
                'total_expense' => $totalCost,
            ];
        }

        // 6. Expense Distribution (Percentage of Total Outcome: Fuel vs Maintenance)
        $totalFuelCost = array_sum(array_column($fuelTrend, 'cost'));
        $totalMaintenanceCost = array_sum(array_column($maintenanceTrend, 'cost'));
        $grandTotalExpense = $totalFuelCost + $totalMaintenanceCost;

        $fuelPercentage = $grandTotalExpense > 0 ? round(($totalFuelCost / $grandTotalExpense) * 100, 1) : 0;
        $maintenancePercentage = $grandTotalExpense > 0 ? round(($totalMaintenanceCost / $grandTotalExpense) * 100, 1) : 0;

        $expenseDistribution = [
            'fuel_cost' => $totalFuelCost,
            'maintenance_cost' => $totalMaintenanceCost,
            'grand_total' => $grandTotalExpense,
            'fuel_percentage' => $fuelPercentage,
            'maintenance_percentage' => $maintenancePercentage,
        ];

        // 7. Contextual Table Data
        // Global View: Top Sites by Total Expenses (Combined Fuel + Maintenance)
        $topExpenseSites = Location::where('is_active', true)->get()->map(function ($loc) use ($dateCutoffStr) {
            $fuelCost = FuelLog::whereHas('vehicle', fn ($q) => $q->where('location_id', $loc->id))
                ->where('fuel_date', '>=', $dateCutoffStr)
                ->sum('fuel_cost');

            $maintCost = MaintenanceLog::whereHas('vehicle', fn ($q) => $q->where('location_id', $loc->id))
                ->where('service_date', '>=', $dateCutoffStr)
                ->sum('cost');

            $fuelLiters = FuelLog::whereHas('vehicle', fn ($q) => $q->where('location_id', $loc->id))
                ->where('fuel_date', '>=', $dateCutoffStr)
                ->sum('fuel_amount');

            return [
                'id' => $loc->id,
                'code' => $loc->code,
                'name' => $loc->name,
                'region' => $loc->region,
                'fuel_cost' => (float) $fuelCost,
                'maintenance_cost' => (float) $maintCost,
                'total_expense' => (float) ($fuelCost + $maintCost),
                'total_liters' => round((float) $fuelLiters, 1),
            ];
        })->sortByDesc('total_expense')->values()->toArray();

        // Site View (when locationId is selected): Top Vehicles at that site by Total Expenses
        $topSiteVehicles = [];
        if ($locationId) {
            $topSiteVehicles = Vehicle::where('location_id', $locationId)->get()->map(function ($v) use ($dateCutoffStr) {
                $fuelCost = FuelLog::where('vehicle_id', $v->id)
                    ->where('fuel_date', '>=', $dateCutoffStr)
                    ->sum('fuel_cost');

                $maintCost = MaintenanceLog::where('vehicle_id', $v->id)
                    ->where('service_date', '>=', $dateCutoffStr)
                    ->sum('cost');

                $fuelLiters = FuelLog::where('vehicle_id', $v->id)
                    ->where('fuel_date', '>=', $dateCutoffStr)
                    ->sum('fuel_amount');

                return [
                    'id' => $v->id,
                    'plate_number' => $v->plate_number,
                    'brand' => $v->brand,
                    'model' => $v->model,
                    'fuel_cost' => (float) $fuelCost,
                    'maintenance_cost' => (float) $maintCost,
                    'total_expense' => (float) ($fuelCost + $maintCost),
                    'total_liters' => round((float) $fuelLiters, 1),
                ];
            })->sortByDesc('total_expense')->take(10)->values()->toArray();
        }

        // 8. Vehicle Utilization by Type
        $utilQuery = Vehicle::select('type', DB::raw('COUNT(*) as count'));
        if ($locationId) {
            $utilQuery->where('location_id', $locationId);
        }

        $vehicleUtilization = $utilQuery
            ->groupBy('type')
            ->get()
            ->map(fn ($item) => [
                'type' => is_object($item->type) ? $item->type->value : (string) $item->type,
                'count' => (int) $item->count,
            ])->toArray();

        return [
            'total_vehicles' => $totalVehicles,
            'available_vehicles' => $availableVehicles,
            'reserved_vehicles' => $reservedVehicles,
            'maintenance_vehicles' => $maintenanceVehicles,
            'in_transfer_vehicles' => $inTransferVehicles,
            'location_summaries' => $locationSummaries,
            'combined_expenses_trend' => $combinedExpensesTrend,
            'fuel_trend' => $fuelTrend,
            'maintenance_trend' => $maintenanceTrend,
            'expense_distribution' => $expenseDistribution,
            'top_expense_sites' => $topExpenseSites,
            'top_site_vehicles' => $topSiteVehicles,
            'vehicle_utilization' => $vehicleUtilization,
        ];
    }
}
