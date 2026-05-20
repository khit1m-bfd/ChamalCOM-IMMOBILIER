<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\Booking\CreateBookingDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\CancelBookingRequest;
use App\Http\Requests\Booking\CreateBookingRequest;
use App\Http\Resources\Booking\BookingResource;
use App\Http\Resources\Booking\BookingCollection;
use App\Models\Booking;
use App\Models\Property;
use App\Models\Review;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function __construct(private readonly BookingService $bookingService) {}

    // POST /api/v1/bookings
    public function store(CreateBookingRequest $request): JsonResponse
    {
        $dto = CreateBookingDTO::fromRequest($request);
        $result = $this->bookingService->create($dto, auth()->user());

        return response()->json([
            'success' => true,
            'message' => __('booking.created'),
            'data'    => [
                'booking'        => BookingResource::make($result['booking']),
                'payment_intent' => $result['payment_intent'],
            ],
        ], 201);
    }

    // GET /api/v1/bookings
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = Booking::with(['property.images', 'guest', 'owner'])
            ->orderBy('created_at', 'desc');

        if ($user->isAdmin()) {
            // Admin sees all
        } elseif ($user->isOwner()) {
            $query->where('owner_id', $user->id);
        } else {
            $query->where('guest_id', $user->id);
        }

        if ($request->status) {
            if ($request->status === 'cancelled') {
                $query->where(fn ($q) => $q->where('status', 'cancelled')
                    ->orWhere('status', 'like', 'cancelled_%'));
            } else {
                $query->where('status', $request->status);
            }
        }
        if ($request->from_date) $query->where('check_in_date', '>=', $request->from_date);
        if ($request->to_date)   $query->where('check_out_date', '<=', $request->to_date);

        $bookings = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => BookingCollection::make($bookings),
        ]);
    }

    // GET /api/v1/bookings/{booking}
    public function show(Booking $booking): JsonResponse
    {
        $this->authorizeBookingAccess($booking);

        $booking->load(['property.images', 'property.amenities', 'guest.profile', 'owner.profile', 'payments', 'review']);

        return response()->json([
            'success' => true,
            'data'    => BookingResource::make($booking),
        ]);
    }

    // POST /api/v1/bookings/{booking}/confirm
    public function confirm(Booking $booking): JsonResponse
    {
        $result = $this->bookingService->confirm($booking, auth()->user());
        return response()->json([
            'success' => true,
            'message' => __('booking.confirmed'),
            'data'    => BookingResource::make($result),
        ]);
    }

    // POST /api/v1/bookings/{booking}/cancel
    public function cancel(CancelBookingRequest $request, Booking $booking): JsonResponse
    {
        $result = $this->bookingService->cancel($booking, auth()->user(), $request->reason);
        return response()->json([
            'success' => true,
            'message' => __('booking.cancelled'),
            'data'    => BookingResource::make($result),
        ]);
    }

    // GET /api/v1/bookings/stats — Owner/Admin stats
    public function stats(): JsonResponse
    {
        $user = auth()->user();
        $baseQuery = $user->isAdmin()
            ? Booking::query()
            : Booking::where('owner_id', $user->id);

        $stats = [
            'total'        => $baseQuery->count(),
            'pending'      => (clone $baseQuery)->pending()->count(),
            'confirmed'    => (clone $baseQuery)->confirmed()->count(),
            'completed'    => (clone $baseQuery)->completed()->count(),
            'cancelled'    => (clone $baseQuery)->cancelled()->count(),
            'total_revenue'=> (clone $baseQuery)->paid()->sum('total_amount'),
            'this_month'   => (clone $baseQuery)->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->count(),
            'this_year'    => (clone $baseQuery)->whereYear('created_at', now()->year)->sum('total_amount'),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }

    // GET /owner/dashboard/stats
    public function ownerDashboardStats(): JsonResponse
    {
        $userId     = auth()->id();
        $propIds    = Property::where('owner_id', $userId)->pluck('id');
        $base       = fn () => Booking::whereIn('property_id', $propIds);

        $monthlyEarnings = $base()->whereIn('payment_status', ['paid'])
            ->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)
            ->sum('total_amount');

        $bookedDays = $base()->whereIn('status', ['confirmed'])
            ->whereMonth('check_in_date', now()->month)->whereYear('check_in_date', now()->year)
            ->sum(DB::raw('DATEDIFF(check_out_date, check_in_date)'));
        $totalDays      = now()->daysInMonth * max(1, $propIds->count());
        $occupancyRate  = $totalDays > 0 ? round(($bookedDays / $totalDays) * 100) : 0;

        $avgRating = Review::whereHas('booking', fn ($q) => $q->whereIn('property_id', $propIds))
            ->avg('rating_overall') ?? 0;

        return response()->json([
            'success' => true,
            'data'    => [
                'total_properties'  => $propIds->count(),
                'total_bookings'    => $base()->count(),
                'monthly_earnings'  => (float) $monthlyEarnings,
                'avg_rating'        => round((float) $avgRating, 1),
                'pending_bookings'  => $base()->where('status', 'pending')->count(),
                'occupancy_rate'    => min(100, max(0, $occupancyRate)),
            ],
        ]);
    }

    // GET /owner/bookings
    public function ownerBookings(Request $request): JsonResponse
    {
        $query = Booking::with(['property.images', 'guest.profile'])
            ->where('owner_id', auth()->id())
            ->orderBy('created_at', 'desc');

        if ($request->status) {
            if ($request->status === 'cancelled') {
                $query->where(fn ($q) => $q->where('status', 'cancelled')
                    ->orWhere('status', 'like', 'cancelled_%'));
            } else {
                $query->where('status', $request->status);
            }
        }

        $bookings = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data'    => BookingCollection::make($bookings),
        ]);
    }

    // POST /owner/bookings/{booking}/confirm
    public function ownerConfirm(Booking $booking): JsonResponse
    {
        abort_if($booking->owner_id !== auth()->id(), 403);
        $result = $this->bookingService->confirm($booking, auth()->user());

        return response()->json([
            'success' => true,
            'data'    => BookingResource::make($result),
        ]);
    }

    // POST /owner/bookings/{booking}/reject
    public function ownerReject(Request $request, Booking $booking): JsonResponse
    {
        abort_if($booking->owner_id !== auth()->id(), 403);
        abort_if(!in_array($booking->status, ['pending']), 422, 'Only pending bookings can be rejected');

        $booking->update([
            'status'              => 'rejected',
            'cancelled_at'        => now(),
            'cancellation_reason' => $request->reason ?? '',
        ]);

        return response()->json([
            'success' => true,
            'data'    => BookingResource::make($booking->fresh()->load(['property', 'guest', 'owner'])),
        ]);
    }

    // GET /owner/earnings
    public function ownerEarnings(Request $request): JsonResponse
    {
        $userId  = auth()->id();
        $months  = $request->period === '12m' ? 12 : 6;
        $propIds = Property::where('owner_id', $userId)->pluck('id');

        $monthly = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $date    = now()->subMonths($i);
            $monthly[] = [
                'month'    => $date->format('M'),
                'earnings' => (float) Booking::whereIn('property_id', $propIds)
                    ->whereIn('payment_status', ['paid'])
                    ->whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)
                    ->sum('total_amount'),
                'bookings' => Booking::whereIn('property_id', $propIds)
                    ->whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)
                    ->count(),
            ];
        }

        $base        = fn () => Booking::whereIn('property_id', $propIds);
        $totalYear   = (float) $base()->whereIn('payment_status', ['paid'])->whereYear('created_at', now()->year)->sum('total_amount');
        $totalMonth  = (float) $base()->whereIn('payment_status', ['paid'])->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('total_amount');
        $prevMonth   = (float) $base()->whereIn('payment_status', ['paid'])->whereMonth('created_at', now()->subMonth()->month)->whereYear('created_at', now()->subMonth()->year)->sum('total_amount');
        $growthPct   = $prevMonth > 0 ? round((($totalMonth - $prevMonth) / $prevMonth) * 100, 1) : ($totalMonth > 0 ? 100 : 0);
        $avgPerNight = (float) ($base()->whereIn('payment_status', ['paid'])->avg(DB::raw('total_amount / NULLIF(DATEDIFF(check_out_date, check_in_date), 0)'))) ?? 0;

        return response()->json([
            'success' => true,
            'data'    => [
                'monthly'        => $monthly,
                'total_year'     => $totalYear,
                'total_month'    => $totalMonth,
                'avg_per_night'  => round($avgPerNight),
                'growth_pct'     => $growthPct,
                'pending_payout' => (float) $base()->where('status', 'completed')->where('payment_status', 'paid')->sum('total_amount'),
                'paid_out'       => 0.0,
            ],
        ]);
    }

    // GET /owner/analytics
    public function ownerAnalytics(Request $request): JsonResponse
    {
        $userId  = auth()->id();
        $propIds = Property::where('owner_id', $userId)->pluck('id');

        $monthly = [];
        for ($i = 5; $i >= 0; $i--) {
            $date      = now()->subMonths($i);
            $monthly[] = [
                'month'    => $date->format('M'),
                'views'    => (int) Property::whereIn('id', $propIds)->sum('views_count') / max(1, 6),
                'bookings' => Booking::whereIn('property_id', $propIds)
                    ->whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->count(),
            ];
        }

        $avgRating    = (float) Review::whereHas('booking', fn ($q) => $q->whereIn('property_id', $propIds))->avg('rating_overall') ?? 0;
        $totalViews   = (int)   Property::whereIn('id', $propIds)->sum('views_count');
        $totalReviews = (int)   Review::whereHas('booking', fn ($q) => $q->whereIn('property_id', $propIds))->count();

        $ratingBreakdown = [];
        for ($s = 5; $s >= 1; $s--) {
            $count = Review::whereHas('booking', fn ($q) => $q->whereIn('property_id', $propIds))->where('rating_overall', $s)->count();
            $ratingBreakdown[] = ['stars' => $s, 'count' => $count, 'pct' => $totalReviews > 0 ? round($count / $totalReviews * 100) : 0];
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'overview' => [
                    'total_views'       => $totalViews,
                    'total_bookings'    => Booking::whereIn('property_id', $propIds)->count(),
                    'total_reviews'     => $totalReviews,
                    'avg_rating'        => round($avgRating, 1),
                    'conversion_rate'   => $totalViews > 0 ? round(Booking::whereIn('property_id', $propIds)->count() / $totalViews * 100, 1) : 0,
                    'repeat_guests'     => 0,
                ],
                'monthly_views'    => $monthly,
                'top_properties'   => [],
                'booking_sources'  => [],
                'rating_breakdown' => $ratingBreakdown,
            ],
        ]);
    }

    private function authorizeBookingAccess(Booking $booking): void
    {
        $user = auth()->user();
        if ($user->isAdmin()) return;
        if ($booking->guest_id === $user->id || $booking->owner_id === $user->id) return;
        abort(403, 'Unauthorized');
    }
}
