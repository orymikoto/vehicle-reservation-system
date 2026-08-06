<?php

namespace Database\Factories;

use App\Enums\VehicleOwnership;
use App\Enums\VehicleStatus;
use App\Enums\VehicleType;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleFactory extends Factory
{
    protected $model = Vehicle::class;

    public function definition(): array
    {
        $vehicleTypes = [
            VehicleType::PASSENGER->value => [
                ['brand' => 'Toyota', 'model' => 'Hilux Double Cabin 4x4'],
                ['brand' => 'Mitsubishi', 'model' => 'Triton Ultimate 4WD'],
                ['brand' => 'Isuzu', 'model' => 'D-Max Field Duty'],
                ['brand' => 'Ford', 'model' => 'Ranger XLT 4x4'],
            ],
            VehicleType::HEAVY_EQUIPMENT->value => [
                ['brand' => 'Caterpillar', 'model' => 'Dump Truck 777G'],
                ['brand' => 'Komatsu', 'model' => 'Excavator PC200-8'],
                ['brand' => 'Volvo', 'model' => 'FMX 440 Articulated Hauler'],
                ['brand' => 'Caterpillar', 'model' => 'Bulldozer D8T'],
                ['brand' => 'Hitachi', 'model' => 'Zaxis 350 Excavator'],
            ],
            VehicleType::CARGO->value => [
                ['brand' => 'Mitsubishi', 'model' => 'Fuso Fighter 6x4'],
                ['brand' => 'Hino', 'model' => 'Ranger Cargo 500'],
                ['brand' => 'Isuzu', 'model' => 'Giga Heavy Flatbed'],
            ],
            VehicleType::AMBULANCE->value => [
                ['brand' => 'Toyota', 'model' => 'HiAce Field Ambulance 4x4'],
                ['brand' => 'Mitsubishi', 'model' => 'Delica Rescue 4WD'],
            ],
        ];

        $selectedType = fake()->randomElement(array_keys($vehicleTypes));
        $selectedModel = fake()->randomElement($vehicleTypes[$selectedType]);

        $prefix = fake()->randomElement(['B', 'KT', 'KU', 'DA', 'BK']);
        $plate = $prefix.' '.fake()->numberBetween(1000, 9999).' '.fake()->lexify('???');

        return [
            'plate_number' => strtoupper($plate),
            'brand' => $selectedModel['brand'],
            'model' => $selectedModel['model'],
            'type' => $selectedType,
            'ownership' => fake()->randomElement([VehicleOwnership::COMPANY->value, VehicleOwnership::RENTAL->value]),
            'status' => fake()->randomElement([VehicleStatus::AVAILABLE->value, VehicleStatus::AVAILABLE->value, VehicleStatus::RESERVED->value, VehicleStatus::MAINTENANCE->value]),
        ];
    }
}
