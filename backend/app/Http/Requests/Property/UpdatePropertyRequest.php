<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return (new CreatePropertyRequest())->rules();
    }
}
