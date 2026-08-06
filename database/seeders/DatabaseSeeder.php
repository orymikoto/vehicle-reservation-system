<?php

namespace Database\Seeders;

use App\Enums\ApprovalStatus;
use App\Enums\DriverStatus;
use App\Enums\LocationType;
use App\Enums\ReservationStatus;
use App\Enums\TransferStatus;
use App\Enums\UserRole;
use App\Enums\VehicleStatus;
use App\Models\Driver;
use App\Models\DriverTransfer;
use App\Models\FuelLog;
use App\Models\Location;
use App\Models\MaintenanceLog;
use App\Models\Reservation;
use App\Models\ReservationApproval;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleTransfer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        activity()->disableLogging();

        // 1. Operational Locations (1 HQ, 1 Branch, 6 Mine Sites)
        $locationsData = [
            ['code' => 'LOC-HQ', 'name' => 'Headquarters', 'region' => 'Jakarta HQ', 'address' => 'Gedung Menara Mining Lt. 24, Jakarta', 'type' => LocationType::HEADQUARTERS->value],
            ['code' => 'LOC-BO', 'name' => 'Branch Office', 'region' => 'East Kalimantan Branch', 'address' => 'Jl. Jendral Sudirman No. 88, Balikpapan', 'type' => LocationType::BRANCH->value],
            ['code' => 'LOC-MSA', 'name' => 'Mine Site A', 'region' => 'Kutai Timur Pit Alpha', 'address' => 'Sangatta Mining Complex Sector 1', 'type' => LocationType::MINE->value],
            ['code' => 'LOC-MSB', 'name' => 'Mine Site B', 'region' => 'Kutai Barat Pit Bravo', 'address' => 'Sendawar Heavy Duty Camp', 'type' => LocationType::MINE->value],
            ['code' => 'LOC-MSC', 'name' => 'Mine Site C', 'region' => 'Berau Washing Plant', 'address' => 'Tanjung Redeb Logistics Port', 'type' => LocationType::MINE->value],
            ['code' => 'LOC-MSD', 'name' => 'Mine Site D', 'region' => 'Tabalong Sector 4', 'address' => 'Tanjung Mining Corridor KM 45', 'type' => LocationType::MINE->value],
            ['code' => 'LOC-MSE', 'name' => 'Mine Site E', 'region' => 'Banjar Jetty Terminal', 'address' => 'Banjarmasin Coal Shipping Hub', 'type' => LocationType::MINE->value],
            ['code' => 'LOC-MSF', 'name' => 'Mine Site F', 'region' => 'Sangatta Pit Delta', 'address' => 'Sangatta North Excavation Pit', 'type' => LocationType::MINE->value],
        ];

        $locations = collect();
        foreach ($locationsData as $locData) {
            $locations->push(Location::create($locData));
        }

        $mineSiteA = $locations->firstWhere('code', 'LOC-MSA');
        $mineSiteB = $locations->firstWhere('code', 'LOC-MSB');

        // 2. Users (Super Admin, Vehicle Admins, Approvers)
        $superAdmin = User::create([
            'name' => 'MineFleet Super Admin',
            'email' => 'admin@minefleet.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SUPER_ADMIN->value,
            'location_id' => null,
        ]);

        $approver1 = User::create([
            'name' => 'Hasan - Mine Site A Manager (L1)',
            'email' => 'approver1@minefleet.com',
            'password' => Hash::make('password'),
            'role' => UserRole::APPROVER->value,
            'location_id' => $mineSiteA->id,
        ]);

        $approver2 = User::create([
            'name' => 'Dewi - Mine Site A Director (L2)',
            'email' => 'approver2@minefleet.com',
            'password' => Hash::make('password'),
            'role' => UserRole::APPROVER->value,
            'location_id' => $mineSiteA->id,
        ]);

        $vehicleAdmins = collect();
        $allApprovers = collect([$approver1, $approver2]);

        foreach ($locations as $loc) {
            $vAdmin = User::create([
                'name' => "Fleet Admin ({$loc->code})",
                'email' => strtolower("admin.{$loc->code}@minefleet.com"),
                'password' => Hash::make('password'),
                'role' => UserRole::VEHICLE_ADMIN->value,
                'location_id' => $loc->id,
            ]);
            $vehicleAdmins->push($vAdmin);

            if ($loc->id !== $mineSiteA->id) {
                $l1 = User::create([
                    'name' => "Approver L1 ({$loc->name})",
                    'email' => strtolower("approver1.{$loc->code}@minefleet.com"),
                    'password' => Hash::make('password'),
                    'role' => UserRole::APPROVER->value,
                    'location_id' => $loc->id,
                ]);

                $l2 = User::create([
                    'name' => "Approver L2 ({$loc->name})",
                    'email' => strtolower("approver2.{$loc->code}@minefleet.com"),
                    'password' => Hash::make('password'),
                    'role' => UserRole::APPROVER->value,
                    'location_id' => $loc->id,
                ]);

                $allApprovers->push($l1)->push($l2);
            }
        }

        // 3. Vehicles & Drivers per Location (12 vehicles & 10 drivers per location = 96 vehicles, 80 drivers)
        $allVehicles = collect();
        $allDrivers = collect();

        foreach ($locations as $loc) {
            $locVehicles = Vehicle::factory()->count(12)->create(['location_id' => $loc->id]);
            $locDrivers = Driver::factory()->count(10)->create(['location_id' => $loc->id]);

            $allVehicles = $allVehicles->concat($locVehicles);
            $allDrivers = $allDrivers->concat($locDrivers);
        }

        // 4. Fuel & Maintenance Logs
        foreach ($allVehicles as $v) {
            $d = $allDrivers->where('location_id', $v->location_id)->first() ?? $allDrivers->first();

            FuelLog::create([
                'vehicle_id' => $v->id,
                'driver_id' => $d->id,
                'fuel_date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
                'fuel_amount' => round(fake()->randomFloat(1, 50, 300), 1),
                'fuel_cost' => fake()->numberBetween(7500, 45000) * 100,
                'odometer' => fake()->numberBetween(15000, 120000),
                'notes' => 'Site fueling station refill',
            ]);

            MaintenanceLog::create([
                'vehicle_id' => $v->id,
                'service_date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
                'service_type' => 'ROUTINE',
                'workshop' => 'Authorized Site Service Bay',
                'cost' => fake()->numberBetween(15000, 120000) * 100,
                'next_service_date' => now()->addMonths(3)->format('Y-m-d'),
                'notes' => 'Routine 10,000 KM heavy duty maintenance',
            ]);
        }

        // 5. Reservations per Location (10 per location = 80 reservations)
        foreach ($locations as $loc) {
            $locVehicles = $allVehicles->where('location_id', $loc->id)->values();
            $locDrivers = $allDrivers->where('location_id', $loc->id)->values();
            $locApprovers = $allApprovers->where('location_id', $loc->id)->values();
            $vAdmin = $vehicleAdmins->where('location_id', $loc->id)->first() ?? $superAdmin;

            $l1App = $locApprovers->first() ?? $approver1;
            $l2App = $locApprovers->skip(1)->first() ?? $approver2;

            for ($r = 1; $r <= 10; $r++) {
                $v = $locVehicles->random();
                $d = $locDrivers->random();
                $startDate = fake()->dateTimeBetween('-2 months', '+2 weeks');
                $endDate = (clone $startDate)->modify('+8 hours');

                if ($r <= 3) {
                    $status = ReservationStatus::PENDING->value;
                    $level = 1;
                } elseif ($r <= 5) {
                    $status = ReservationStatus::PENDING->value;
                    $level = 2;
                } else {
                    $status = ReservationStatus::APPROVED->value;
                    $level = 2;
                }

                $reservation = Reservation::create([
                    'reservation_code' => 'RSV-'.$startDate->format('Ymd').'-'.strtoupper(Str::random(4)),
                    'user_id' => $vAdmin->id,
                    'vehicle_id' => $v->id,
                    'driver_id' => $d->id,
                    'location_id' => $loc->id,
                    'purpose' => "Site Operational Inspection ({$loc->code})",
                    'destination' => "Pit Sector {$r}",
                    'start_datetime' => $startDate->format('Y-m-d H:i:s'),
                    'end_datetime' => $endDate->format('Y-m-d H:i:s'),
                    'status' => $status,
                    'current_approval_level' => $level,
                ]);

                ReservationApproval::create([
                    'reservation_id' => $reservation->id,
                    'approver_id' => $l1App->id,
                    'approval_level' => 1,
                    'status' => ($r <= 3) ? ApprovalStatus::PENDING->value : ApprovalStatus::APPROVED->value,
                    'notes' => 'Level 1 operational check',
                    'approved_at' => ($r <= 3) ? null : $startDate,
                ]);

                ReservationApproval::create([
                    'reservation_id' => $reservation->id,
                    'approver_id' => $l2App->id,
                    'approval_level' => 2,
                    'status' => ($r <= 5) ? ApprovalStatus::PENDING->value : ApprovalStatus::APPROVED->value,
                    'notes' => 'Level 2 logistics clearance',
                    'approved_at' => ($r <= 5) ? null : $startDate,
                ]);
            }
        }

        // 6. Inter-Location Vehicle Transfers & Driver Transfers
        $transferVehicle = $allVehicles->where('location_id', $mineSiteA->id)->first();
        VehicleTransfer::create([
            'vehicle_id' => $transferVehicle->id,
            'origin_location_id' => $mineSiteA->id,
            'destination_location_id' => $mineSiteB->id,
            'requested_by' => $superAdmin->id,
            'origin_approved_by' => $approver1->id,
            'destination_approved_by' => null,
            'status' => TransferStatus::PENDING_DESTINATION->value,
            'remarks' => 'Reallocating heavy excavator to Mine Site B for new pit excavation',
        ]);
        $transferVehicle->update(['status' => VehicleStatus::IN_TRANSFER->value]);

        $transferDriver = $allDrivers->where('location_id', $mineSiteA->id)->first();
        DriverTransfer::create([
            'driver_id' => $transferDriver->id,
            'origin_location_id' => $mineSiteA->id,
            'destination_location_id' => $mineSiteB->id,
            'requested_by' => $superAdmin->id,
            'origin_approved_by' => null,
            'destination_approved_by' => null,
            'status' => TransferStatus::PENDING_ORIGIN->value,
            'remarks' => 'Transferring experienced SIM-B2 driver for heavy haulage operations',
        ]);
        $transferDriver->update(['status' => DriverStatus::TRANSFERRED->value]);

        activity()->enableLogging();
    }
}
