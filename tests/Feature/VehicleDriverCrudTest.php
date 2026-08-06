<?php

use App\Models\Driver;
use App\Models\Location;
use App\Models\User;
use App\Models\Vehicle;

test('super admin and site admin can edit and delete vehicles for their location', function () {
    $locA = Location::create(['code' => 'LOC-CA', 'name' => 'Site CA', 'region' => 'Region A', 'type' => 'MINE']);
    $locB = Location::create(['code' => 'LOC-CB', 'name' => 'Site CB', 'region' => 'Region B', 'type' => 'MINE']);

    $superAdmin = User::factory()->create(['role' => 'SUPER_ADMIN']);
    $siteAdminA = User::factory()->create(['role' => 'VEHICLE_ADMIN', 'location_id' => $locA->id]);

    $vehicleA = Vehicle::create([
        'plate_number' => 'B 7777 VHA',
        'brand' => 'Isuzu',
        'model' => 'D-Max',
        'type' => 'PASSENGER',
        'ownership' => 'COMPANY',
        'status' => 'AVAILABLE',
        'location_id' => $locA->id,
    ]);

    $vehicleB = Vehicle::create([
        'plate_number' => 'B 8888 VHB',
        'brand' => 'Toyota',
        'model' => 'Hilux',
        'type' => 'PASSENGER',
        'ownership' => 'COMPANY',
        'status' => 'AVAILABLE',
        'location_id' => $locB->id,
    ]);

    // Site Admin A can update Vehicle A
    $updateRes = $this->actingAs($siteAdminA)->putJson("/api/v1/vehicles/{$vehicleA->id}", [
        'brand' => 'Isuzu Updated',
    ]);
    $updateRes->assertStatus(200);

    // Site Admin A CANNOT update Vehicle B (from location B)
    $forbiddenRes = $this->actingAs($siteAdminA)->putJson("/api/v1/vehicles/{$vehicleB->id}", [
        'brand' => 'Toyota Hacked',
    ]);
    $forbiddenRes->assertStatus(403);

    // Super Admin CAN update Vehicle B
    $superRes = $this->actingAs($superAdmin)->putJson("/api/v1/vehicles/{$vehicleB->id}", [
        'brand' => 'Toyota Global Update',
    ]);
    $superRes->assertStatus(200);

    // Delete Vehicle A
    $deleteRes = $this->actingAs($siteAdminA)->deleteJson("/api/v1/vehicles/{$vehicleA->id}");
    $deleteRes->assertStatus(200);
});

test('super admin and site admin can edit and delete drivers for their location', function () {
    $locA = Location::create(['code' => 'LOC-DA', 'name' => 'Site DA', 'region' => 'Region A', 'type' => 'MINE']);
    $locB = Location::create(['code' => 'LOC-DB', 'name' => 'Site DB', 'region' => 'Region B', 'type' => 'MINE']);

    $siteAdminA = User::factory()->create(['role' => 'VEHICLE_ADMIN', 'location_id' => $locA->id]);

    $driverA = Driver::create([
        'name' => 'Driver Alpha',
        'license_number' => 'SIM-A1',
        'phone' => '08111111',
        'status' => 'ACTIVE',
        'location_id' => $locA->id,
    ]);

    $driverB = Driver::create([
        'name' => 'Driver Bravo',
        'license_number' => 'SIM-B1',
        'phone' => '08222222',
        'status' => 'ACTIVE',
        'location_id' => $locB->id,
    ]);

    // Site Admin A can update Driver A
    $updateRes = $this->actingAs($siteAdminA)->putJson("/api/v1/drivers/{$driverA->id}", [
        'name' => 'Driver Alpha Modified',
    ]);
    $updateRes->assertStatus(200);

    // Site Admin A CANNOT update Driver B
    $forbiddenRes = $this->actingAs($siteAdminA)->putJson("/api/v1/drivers/{$driverB->id}", [
        'name' => 'Driver Bravo Hacked',
    ]);
    $forbiddenRes->assertStatus(403);

    // Delete Driver A
    $deleteRes = $this->actingAs($siteAdminA)->deleteJson("/api/v1/drivers/{$driverA->id}");
    $deleteRes->assertStatus(200);
});
