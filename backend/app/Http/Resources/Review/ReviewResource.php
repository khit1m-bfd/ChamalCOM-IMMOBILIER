<?php

namespace App\Http\Resources\Review;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'type'      => $this->type,
            'ratings'   => [
                'overall'       => $this->rating_overall,
                'cleanliness'   => $this->rating_cleanliness,
                'accuracy'      => $this->rating_accuracy,
                'communication' => $this->rating_communication,
                'location'      => $this->rating_location,
                'value'         => $this->rating_value,
            ],
            'comment'   => ['ar' => $this->comment_ar, 'fr' => $this->comment_fr],
            'reviewer'  => $this->whenLoaded('reviewer', fn () => [
                'id'     => $this->reviewer->id,
                'name'   => $this->reviewer->full_name,
                'avatar' => $this->reviewer->avatar,
            ]),
            'reply'     => $this->whenLoaded('reply', fn () => $this->reply ? [
                'reply_ar'   => $this->reply->reply_ar,
                'reply_fr'   => $this->reply->reply_fr,
                'created_at' => $this->reply->created_at?->toISOString(),
            ] : null),
            'created_at'=> $this->created_at?->toISOString(),
        ];
    }
}
