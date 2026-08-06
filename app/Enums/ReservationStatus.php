<?php

namespace App\Enums;

enum ReservationStatus: string
{
    case PENDING = 'PENDING';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
    case CANCELLED = 'CANCELLED';
    case COMPLETED = 'COMPLETED';
}
