<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Review\ReviewResource;
use App\Models\Booking;
use App\Models\Property;
use App\Models\Review;
use App\Models\ReviewReply;
use App\Services\PropertyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(private readonly PropertyService $propertyService) {}

    // GET /api/v1/properties/{property}/reviews
    public function index(Property $property): JsonResponse
    {
        $reviews = $property->reviews()
            ->public()
            ->with(['reviewer.profile', 'reply'])
            ->latest()
            ->paginate(10);

        $stats = [
            'average'         => $property->rating_average,
            'count'           => $property->rating_count,
            'cleanliness'     => $property->reviews()->avg('rating_cleanliness'),
            'accuracy'        => $property->reviews()->avg('rating_accuracy'),
            'communication'   => $property->reviews()->avg('rating_communication'),
            'location'        => $property->reviews()->avg('rating_location'),
            'value'           => $property->reviews()->avg('rating_value'),
            'distribution'    => $this->getRatingDistribution($property),
        ];

        return response()->json([
            'success' => true,
            'data'    => ReviewResource::collection($reviews->items()),
            'stats'   => $stats,
            'meta'    => [
                'current_page'  => $reviews->currentPage(),
                'last_page'     => $reviews->lastPage(),
                'total'         => $reviews->total(),
            ],
        ]);
    }

    // POST /api/v1/bookings/{booking}/review
    public function store(Request $request, Booking $booking): JsonResponse
    {
        $user = auth()->user();

        // Validate it's the guest reviewing
        if ($booking->guest_id !== $user->id) {
            abort(403, 'Only the guest can leave a property review');
        }
        if (!$booking->canBeReviewedByGuest()) {
            abort(422, 'Booking cannot be reviewed at this time');
        }

        $request->validate([
            'rating_overall'       => 'required|integer|min:1|max:5',
            'rating_cleanliness'   => 'nullable|integer|min:1|max:5',
            'rating_accuracy'      => 'nullable|integer|min:1|max:5',
            'rating_communication' => 'nullable|integer|min:1|max:5',
            'rating_location'      => 'nullable|integer|min:1|max:5',
            'rating_value'         => 'nullable|integer|min:1|max:5',
            'comment_ar'           => 'required|string|min:10|max:2000',
            'comment_fr'           => 'nullable|string|max:2000',
        ]);

        $review = Review::create([
            'booking_id'           => $booking->id,
            'property_id'          => $booking->property_id,
            'reviewer_id'          => $user->id,
            'reviewee_id'          => $booking->owner_id,
            'type'                 => 'guest_to_property',
            'rating_overall'       => $request->rating_overall,
            'rating_cleanliness'   => $request->rating_cleanliness,
            'rating_accuracy'      => $request->rating_accuracy,
            'rating_communication' => $request->rating_communication,
            'rating_location'      => $request->rating_location,
            'rating_value'         => $request->rating_value,
            'comment_ar'           => $request->comment_ar,
            'comment_fr'           => $request->comment_fr,
        ]);

        $booking->update(['guest_reviewed' => true]);
        $this->propertyService->recalculateRating($booking->property);

        return response()->json([
            'success' => true,
            'message' => __('review.created'),
            'data'    => ReviewResource::make($review->load('reviewer')),
        ], 201);
    }

    // POST /api/v1/reviews/{review}/reply
    public function reply(Request $request, Review $review): JsonResponse
    {
        $user = auth()->user();

        if ($review->property->owner_id !== $user->id) {
            abort(403, 'Only the property owner can reply');
        }
        if ($review->reply()->exists()) {
            abort(422, 'Review already has a reply');
        }

        $request->validate([
            'reply_ar' => 'required|string|min:10|max:1000',
            'reply_fr' => 'nullable|string|max:1000',
        ]);

        $reply = ReviewReply::create([
            'review_id' => $review->id,
            'user_id'   => $user->id,
            'reply_ar'  => $request->reply_ar,
            'reply_fr'  => $request->reply_fr,
        ]);

        return response()->json([
            'success' => true,
            'message' => __('review.reply_added'),
            'data'    => $reply,
        ], 201);
    }

    private function getRatingDistribution(Property $property): array
    {
        $distribution = [];
        for ($i = 5; $i >= 1; $i--) {
            $distribution[$i] = $property->reviews()->where('rating_overall', $i)->count();
        }
        return $distribution;
    }
}
