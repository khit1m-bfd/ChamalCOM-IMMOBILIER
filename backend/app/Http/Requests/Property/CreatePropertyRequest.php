<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class CreatePropertyRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'category_id'        => 'required|uuid|exists:property_categories,id',
            'title_ar'           => 'required|string|min:10|max:200',
            'title_fr'           => 'nullable|string|max:200',
            'description_ar'     => 'required|string|min:50|max:5000',
            'description_fr'     => 'nullable|string|max:5000',
            'price_per_night'    => 'required|numeric|min:50|max:50000',
            'price_per_week'     => 'nullable|numeric|min:200',
            'price_per_month'    => 'nullable|numeric|min:500',
            'cleaning_fee'       => 'nullable|numeric|min:0|max:5000',
            'security_deposit'   => 'nullable|numeric|min:0|max:10000',
            'address_street'     => 'required|string|max:255',
            'address_city'       => 'nullable|string|max:100',
            'address_region'     => 'nullable|string|max:100',
            'latitude'           => 'nullable|numeric|between:-90,90',
            'longitude'          => 'nullable|numeric|between:-180,180',
            'max_guests'         => 'required|integer|min:1|max:30',
            'bedrooms'           => 'required|integer|min:0|max:20',
            'bathrooms'          => 'required|integer|min:1|max:20',
            'beds'               => 'required|integer|min:1|max:30',
            'min_nights'         => 'nullable|integer|min:1|max:365',
            'max_nights'         => 'nullable|integer|min:1|max:365',
            'check_in_hour'      => 'nullable|integer|min:0|max:23',
            'check_out_hour'     => 'nullable|integer|min:0|max:23',
            'instant_booking'    => 'nullable|boolean',
            'pets_allowed'       => 'nullable|boolean',
            'smoking_allowed'    => 'nullable|boolean',
            'cancellation_policy'=> 'nullable|in:flexible,moderate,strict,super_strict',
            'house_rules_ar'     => 'nullable|string|max:2000',
            'house_rules_fr'     => 'nullable|string|max:2000',
            'amenity_ids'        => 'nullable|array',
            'amenity_ids.*'      => 'uuid|exists:amenities,id',
        ];
    }
}
