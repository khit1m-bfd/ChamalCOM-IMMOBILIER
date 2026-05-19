<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id', 'bio', 'date_of_birth', 'gender', 'nationality',
        'id_number', 'id_type', 'address_street', 'address_city',
        'address_region', 'address_country', 'address_postal',
        'rating_average', 'rating_count', 'is_verified_host',
        'host_since', 'social_links', 'languages_spoken',
    ];

    protected $casts = [
        'date_of_birth'    => 'date',
        'host_since'       => 'datetime',
        'is_verified_host' => 'boolean',
        'social_links'     => 'array',
        'languages_spoken' => 'array',
        'rating_average'   => 'decimal:2',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
