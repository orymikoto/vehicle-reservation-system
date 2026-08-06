<?php

namespace App\Http\Requests;

use App\Enums\VehicleOwnership;
use App\Enums\VehicleStatus;
use App\Enums\VehicleType;
use Illuminate\Foundation\Http\FormRequest;

class CreateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'plate_number' => ['required', 'string', 'max:50', 'unique:vehicles,plate_number'],
            'brand' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', 'in:'.implode(',', array_column(VehicleType::cases(), 'value'))],
            'ownership' => ['required', 'string', 'in:'.implode(',', array_column(VehicleOwnership::cases(), 'value'))],
            'status' => ['nullable', 'string', 'in:'.implode(',', array_column(VehicleStatus::cases(), 'value'))],
        ];
    }
}
