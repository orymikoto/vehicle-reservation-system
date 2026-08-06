<?php

namespace Database\Seeders;

use App\Enums\ApprovalStatus;
use App\Enums\DriverStatus;
use App\Enums\ReservationStatus;
use App\Enums\UserRole;
use App\Enums\VehicleOwnership;
use App\Enums\VehicleStatus;
use App\Enums\VehicleType;
use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\MaintenanceLog;
use App\Models\Reservation;
use App\Models\ReservationApproval;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Disable activity log during batch seeding for high speed execution
        activity()->disableLogging();

        // 1. Core Users (Admin & Regional Approvers)
        $admin = User::create([
            'name' => 'MineFleet Admin',
            'email' => 'admin@minefleet.com',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN->value,
        ]);

        $approver1 = User::create([
            'name' => 'Hasan - Region Manager (L1)',
            'email' => 'approver1@minefleet.com',
            'password' => Hash::make('password'),
            'role' => UserRole::APPROVER->value,
        ]);

        $approver2 = User::create([
            'name' => 'Dewi - Logistics Director (L2)',
            'email' => 'approver2@minefleet.com',
            'password' => Hash::make('password'),
            'role' => UserRole::APPROVER->value,
        ]);

        // Generate 9 more regional approvers (Total 12 users)
        $additionalApprovers = User::factory()->count(9)->create([
            'role' => UserRole::APPROVER->value,
        ]);

        $allApprovers = collect([$approver1, $approver2])->concat($additionalApprovers);

        // 2. Vehicles (60 vehicles)
        $vehicles = Vehicle::factory()->count(60)->create();

        // 3. Drivers (50 drivers)
        $drivers = Driver::factory()->count(50)->create();

        // 4. Fuel Logs (100 logs across vehicles)
        for ($i = 0; $i < 100; $i++) {
            $v = $vehicles->random();
            $d = $drivers->random();
            $amount = fake()->randomFloat(2, 45, 400);
            $cost = round($amount * fake()->randomFloat(2, 13800, 15500), 2);
            $date = fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d');

            FuelLog::create([
                'vehicle_id' => $v->id,
                'driver_id' => $d->id,
                'fuel_date' => $date,
                'fuel_amount' => $amount,
                'fuel_cost' => $cost,
                'odometer' => fake()->numberBetween(10000, 150000),
                'notes' => fake()->randomElement([
                    'Refueling at Pit 1 Pertamina Station',
                    'Refueling at Site Alpha Mobile Tanker',
                    'Refueling at Port Jetty Fuel Depot',
                    'Refueling at Washing Plant Fuel Hub',
                    'Refueling at Pit 3 Fuel Storage Bay',
                ]),
            ]);
        }

        // 5. Maintenance Logs (50 logs across vehicles)
        for ($i = 0; $i < 50; $i++) {
            $v = $vehicles->random();
            $serviceDate = fake()->dateTimeBetween('-6 months', 'now');
            $nextDate = (clone $serviceDate)->modify('+3 months');

            MaintenanceLog::create([
                'vehicle_id' => $v->id,
                'service_date' => $serviceDate->format('Y-m-d'),
                'service_type' => fake()->randomElement(['ROUTINE', 'ROUTINE', 'REPAIR', 'EMERGENCY']),
                'workshop' => fake()->randomElement([
                    'United Tractors Service Center',
                    'Trakindo Utama Mining Workshop',
                    'Hexindo Adiperkasa Technical Hub',
                    'Auto2000 Commercial Site Bay',
                    'Protek Mining Heavy Machinery Repairs',
                ]),
                'cost' => fake()->numberBetween(1500000, 25000000),
                'next_service_date' => $nextDate->format('Y-m-d'),
                'notes' => fake()->randomElement([
                    'Routine 20,000 KM service & oil filter replacement',
                    'Engine oil change, air filter swap, and brake pad inspection',
                    'Hydraulic fluid flushing and hose replacement',
                    'Heavy duty off-road tire replacement & wheel alignment',
                    'Transmission overhaul & clutch plate replacement',
                ]),
            ]);
        }

        // 6. Reservations (80 reservations with 160 approval steps)
        $purposes = [
            'Geological Pit Survey & Core Sampling',
            'Coal Haulage Inspection & Road Maintenance',
            'Mining Safety Audit & Environmental Compliance',
            'Exploration Core Sample Transport to Lab',
            'Executive Director Site Inspection',
            'Heavy Equipment Maintenance Technician Escort',
            'Emergency Medical Relief Field Patrol',
            'Explosives & Blasting Zone Patrol',
        ];

        $destinations = [
            'Pit Alpha Block 4',
            'Pit Bravo Sector 12',
            'Port Jetty Terminal 2',
            'Coal Washing Plant Sector C',
            'Exploration Camp Bravo',
            'Central Workshop Bay',
            'Haul Road KM 45 Checkpoint',
        ];

        for ($i = 1; $i <= 80; $i++) {
            $vehicle = $vehicles->random();
            $driver = $drivers->random();

            // First 5 pending reservations specifically assign approver1 as L1 and approver2 as L2
            if ($i <= 5) {
                $l1Approver = $approver1;
                $l2Approver = $approver2;
                $status = ReservationStatus::PENDING->value;
                $currentLevel = 1;
            } elseif ($i <= 10) {
                $l1Approver = $approver1;
                $l2Approver = $approver2;
                $status = ReservationStatus::PENDING->value;
                $currentLevel = 2; // Level 1 already approved, waiting for Level 2 (approver2)
            } else {
                $l1Approver = $allApprovers->random();
                $l2Approver = $allApprovers->where('id', '!=', $l1Approver->id)->random();
                $startDate = fake()->dateTimeBetween('-5 months', '+2 weeks');

                if ($startDate < new \DateTime()) {
                    $status = fake()->boolean(80) ? ReservationStatus::APPROVED->value : ReservationStatus::REJECTED->value;
                } else {
                    $status = fake()->randomElement([
                        ReservationStatus::PENDING->value,
                        ReservationStatus::APPROVED->value,
                        ReservationStatus::REJECTED->value,
                    ]);
                }
                $currentLevel = $status === ReservationStatus::APPROVED->value ? 2 : 1;
            }

            $startDate = fake()->dateTimeBetween('-5 months', '+2 weeks');
            $endDate = (clone $startDate)->modify('+'.fake()->numberBetween(4, 12).' hours');
            $code = 'RSV-'.$startDate->format('Ymd').'-'.strtoupper(Str::random(4));

            $reservation = Reservation::create([
                'reservation_code' => $code,
                'user_id' => $admin->id,
                'vehicle_id' => $vehicle->id,
                'driver_id' => $driver->id,
                'purpose' => fake()->randomElement($purposes),
                'destination' => fake()->randomElement($destinations),
                'start_datetime' => $startDate->format('Y-m-d H:i:s'),
                'end_datetime' => $endDate->format('Y-m-d H:i:s'),
                'status' => $status,
                'current_approval_level' => $currentLevel,
            ]);

            // Level 1 Approval Step
            if ($i <= 5) {
                $l1Status = ApprovalStatus::PENDING->value;
            } elseif ($i <= 10) {
                $l1Status = ApprovalStatus::APPROVED->value;
            } else {
                $l1Status = match ($status) {
                    ReservationStatus::APPROVED->value => ApprovalStatus::APPROVED->value,
                    ReservationStatus::REJECTED->value => fake()->boolean(50) ? ApprovalStatus::REJECTED->value : ApprovalStatus::APPROVED->value,
                    default => ApprovalStatus::PENDING->value,
                };
            }

            ReservationApproval::create([
                'reservation_id' => $reservation->id,
                'approver_id' => $l1Approver->id,
                'approval_level' => 1,
                'status' => $l1Status,
                'notes' => $l1Status === ApprovalStatus::APPROVED->value ? 'Verified operational necessity' : ($l1Status === ApprovalStatus::REJECTED->value ? 'Conflict with regional maintenance schedule' : null),
                'approved_at' => $l1Status !== ApprovalStatus::PENDING->value ? $startDate : null,
            ]);

            // Level 2 Approval Step
            if ($i <= 5) {
                $l2Status = ApprovalStatus::PENDING->value;
            } elseif ($i <= 10) {
                $l2Status = ApprovalStatus::PENDING->value; // Waiting for Level 2 decision
            } else {
                $l2Status = match ($status) {
                    ReservationStatus::APPROVED->value => ApprovalStatus::APPROVED->value,
                    ReservationStatus::REJECTED->value => ($l1Status === ApprovalStatus::APPROVED->value) ? ApprovalStatus::REJECTED->value : ApprovalStatus::PENDING->value,
                    default => ApprovalStatus::PENDING->value,
                };
            }

            ReservationApproval::create([
                'reservation_id' => $reservation->id,
                'approver_id' => $l2Approver->id,
                'approval_level' => 2,
                'status' => $l2Status,
                'notes' => $l2Status === ApprovalStatus::APPROVED->value ? 'Final logistics authorization granted' : ($l2Status === ApprovalStatus::REJECTED->value ? 'Vehicle reallocation requested for priority pit operation' : null),
                'approved_at' => $l2Status !== ApprovalStatus::PENDING->value ? $startDate : null,
            ]);
        }

        // Re-enable activity logging after seeding
        activity()->enableLogging();
    }
}
