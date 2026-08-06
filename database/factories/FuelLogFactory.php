<?php

namespace Database\Factories;

use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class FuelLogFactory extends Factory
{
    protected $model = FuelLog::class;

    public function definition(): array
    {
        $amount = fake()->randomFloat(2, 45, 450); // Liters
        $pricePerLiter = fake()->randomFloat(2, 13500, 15500);
        $cost = round($amount * $pricePerLiter, 2);

        $locations = [
            'Refueling at Pit 1 Pertamina Station',
            'Refueling at Site Alpha Mobile Tanker',
            'Refueling at Port Jetty Fuel Depot',
            'Refueling at Washing Plant Fuel Hub',
            'Refueling at Pit 3 Fuel Storage Bay',
        ];

        return [
            'vehicle_id' => Vehicle::factory(),
            'driver_id' => Driver::factory(),
            'fuel_date' => fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'fuel_amount' => $amount,
            'fuel_cost' => $cost,
            'odometer' => fake()->numberBetween(15000, 180000),
            'notes' => fake()->randomElement($locations),
        ];
    }
}
