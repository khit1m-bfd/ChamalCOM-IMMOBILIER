<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['property_id', 'booking_id', 'subject', 'last_message_at'];

    protected $casts = ['last_message_at' => 'datetime'];

    public function property(): BelongsTo { return $this->belongsTo(Property::class); }
    public function booking(): BelongsTo  { return $this->belongsTo(Booking::class); }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot('last_read_at', 'is_archived')
            ->withTimestamps();
    }

    public function messages(): HasMany   { return $this->hasMany(Message::class)->latest(); }
    public function lastMessage(): HasOne { return $this->hasOne(Message::class)->latestOfMany(); }

    public function getUnreadCountForUser(string $userId): int
    {
        $participant = $this->participants()->where('user_id', $userId)->first();
        if (!$participant) return 0;
        $lastRead = $participant->pivot->last_read_at;
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->when($lastRead, fn ($q) => $q->where('created_at', '>', $lastRead))
            ->count();
    }
}
