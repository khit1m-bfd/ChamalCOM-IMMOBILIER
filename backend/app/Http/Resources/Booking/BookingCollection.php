<?php

namespace App\Http\Resources\Booking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class BookingCollection extends ResourceCollection
{
    public $collects = BookingResource::class;

    public function toArray(Request $request): array
    {
        return [
            'items'      => $this->collection,
            'pagination' => [
                'total'        => $this->resource->total(),
                'per_page'     => $this->resource->perPage(),
                'current_page' => $this->resource->currentPage(),
                'last_page'    => $this->resource->lastPage(),
                'has_more'     => $this->resource->hasMorePages(),
            ],
        ];
    }
}
