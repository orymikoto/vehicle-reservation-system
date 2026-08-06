<?php

namespace App\Enums;

enum DriverStatus: string
{
    case AVAILABLE = 'AVAILABLE';
    case ON_DUTY = 'ON_DUTY';
    case INACTIVE = 'INACTIVE';
}
