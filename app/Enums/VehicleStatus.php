<?php

namespace App\Enums;

enum VehicleStatus: string
{
    case AVAILABLE = 'AVAILABLE';
    case RESERVED = 'RESERVED';
    case MAINTENANCE = 'MAINTENANCE';
    case INACTIVE = 'INACTIVE';
}
