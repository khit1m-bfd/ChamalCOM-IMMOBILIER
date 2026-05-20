<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\UserResource;
use App\Http\Resources\Property\PropertyResource;
use App\Models\Favorite;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class UserController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()->load('profile')),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'first_name' => 'sometimes|string|min:2|max:50',
            'last_name'  => 'sometimes|string|min:2|max:50',
            'phone'      => 'sometimes|nullable|string|max:20',
            'locale'     => 'sometimes|in:ar,fr',
            'bio'        => 'sometimes|nullable|string|max:500',
            'address'    => 'sometimes|nullable|string|max:200',
            'city'       => 'sometimes|nullable|string|max:100',
            'languages'  => 'sometimes|array',
            'languages.*'=> 'string|max:30',
        ]);

        $profileData = [];
        foreach (['bio', 'address', 'city', 'languages'] as $field) {
            if (isset($data[$field])) {
                $profileData[$field] = $data[$field];
                unset($data[$field]);
            }
        }

        $user->update($data);

        if (!empty($profileData)) {
            $user->profile()->updateOrCreate(['user_id' => $user->id], $profileData);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data'    => new UserResource($user->fresh('profile')),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate(['avatar' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp']);

        $user = $request->user();

        $result = Cloudinary::upload($request->file('avatar')->getRealPath(), [
            'folder'         => 'chamalcom/avatars',
            'public_id'      => "user_{$user->id}",
            'overwrite'      => true,
            'transformation' => [['width' => 200, 'height' => 200, 'crop' => 'fill', 'gravity' => 'face']],
        ]);

        $user->update(['avatar' => $result->getSecurePath()]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'data'    => ['avatar' => $user->avatar],
        ]);
    }

    public function favorites(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get property IDs favorited by this user
        $favoriteIds = $user->favorites()->pluck('property_id');

        $properties = Property::whereIn('id', $favoriteIds)
            ->with(['category', 'images' => fn ($q) => $q->where('is_cover', true)])
            ->paginate(12);

        return response()->json([
            'success' => true,
            'data'    => PropertyResource::collection($properties->items()),
            'meta'    => [
                'total'        => $properties->total(),
                'current_page' => $properties->currentPage(),
                'last_page'    => $properties->lastPage(),
                'per_page'     => $properties->perPage(),
            ],
        ]);
    }

    public function toggleFavorite(Request $request, string $propertyId): JsonResponse
    {
        $user   = $request->user();
        $exists = $user->favorites()->where('property_id', $propertyId)->exists();

        if ($exists) {
            $user->favorites()->where('property_id', $propertyId)->delete();
            $isFavorited = false;
            $message     = 'Removed from favorites';
        } else {
            $user->favorites()->create(['property_id' => $propertyId]);
            $isFavorited = true;
            $message     = 'Added to favorites';
        }

        return response()->json(['message' => $message, 'data' => ['is_favorited' => $isFavorited]]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => $notifications->items(),
            'meta'    => [
                'total'         => $notifications->total(),
                'current_page'  => $notifications->currentPage(),
                'last_page'     => $notifications->lastPage(),
                'per_page'      => $notifications->perPage(),
                'unread_count'  => $request->user()->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markNotificationRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        $request->user()->notifications()->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
