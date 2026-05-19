<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class SearchPropertyRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'q'              => 'nullable|string|max:100',
            'city'           => 'nullable|string|max:100',
            'region'         => 'nullable|string|max:100',
            'check_in'       => 'nullable|date|after_or_equal:today',
            'check_out'      => 'nullable|date|after:check_in',
            'guests'         => 'nullable|integer|min:1|max:30',
            'min_price'      => 'nullable|numeric|min:0',
            'max_price'      => 'nullable|numeric|min:0',
            'bedrooms'       => 'nullable|integer|min:0',
            'bathrooms'      => 'nullable|integer|min:0',
            'category_id'    => 'nullable|uuid|exists:property_categories,id',
            'amenities'      => 'nullable|array',
            'amenities.*'    => 'uuid|exists:amenities,id',
            'instant_booking'=> 'nullable|boolean',
            'pets_allowed'   => 'nullable|boolean',
            'sort_by'        => 'nullable|in:recommended,price_asc,price_desc,rating,newest',
            'per_page'       => 'nullable|integer|min:4|max:50',
        ];
    }
}
