<?php

namespace App\Http\Requests;

use App\Enums\DriverStatus;
use Illuminate\Foundation\Http\FormRequest;

class CreateDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'license_number' => ['required', 'string', 'max:100', 'unique:drivers,license_number'],
            'phone' => ['required', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'in:'.implode(',', array_column(DriverStatus::cases(), 'value'))],
        ];
    }
}
