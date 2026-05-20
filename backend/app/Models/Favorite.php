<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    public $incrementing = false;
    public $timestamps   = false;     // table only has created_at, no updated_at
    protected $primaryKey = null;     // composite PK, no single primary key

    protected $fillable = ['user_id', 'property_id'];

    protected $casts = ['created_at' => 'datetime'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
