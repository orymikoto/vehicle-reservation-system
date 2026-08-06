<?php

namespace Database\Factories;

use App\Models\MaintenanceLog;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class MaintenanceLogFactory extends Factory
{
    protected $model = MaintenanceLog::class;

    public function definition(): array
    {
        $serviceTypes = ['ROUTINE', 'ROUTINE', 'REPAIR', 'EMERGENCY'];
        $workshops = [
            'United Tractors Service Center',
            'Trakindo Utama Mining Workshop',
            'Hexindo Adiperkasa Technical Hub',
            'Auto2000 Commercial Site Bay',
            'Protek Mining Heavy Machinery Repairs',
        ];

        $notesList = [
            'Routine 20,000 KM service & oil filter replacement',
            'Engine oil change, air filter swap, and brake pad inspection',
            'Hydraulic fluid flushing and hose replacement',
            'Heavy duty off-road tire replacement & wheel alignment',
            'Transmission overhaul & clutch plate replacement',
            'Radiator coolant flush and battery terminal maintenance',
        ];

        $serviceDate = fake()->dateTimeBetween('-6 months', 'now');
        $nextDate = (clone $serviceDate)->modify('+3 months');

        return [
            'vehicle_id' => Vehicle::factory(),
            'service_date' => $serviceDate->format('Y-m-d'),
            'service_type' => fake()->randomElement($serviceTypes),
            'workshop' => fake()->randomElement($workshops),
            'cost' => fake()->numberBetween(1500000, 25000000),
            'next_service_date' => $nextDate->format('Y-m-d'),
            'notes' => fake()->randomElement($notesList),
        ];
    }
}
