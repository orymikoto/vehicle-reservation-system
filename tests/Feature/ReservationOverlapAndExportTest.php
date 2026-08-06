<?php

use App\Models\Driver;
use App\Models\Location;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('reservation creation fails if vehicle has overlapping reservation', function () {
    $superAdmin = User::factory()->create(['role' => 'SUPER_ADMIN']);
    $approver1 = User::factory()->create(['role' => 'APPROVER']);
    $approver2 = User::factory()->create(['role' => 'APPROVER']);

    $loc = Location::create(['code' => 'LOC-OVR', 'name' => 'Overlap Site', 'region' => 'Region O', 'type' => 'MINE']);
    $vehicle = Vehicle::factory()->create(['location_id' => $loc->id, 'plate_number' => 'B 1000 OVR']);
    $driver1 = Driver::factory()->create(['location_id' => $loc->id]);
    $driver2 = Driver::factory()->create(['location_id' => $loc->id]);

    // Reservation 1: 08:00 - 12:00
    Reservation::create([
        'reservation_code' => 'RSV-EXISTING-1',
        'user_id' => $superAdmin->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver1->id,
        'location_id' => $loc->id,
        'purpose' => 'Inspection',
        'destination' => 'Pit Sector 1',
        'start_datetime' => '2026-08-10 08:00:00',
        'end_datetime' => '2026-08-10 12:00:00',
        'status' => 'PENDING',
        'current_approval_level' => 1,
    ]);

    // Reservation 2 Attempt: Overlapping 10:00 - 14:00 with SAME vehicle
    $response = $this->actingAs($superAdmin)->postJson('/api/v1/reservations', [
        'location_id' => $loc->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver2->id,
        'purpose' => 'Conflicting trip',
        'destination' => 'Pit Sector 2',
        'start_datetime' => '2026-08-10 10:00:00',
        'end_datetime' => '2026-08-10 14:00:00',
        'approver_1_id' => $approver1->id,
        'approver_2_id' => $approver2->id,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('vehicle_id');
});

test('reservation creation fails if driver has overlapping reservation', function () {
    $superAdmin = User::factory()->create(['role' => 'SUPER_ADMIN']);
    $approver1 = User::factory()->create(['role' => 'APPROVER']);
    $approver2 = User::factory()->create(['role' => 'APPROVER']);

    $loc = Location::create(['code' => 'LOC-OVR2', 'name' => 'Overlap Site 2', 'region' => 'Region O', 'type' => 'MINE']);
    $vehicle1 = Vehicle::factory()->create(['location_id' => $loc->id]);
    $vehicle2 = Vehicle::factory()->create(['location_id' => $loc->id]);
    $driver = Driver::factory()->create(['location_id' => $loc->id, 'name' => 'Driver Conflict']);

    // Reservation 1: 08:00 - 12:00
    Reservation::create([
        'reservation_code' => 'RSV-EXISTING-2',
        'user_id' => $superAdmin->id,
        'vehicle_id' => $vehicle1->id,
        'driver_id' => $driver->id,
        'location_id' => $loc->id,
        'purpose' => 'Inspection',
        'destination' => 'Pit Sector 1',
        'start_datetime' => '2026-08-10 08:00:00',
        'end_datetime' => '2026-08-10 12:00:00',
        'status' => 'APPROVED',
        'current_approval_level' => 2,
    ]);

    // Reservation 2 Attempt: Overlapping 09:00 - 11:00 with SAME driver
    $response = $this->actingAs($superAdmin)->postJson('/api/v1/reservations', [
        'location_id' => $loc->id,
        'vehicle_id' => $vehicle2->id,
        'driver_id' => $driver->id,
        'purpose' => 'Driver conflict trip',
        'destination' => 'Pit Sector 3',
        'start_datetime' => '2026-08-10 09:00:00',
        'end_datetime' => '2026-08-10 11:00:00',
        'approver_1_id' => $approver1->id,
        'approver_2_id' => $approver2->id,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('driver_id');
});

test('export endpoint returns excel spreadsheet binary response', function () {
    $superAdmin = User::factory()->create(['role' => 'SUPER_ADMIN']);

    $res = $this->actingAs($superAdmin)->getJson('/api/v1/reports/reservations/export');
    $res->assertStatus(200);
});
