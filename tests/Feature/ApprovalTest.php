<?php

use App\Models\Driver;
use App\Models\User;
use App\Models\Vehicle;

test('approver 1 approves reservation advancing to level 2', function () {
    $admin = User::factory()->create(['role' => 'ADMIN']);
    $approver1 = User::factory()->create(['role' => 'APPROVER']);
    $approver2 = User::factory()->create(['role' => 'APPROVER']);

    $vehicle = Vehicle::create([
        'plate_number' => 'B 3333 TST',
        'brand' => 'Toyota',
        'model' => 'Hilux',
        'type' => 'PASSENGER',
        'ownership' => 'COMPANY',
        'status' => 'AVAILABLE',
    ]);

    $driver = Driver::create([
        'name' => 'Driver Test 3',
        'license_number' => 'SIM-777',
        'phone' => '08333',
        'status' => 'AVAILABLE',
    ]);

    $res = $this->actingAs($admin)->postJson('/api/v1/reservations', [
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'purpose' => 'Mining Survey',
        'destination' => 'Pit Alpha',
        'start_datetime' => now()->addDay()->format('Y-m-d H:i:s'),
        'end_datetime' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'approver_1_id' => $approver1->id,
        'approver_2_id' => $approver2->id,
    ]);

    $reservation = $res->json('data');
    $approval1 = $reservation['approvals'][0];

    $approveRes = $this->actingAs($approver1)->postJson("/api/v1/approvals/{$approval1['id']}/approve", [
        'notes' => 'Level 1 Approved',
    ]);

    $approveRes->assertStatus(200);

    $this->assertDatabaseHas('reservations', [
        'id' => $reservation['id'],
        'status' => 'PENDING',
        'current_approval_level' => 2,
    ]);
});

test('approver 2 grants final approval and sets vehicle status to RESERVED', function () {
    $admin = User::factory()->create(['role' => 'ADMIN']);
    $approver1 = User::factory()->create(['role' => 'APPROVER']);
    $approver2 = User::factory()->create(['role' => 'APPROVER']);

    $vehicle = Vehicle::create([
        'plate_number' => 'B 4444 TST',
        'brand' => 'Toyota',
        'model' => 'Hilux',
        'type' => 'PASSENGER',
        'ownership' => 'COMPANY',
        'status' => 'AVAILABLE',
    ]);

    $driver = Driver::create([
        'name' => 'Driver Test 4',
        'license_number' => 'SIM-666',
        'phone' => '08444',
        'status' => 'AVAILABLE',
    ]);

    $res = $this->actingAs($admin)->postJson('/api/v1/reservations', [
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'purpose' => 'Mining Survey',
        'destination' => 'Pit Alpha',
        'start_datetime' => now()->addDay()->format('Y-m-d H:i:s'),
        'end_datetime' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'approver_1_id' => $approver1->id,
        'approver_2_id' => $approver2->id,
    ]);

    $reservation = $res->json('data');
    $approval1 = $reservation['approvals'][0];
    $approval2 = $reservation['approvals'][1];

    // Approve L1
    $this->actingAs($approver1)->postJson("/api/v1/approvals/{$approval1['id']}/approve");

    // Approve L2
    $finalRes = $this->actingAs($approver2)->postJson("/api/v1/approvals/{$approval2['id']}/approve");

    $finalRes->assertStatus(200);

    $this->assertDatabaseHas('reservations', [
        'id' => $reservation['id'],
        'status' => 'APPROVED',
    ]);

    $this->assertDatabaseHas('vehicles', [
        'id' => $vehicle->id,
        'status' => 'RESERVED',
    ]);

    $this->assertDatabaseHas('drivers', [
        'id' => $driver->id,
        'status' => 'ON_DUTY',
    ]);
});
