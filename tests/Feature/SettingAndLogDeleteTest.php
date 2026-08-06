<?php

use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\Location;
use App\Models\MaintenanceLog;
use App\Models\Setting;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;

uses(RefreshDatabase::class);

test('super admin can view and update system settings', function () {
    $superAdmin = User::factory()->create(['role' => 'SUPER_ADMIN']);

    $getRes = $this->actingAs($superAdmin)->getJson('/api/v1/settings');
    $getRes->assertStatus(200);

    $updateRes = $this->actingAs($superAdmin)->putJson('/api/v1/settings', [
        'settings' => [
            ['key' => 'fuel_price_per_liter', 'value' => '16500'],
        ],
    ]);
    $updateRes->assertStatus(200);

    expect(Setting::getValue('fuel_price_per_liter'))->toBe('16500');
});

test('super admin can delete fuel log and maintenance log with activity audit log', function () {
    $superAdmin = User::factory()->create(['role' => 'SUPER_ADMIN']);
    $loc = Location::create(['code' => 'LOC-TST', 'name' => 'Test Site', 'region' => 'Region T', 'type' => 'MINE']);
    $vehicle = Vehicle::factory()->create(['location_id' => $loc->id]);
    $driver = Driver::factory()->create(['location_id' => $loc->id]);

    $fuelLog = FuelLog::create([
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'fuel_date' => now()->format('Y-m-d'),
        'fuel_amount' => 50,
        'fuel_cost' => 750000,
        'odometer' => 12000,
        'notes' => 'Test log',
    ]);

    $maintLog = MaintenanceLog::create([
        'vehicle_id' => $vehicle->id,
        'service_date' => now()->format('Y-m-d'),
        'service_type' => 'ROUTINE',
        'workshop' => 'Test Workshop',
        'cost' => 1500000,
    ]);

    $delFuelRes = $this->actingAs($superAdmin)->deleteJson("/api/v1/fuel-logs/{$fuelLog->id}");
    $delFuelRes->assertStatus(200);
    expect(FuelLog::find($fuelLog->id))->toBeNull();

    $delMaintRes = $this->actingAs($superAdmin)->deleteJson("/api/v1/maintenance-logs/{$maintLog->id}");
    $delMaintRes->assertStatus(200);
    expect(MaintenanceLog::find($maintLog->id))->toBeNull();

    $activityCount = Activity::where('description', 'like', '%deleted%')->count();
    expect($activityCount)->toBeGreaterThanOrEqual(2);
});

test('vehicles endpoint supports case insensitive search, site filter, and pagination', function () {
    $user = User::factory()->create(['role' => 'SUPER_ADMIN']);
    $loc = Location::create(['code' => 'LOC-FLT', 'name' => 'Filter Site', 'region' => 'Region F', 'type' => 'MINE']);

    Vehicle::factory()->create(['plate_number' => 'B 1234 ABC', 'location_id' => $loc->id]);
    Vehicle::factory()->create(['plate_number' => 'B 5678 XYZ', 'location_id' => $loc->id]);

    $res = $this->actingAs($user)->getJson('/api/v1/vehicles?search=abc&location_id='.$loc->id);
    $res->assertStatus(200);
    $res->assertJsonPath('data.total', 1);
    $res->assertJsonPath('data.data.0.plate_number', 'B 1234 ABC');
});
