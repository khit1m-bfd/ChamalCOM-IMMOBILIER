<?php

namespace App\Http\Resources\Message;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user  = auth()->user();
        $other = $this->whenLoaded('participants', fn () => $this->participants->first());

        return [
            'id'                => $this->id,
            'other_participant' => $other ? [
                'id'     => $other->id,
                'name'   => $other->full_name,
                'avatar' => $other->avatar,
            ] : null,
            'property'          => $this->whenLoaded('property', fn () => $this->property ? [
                'id'          => $this->property->id,
                'title'       => ['ar' => $this->property->title_ar, 'fr' => $this->property->title_fr],
                'cover_image' => $this->property->cover_image,
            ] : null),
            'last_message'      => $this->whenLoaded('lastMessage', fn () => $this->lastMessage ? [
                'body'       => $this->lastMessage->body,
                'is_mine'    => $this->lastMessage->sender_id === $user?->id,
                'created_at' => $this->lastMessage->created_at?->toISOString(),
            ] : null),
            'unread_count'      => $user ? $this->getUnreadCountForUser($user->id) : 0,
            'last_message_at'   => $this->last_message_at?->toISOString(),
            'created_at'        => $this->created_at?->toISOString(),
        ];
    }
}
