<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'property_id'   => 'required|uuid|exists:properties,id',
            'check_in_date' => 'required|date|after:today',
            'check_out_date'=> 'required|date|after:check_in_date',
            'adults'        => 'required|integer|min:1|max:30',
            'children'      => 'nullable|integer|min:0|max:20',
            'infants'       => 'nullable|integer|min:0|max:10',
            'pets'          => 'nullable|integer|min:0|max:5',
            'message'       => 'nullable|string|max:1000',
        ];
    }
}
