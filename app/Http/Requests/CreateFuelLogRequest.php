<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateFuelLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'uuid', 'exists:vehicles,id'],
            'driver_id' => ['required', 'uuid', 'exists:drivers,id'],
            'fuel_date' => ['required', 'date'],
            'fuel_amount' => ['required', 'numeric', 'min:0.1'],
            'fuel_cost' => ['required', 'numeric', 'min:0'],
            'odometer' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
