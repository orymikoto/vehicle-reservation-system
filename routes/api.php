<?php

use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\DriverTransferController;
use App\Http\Controllers\Api\FuelController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\VehicleTransferController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - MineFleet Vehicle Reservation System
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public / Shared Documentation Endpoints
    Route::get('/docs/readme', [DocController::class, 'getReadme']);
    Route::get('/docs/note', [DocController::class, 'getNote']);

    // Authenticated Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::get('/auth/approvers', [AuthController::class, 'approvers']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // System Settings
        Route::get('/settings', [SettingController::class, 'index']);
        Route::put('/settings', [SettingController::class, 'update']);

        // Location Management
        Route::get('/locations', [LocationController::class, 'index']);
        Route::post('/locations', [LocationController::class, 'store']);
        Route::put('/locations/{id}', [LocationController::class, 'update']);

        // Dashboard Metrics
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Vehicle Management
        Route::get('/vehicles', [VehicleController::class, 'index']);
        Route::get('/vehicles/available', [VehicleController::class, 'available']);
        Route::post('/vehicles', [VehicleController::class, 'store']);
        Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
        Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

        // Driver Management
        Route::get('/drivers', [DriverController::class, 'index']);
        Route::get('/drivers/available', [DriverController::class, 'available']);
        Route::post('/drivers', [DriverController::class, 'store']);
        Route::put('/drivers/{id}', [DriverController::class, 'update']);
        Route::delete('/drivers/{id}', [DriverController::class, 'destroy']);

        // Vehicle Transfers (Inter-Location)
        Route::get('/transfers/vehicles', [VehicleTransferController::class, 'index']);
        Route::post('/transfers/vehicles', [VehicleTransferController::class, 'store']);
        Route::post('/transfers/vehicles/{id}/approve-origin', [VehicleTransferController::class, 'approveOrigin']);
        Route::post('/transfers/vehicles/{id}/approve-destination', [VehicleTransferController::class, 'approveDestination']);
        Route::post('/transfers/vehicles/{id}/reject', [VehicleTransferController::class, 'reject']);

        // Driver Transfers (Inter-Location)
        Route::get('/transfers/drivers', [DriverTransferController::class, 'index']);
        Route::post('/transfers/drivers', [DriverTransferController::class, 'store']);
        Route::post('/transfers/drivers/{id}/approve-origin', [DriverTransferController::class, 'approveOrigin']);
        Route::post('/transfers/drivers/{id}/approve-destination', [DriverTransferController::class, 'approveDestination']);
        Route::post('/transfers/drivers/{id}/reject', [DriverTransferController::class, 'reject']);

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
        Route::delete('/fuel-logs/{id}', [FuelController::class, 'destroy']);
        Route::get('/maintenance-logs', [MaintenanceController::class, 'index']);
        Route::post('/maintenance-logs', [MaintenanceController::class, 'store']);
        Route::delete('/maintenance-logs/{id}', [MaintenanceController::class, 'destroy']);

        // Exports & Reports
        Route::get('/reports/reservations/export', [ReportController::class, 'exportReservations']);

        // Audit Activity Log
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });
});
