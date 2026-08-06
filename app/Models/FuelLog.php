<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelLog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'fuel_date',
        'fuel_amount',
        'fuel_cost',
        'odometer',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'fuel_date' => 'date',
            'fuel_amount' => 'decimal:2',
            'fuel_cost' => 'decimal:2',
            'odometer' => 'integer',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
