<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Property\PropertyResource;
use App\Http\Resources\User\UserResource;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:api', 'role:admin']);
    }

    // GET /api/v1/admin/dashboard
    public function dashboard(): JsonResponse
    {
        $now = now();
        $thisMonth = [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
        $lastMonth = [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()];

        $stats = [
            'users' => [
                'total'      => User::count(),
                'active'     => User::where('status', 'active')->count(),
                'new_today'  => User::whereDate('created_at', today())->count(),
                'this_month' => User::whereBetween('created_at', $thisMonth)->count(),
                'owners'     => User::role('owner')->count(),
                'clients'    => User::role('client')->count(),
            ],
            'properties' => [
                'total'     => Property::count(),
                'published' => Property::where('status', 'published')->count(),
                'pending'   => Property::where('status', 'pending')->count(),
                'featured'  => Property::where('is_featured', true)->count(),
            ],
            'bookings' => [
                'total'         => Booking::count(),
                'pending'       => Booking::pending()->count(),
                'confirmed'     => Booking::confirmed()->count(),
                'completed'     => Booking::completed()->count(),
                'this_month'    => Booking::whereBetween('created_at', $thisMonth)->count(),
                'revenue_month' => Booking::paid()->whereBetween('created_at', $thisMonth)->sum('total_amount'),
                'revenue_year'  => Booking::paid()->whereYear('created_at', $now->year)->sum('total_amount'),
            ],
            'reviews' => [
                'total'       => Review::count(),
                'pending'     => Review::where('is_approved', false)->count(),
                'avg_rating'  => round(Review::where('type', 'guest_to_property')->avg('rating_overall'), 2),
            ],
        ];

        // Monthly revenue chart (last 12 months)
        $revenueChart = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $revenueChart[] = [
                'month'   => $month->format('Y-m'),
                'label'   => $month->format('M Y'),
                'revenue' => Booking::paid()
                    ->whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->sum('total_amount'),
                'bookings'=> Booking::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count(),
            ];
        }

        // Top properties
        $topProperties = Property::with(['images' => fn ($q) => $q->where('is_cover', true)])
            ->orderBy('bookings_count', 'desc')
            ->limit(5)
            ->get(['id', 'title_ar', 'title_fr', 'rating_average', 'bookings_count', 'views_count']);

        return response()->json([
            'success'        => true,
            'data'           => [
                'stats'          => $stats,
                'revenue_chart'  => $revenueChart,
                'top_properties' => PropertyResource::collection($topProperties),
            ],
        ]);
    }

    // GET /api/v1/admin/users
    public function users(Request $request): JsonResponse
    {
        $query = User::with(['roles', 'profile'])->withCount(['properties', 'bookingsAsGuest']);

        if ($request->search) {
            $s = $request->search;
            $query->where(fn ($q) => $q->where('email', 'LIKE', "%{$s}%")
                ->orWhere('first_name', 'LIKE', "%{$s}%")
                ->orWhere('last_name', 'LIKE', "%{$s}%")
                ->orWhere('phone', 'LIKE', "%{$s}%"));
        }

        if ($request->role)   $query->role($request->role);
        if ($request->status) $query->where('status', $request->status);

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => UserResource::collection($users->items()),
            'meta'    => ['total' => $users->total(), 'current_page' => $users->currentPage()],
        ]);
    }

    // PATCH /api/v1/admin/users/{user}/status
    public function updateUserStatus(Request $request, User $user): JsonResponse
    {
        $request->validate(['status' => 'required|in:active,inactive,suspended']);
        $user->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => "User status updated to {$request->status}",
            'data'    => UserResource::make($user->fresh()),
        ]);
    }

    // GET /api/v1/admin/properties/pending
    public function pendingProperties(): JsonResponse
    {
        $properties = Property::with(['owner', 'category', 'images'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => PropertyResource::collection($properties->items()),
            'meta'    => ['total' => $properties->total()],
        ]);
    }

    // PATCH /api/v1/admin/properties/{property}/approve
    public function approveProperty(Request $request, Property $property): JsonResponse
    {
        $request->validate(['action' => 'required|in:approve,reject', 'reason' => 'nullable|string']);

        $status = $request->action === 'approve' ? 'published' : 'suspended';
        $property->update(['status' => $status]);

        return response()->json([
            'success' => true,
            'message' => "Property {$request->action}d successfully",
            'data'    => PropertyResource::make($property->fresh()),
        ]);
    }

    // PATCH /api/v1/admin/properties/{property}/feature
    public function toggleFeature(Property $property): JsonResponse
    {
        $property->update(['is_featured' => !$property->is_featured]);
        return response()->json([
            'success'     => true,
            'is_featured' => $property->is_featured,
        ]);
    }

    // GET /api/v1/admin/analytics
    public function analytics(Request $request): JsonResponse
    {
        $period = $request->get('period', '30'); // days
        $from   = now()->subDays($period);

        $bookingsByDay = Booking::selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(total_amount) as revenue')
            ->where('created_at', '>=', $from)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $bookingsByStatus = Booking::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $topCities = Property::selectRaw('address_city, COUNT(*) as count, AVG(price_per_night) as avg_price')
            ->where('status', 'published')
            ->groupBy('address_city')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        $paymentMethods = Payment::selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->where('status', 'succeeded')
            ->groupBy('payment_method')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'bookings_by_day'    => $bookingsByDay,
                'bookings_by_status' => $bookingsByStatus,
                'top_cities'         => $topCities,
                'payment_methods'    => $paymentMethods,
            ],
        ]);
    }
}
