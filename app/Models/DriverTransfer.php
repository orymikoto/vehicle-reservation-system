<?php

namespace App\Models;

use App\Enums\TransferStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverTransfer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'driver_id',
        'origin_location_id',
        'destination_location_id',
        'requested_by',
        'origin_approved_by',
        'destination_approved_by',
        'status',
        'remarks',
        'transferred_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => TransferStatus::class,
            'transferred_at' => 'datetime',
        ];
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function originLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'origin_location_id');
    }

    public function destinationLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'destination_location_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function originApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'origin_approved_by');
    }

    public function destinationApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'destination_approved_by');
    }
}
