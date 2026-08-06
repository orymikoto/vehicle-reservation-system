<?php

namespace Database\Factories;

use App\Enums\ReservationStatus;
use App\Models\Driver;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        $purposes = [
            'Geological Pit Survey & Core Sampling',
            'Coal Haulage Inspection & Road Maintenance',
            'Mining Safety Audit & Environmental Compliance',
            'Exploration Core Sample Transport to Lab',
            'Executive Director Site Inspection',
            'Heavy Equipment Maintenance Technician Escort',
            'Emergency Medical Relief Field Patrol',
            'Explosives & Blasting Zone Patrol',
        ];

        $destinations = [
            'Pit Alpha Block 4',
            'Pit Bravo Sector 12',
            'Port Jetty Terminal 2',
            'Coal Washing Plant Sector C',
            'Exploration Camp Bravo',
            'Central Workshop Bay',
            'Haul Road KM 45 Checkpoint',
        ];

        $startDate = fake()->dateTimeBetween('-5 months', '+1 month');
        $endDate = (clone $startDate)->modify('+'.fake()->numberBetween(4, 12).' hours');

        $status = fake()->randomElement([
            ReservationStatus::APPROVED->value,
            ReservationStatus::APPROVED->value,
            ReservationStatus::PENDING->value,
            ReservationStatus::REJECTED->value,
        ]);

        return [
            'reservation_code' => 'RSV-'.$startDate->format('Ymd').'-'.strtoupper(fake()->bothify('??##')),
            'user_id' => User::factory()->admin(),
            'vehicle_id' => Vehicle::factory(),
            'driver_id' => Driver::factory(),
            'purpose' => fake()->randomElement($purposes),
            'destination' => fake()->randomElement($destinations),
            'start_datetime' => $startDate->format('Y-m-d H:i:s'),
            'end_datetime' => $endDate->format('Y-m-d H:i:s'),
            'status' => $status,
            'current_approval_level' => $status === ReservationStatus::APPROVED->value ? 2 : 1,
        ];
    }
}
