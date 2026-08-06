<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'SUPER_ADMIN';
    case VEHICLE_ADMIN = 'VEHICLE_ADMIN';
    case APPROVER = 'APPROVER';
}
