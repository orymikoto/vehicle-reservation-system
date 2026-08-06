<?php

namespace App\Enums;

enum VehicleType: string
{
    case PASSENGER = 'PASSENGER';
    case CARGO = 'CARGO';
    case HEAVY_EQUIPMENT = 'HEAVY_EQUIPMENT';
    case AMBULANCE = 'AMBULANCE';
}
