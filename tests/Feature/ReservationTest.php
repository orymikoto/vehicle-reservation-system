<?php

use App\Models\Driver;
use App\Models\Location;
use App\Models\User;
use App\Models\Vehicle;

test('admin can create a reservation with level 1 and level 2 approvers', function () {
    $location = Location::create([
        'code' => 'LOC-TST1',
        'name' => 'Test Location 1',
        'region' => 'Test Region',
        'type' => 'MINE',
    ]);

    $admin = User::factory()->create(['role' => 'SUPER_ADMIN']);
    $approver1 = User::factory()->create(['role' => 'APPROVER', 'location_id' => $location->id]);
    $approver2 = User::factory()->create(['role' => 'APPROVER', 'location_id' => $location->id]);

    $vehicle = Vehicle::create([
        'plate_number' => 'B 1111 TST',
        'brand' => 'Toyota',
        'model' => 'Hilux',
        'type' => 'PASSENGER',
        'ownership' => 'COMPANY',
        'status' => 'AVAILABLE',
        'location_id' => $location->id,
    ]);

    $driver = Driver::create([
        'name' => 'Driver Test',
        'license_number' => 'SIM-999',
        'phone' => '08111',
        'status' => 'ACTIVE',
        'location_id' => $location->id,
    ]);

    $response = $this->actingAs($admin)->postJson('/api/v1/reservations', [
        'location_id' => $location->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'purpose' => 'Mining Survey',
        'destination' => 'Pit Alpha',
        'start_datetime' => now()->addDay()->format('Y-m-d H:i:s'),
        'end_datetime' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'approver_1_id' => $approver1->id,
        'approver_2_id' => $approver2->id,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('status', 'success');

    $this->assertDatabaseHas('reservations', [
        'purpose' => 'Mining Survey',
        'status' => 'PENDING',
        'current_approval_level' => 1,
    ]);

    $this->assertDatabaseHas('reservation_approvals', [
        'approver_id' => $approver1->id,
        'approval_level' => 1,
        'status' => 'PENDING',
    ]);

    $this->assertDatabaseHas('reservation_approvals', [
        'approver_id' => $approver2->id,
        'approval_level' => 2,
        'status' => 'PENDING',
    ]);
});

test('creation fails if level 1 and level 2 approvers are identical', function () {
    $location = Location::create([
        'code' => 'LOC-TST2',
        'name' => 'Test Location 2',
        'region' => 'Test Region',
        'type' => 'MINE',
    ]);

    $admin = User::factory()->create(['role' => 'SUPER_ADMIN']);
    $approver = User::factory()->create(['role' => 'APPROVER', 'location_id' => $location->id]);

    $vehicle = Vehicle::create([
        'plate_number' => 'B 2222 TST',
        'brand' => 'Toyota',
        'model' => 'Hilux',
        'type' => 'PASSENGER',
        'ownership' => 'COMPANY',
        'status' => 'AVAILABLE',
        'location_id' => $location->id,
    ]);

    $driver = Driver::create([
        'name' => 'Driver Test 2',
        'license_number' => 'SIM-888',
        'phone' => '08222',
        'status' => 'ACTIVE',
        'location_id' => $location->id,
    ]);

    $response = $this->actingAs($admin)->postJson('/api/v1/reservations', [
        'location_id' => $location->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'purpose' => 'Mining Survey',
        'destination' => 'Pit Alpha',
        'start_datetime' => now()->addDay()->format('Y-m-d H:i:s'),
        'end_datetime' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'approver_1_id' => $approver->id,
        'approver_2_id' => $approver->id,
    ]);

    $response->assertStatus(422);
});
