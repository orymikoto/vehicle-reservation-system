<?php

use App\Models\Location;
use App\Models\User;
use App\Models\Vehicle;

test('vehicle transfer follows 2-step approval process and updates vehicle location', function () {
    $locOrigin = Location::create(['code' => 'LOC-O1', 'name' => 'Origin Pit', 'region' => 'Region A', 'type' => 'MINE']);
    $locDest = Location::create(['code' => 'LOC-D1', 'name' => 'Destination Pit', 'region' => 'Region B', 'type' => 'MINE']);

    $superAdmin = User::factory()->create(['role' => 'SUPER_ADMIN']);
    $originAdmin = User::factory()->create(['role' => 'VEHICLE_ADMIN', 'location_id' => $locOrigin->id]);
    $destAdmin = User::factory()->create(['role' => 'VEHICLE_ADMIN', 'location_id' => $locDest->id]);

    $vehicle = Vehicle::create([
        'plate_number' => 'B 9999 TRF',
        'brand' => 'Komatsu',
        'model' => 'HD785',
        'type' => 'HEAVY_EQUIPMENT',
        'ownership' => 'COMPANY',
        'status' => 'AVAILABLE',
        'location_id' => $locOrigin->id,
    ]);

    // 1. Initiate transfer
    $initRes = $this->actingAs($superAdmin)->postJson('/api/v1/transfers/vehicles', [
        'vehicle_id' => $vehicle->id,
        'destination_location_id' => $locDest->id,
        'remarks' => 'Reallocating excavator',
    ]);
    $initRes->assertStatus(201);
    $transferId = $initRes->json('data.id');

    $this->assertDatabaseHas('vehicle_transfers', [
        'id' => $transferId,
        'status' => 'PENDING_ORIGIN',
    ]);
    $this->assertDatabaseHas('vehicles', [
        'id' => $vehicle->id,
        'status' => 'IN_TRANSFER',
    ]);

    // 2. Approve Origin Release
    $originRes = $this->actingAs($originAdmin)->postJson("/api/v1/transfers/vehicles/{$transferId}/approve-origin");
    $originRes->assertStatus(200);

    $this->assertDatabaseHas('vehicle_transfers', [
        'id' => $transferId,
        'status' => 'PENDING_DESTINATION',
    ]);

    // 3. Approve Destination Receipt
    $destRes = $this->actingAs($destAdmin)->postJson("/api/v1/transfers/vehicles/{$transferId}/approve-destination");
    $destRes->assertStatus(200);

    $this->assertDatabaseHas('vehicle_transfers', [
        'id' => $transferId,
        'status' => 'COMPLETED',
    ]);
    $this->assertDatabaseHas('vehicles', [
        'id' => $vehicle->id,
        'location_id' => $locDest->id,
        'status' => 'AVAILABLE',
    ]);
});
