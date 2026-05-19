<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Property $property): bool
    {
        if ($property->status === 'published') return true;
        if (!$user) return false;
        return $user->id === $property->owner_id || $user->hasRole('admin');
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['owner', 'admin']);
    }

    public function update(User $user, Property $property): bool
    {
        return $user->id === $property->owner_id || $user->hasRole('admin');
    }

    public function delete(User $user, Property $property): bool
    {
        return $user->id === $property->owner_id || $user->hasRole('admin');
    }

    public function uploadImages(User $user, Property $property): bool
    {
        return $user->id === $property->owner_id || $user->hasRole('admin');
    }

    public function manageAvailability(User $user, Property $property): bool
    {
        return $user->id === $property->owner_id || $user->hasRole('admin');
    }
}
