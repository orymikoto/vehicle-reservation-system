<?php

namespace Database\Factories;

use App\Enums\DriverStatus;
use App\Models\Driver;
use Illuminate\Database\Eloquent\Factories\Factory;

class DriverFactory extends Factory
{
    protected $model = Driver::class;

    public function definition(): array
    {
        $firstNames = ['Budi', 'Rudi', 'Agus', 'Hendra', 'Eko', 'Slamet', 'Ahmad', 'Dedi', 'Bambang', 'Wawan', 'Irwan', 'Yudi', 'Fajar', 'Tatang', 'Joko'];
        $lastNames = ['Santoso', 'Hermawan', 'Pratama', 'Saputra', 'Setiawan', 'Kurniawan', 'Hidayat', 'Wibowo', 'Nugroho', 'Subagyo', 'Suharto', 'Mulyono'];

        $name = fake()->randomElement($firstNames).' '.fake()->randomElement($lastNames);
        $licenseType = fake()->randomElement(['SIM-B1', 'SIM-B2']);
        $licenseNumber = $licenseType.'-'.fake()->numberBetween(100000, 999999);

        return [
            'name' => $name,
            'license_number' => $licenseNumber,
            'phone' => '08'.fake()->numberBetween(110000000, 899999999),
            'status' => fake()->randomElement([DriverStatus::AVAILABLE->value, DriverStatus::AVAILABLE->value, DriverStatus::ON_DUTY->value]),
        ];
    }
}
