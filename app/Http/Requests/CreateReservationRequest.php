<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateReservationRequest extends FormRequest
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
            'purpose' => ['required', 'string', 'max:255'],
            'destination' => ['required', 'string', 'max:255'],
            'start_datetime' => ['required', 'date', 'after:now'],
            'end_datetime' => ['required', 'date', 'after:start_datetime'],
            'approver_1_id' => ['required', 'uuid', 'exists:users,id'],
            'approver_2_id' => ['required', 'uuid', 'exists:users,id', 'different:approver_1_id'],
        ];
    }

    public function messages(): array
    {
        return [
            'approver_2_id.different' => 'Level 2 Approver cannot be the same person as Level 1 Approver.',
        ];
    }
}
