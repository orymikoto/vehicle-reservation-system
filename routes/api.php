<?php

use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\FuelController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - MineFleet Vehicle Reservation System
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Authenticated Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::get('/auth/approvers', [AuthController::class, 'approvers']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Dashboard Metrics
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Vehicle Management
        Route::get('/vehicles', [VehicleController::class, 'index']);
        Route::get('/vehicles/available', [VehicleController::class, 'available']);
        Route::post('/vehicles', [VehicleController::class, 'store']);

        // Driver Management
        Route::get('/drivers', [DriverController::class, 'index']);
        Route::get('/drivers/available', [DriverController::class, 'available']);
        Route::post('/drivers', [DriverController::class, 'store']);

        // Reservation Management
        Route::get('/reservations', [ReservationController::class, 'index']);
        Route::post('/reservations', [ReservationController::class, 'store']);

        // Approval Flow
        Route::get('/approvals/pending', [ApprovalController::class, 'index']);
        Route::post('/approvals/{id}/approve', [ApprovalController::class, 'approve']);
        Route::post('/approvals/{id}/reject', [ApprovalController::class, 'reject']);

        // Fuel & Maintenance Tracking
        Route::get('/fuel-logs', [FuelController::class, 'index']);
        Route::post('/fuel-logs', [FuelController::class, 'store']);
        Route::get('/maintenance-logs', [MaintenanceController::class, 'index']);
        Route::post('/maintenance-logs', [MaintenanceController::class, 'store']);

        // Exports & Reports
        Route::get('/reports/reservations/export', [ReportController::class, 'exportReservations']);

        // Audit Activity Log
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });
});
