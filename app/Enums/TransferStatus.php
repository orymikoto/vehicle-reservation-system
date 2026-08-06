<?php

namespace App\Enums;

enum TransferStatus: string
{
    case PENDING_ORIGIN = 'PENDING_ORIGIN';
    case PENDING_DESTINATION = 'PENDING_DESTINATION';
    case COMPLETED = 'COMPLETED';
    case REJECTED = 'REJECTED';
}
