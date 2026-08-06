<?php

namespace App\Enums;

enum VehicleStatus: string
{
    case AVAILABLE = 'AVAILABLE';
    case RESERVED = 'RESERVED';
    case MAINTENANCE = 'MAINTENANCE';
    case IN_TRANSFER = 'IN_TRANSFER';
    case INACTIVE = 'INACTIVE';
}
