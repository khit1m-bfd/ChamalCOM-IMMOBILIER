<?php

namespace App\Http\Resources\Message;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'conversation_id' => $this->conversation_id,
            'body'            => $this->body,
            'type'            => $this->type,
            'attachment_url'  => $this->attachment_url,
            'attachment_name' => $this->attachment_name,
            'is_read'         => $this->is_read,
            'is_mine'         => $this->sender_id === auth()->id(),
            'sender'          => $this->whenLoaded('sender', fn () => [
                'id'     => $this->sender->id,
                'name'   => $this->sender->full_name,
                'avatar' => $this->sender->avatar,
            ]),
            'created_at'      => $this->created_at?->toISOString(),
        ];
    }
}
