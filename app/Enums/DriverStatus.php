<?php

namespace App\Enums;

enum DriverStatus: string
{
    case ACTIVE = 'ACTIVE';
    case ASSIGNED = 'ASSIGNED';
    case ON_LEAVE = 'ON_LEAVE';
    case TRANSFERRED = 'TRANSFERRED';
}
