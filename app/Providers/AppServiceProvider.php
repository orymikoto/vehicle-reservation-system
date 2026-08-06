<?php

namespace App\Providers;

use App\Contracts\ApprovalRepositoryInterface;
use App\Contracts\DriverRepositoryInterface;
use App\Contracts\FuelRepositoryInterface;
use App\Contracts\MaintenanceRepositoryInterface;
use App\Contracts\ReservationRepositoryInterface;
use App\Contracts\VehicleRepositoryInterface;
use App\Repositories\ApprovalRepository;
use App\Repositories\DriverRepository;
use App\Repositories\FuelRepository;
use App\Repositories\MaintenanceRepository;
use App\Repositories\ReservationRepository;
use App\Repositories\VehicleRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(VehicleRepositoryInterface::class, VehicleRepository::class);
        $this->app->bind(DriverRepositoryInterface::class, DriverRepository::class);
        $this->app->bind(ReservationRepositoryInterface::class, ReservationRepository::class);
        $this->app->bind(ApprovalRepositoryInterface::class, ApprovalRepository::class);
        $this->app->bind(FuelRepositoryInterface::class, FuelRepository::class);
        $this->app->bind(MaintenanceRepositoryInterface::class, MaintenanceRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
