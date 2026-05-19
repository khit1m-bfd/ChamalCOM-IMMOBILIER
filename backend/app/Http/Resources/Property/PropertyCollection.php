<?php

namespace App\Http\Resources\Property;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PropertyCollection extends ResourceCollection
{
    public $collects = PropertyResource::class;

    public function toArray(Request $request): array
    {
        return [
            'items'       => $this->collection,
            'pagination'  => [
                'total'        => $this->resource->total(),
                'per_page'     => $this->resource->perPage(),
                'current_page' => $this->resource->currentPage(),
                'last_page'    => $this->resource->lastPage(),
                'from'         => $this->resource->firstItem(),
                'to'           => $this->resource->lastItem(),
                'has_more'     => $this->resource->hasMorePages(),
            ],
        ];
    }
}
