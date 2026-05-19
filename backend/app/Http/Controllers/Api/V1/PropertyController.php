<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\Property\CreatePropertyDTO;
use App\DTOs\Property\SearchPropertyDTO;
use App\DTOs\Property\UpdatePropertyDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Property\CreatePropertyRequest;
use App\Http\Requests\Property\SearchPropertyRequest;
use App\Http\Requests\Property\UpdatePropertyRequest;
use App\Http\Requests\Property\UploadImagesRequest;
use App\Http\Resources\Property\PropertyCollection;
use App\Http\Resources\Property\PropertyResource;
use App\Models\Amenity;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Services\PropertyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function __construct(private readonly PropertyService $propertyService) {}

    // GET /api/v1/properties
    public function index(SearchPropertyRequest $request): JsonResponse
    {
        $dto = SearchPropertyDTO::fromRequest($request);
        $properties = $this->propertyService->search($dto);

        return response()->json([
            'success' => true,
            'data'    => PropertyCollection::make($properties),
        ]);
    }

    // GET /api/v1/properties/featured
    public function featured(): JsonResponse
    {
        $properties = Property::with(['category', 'images' => fn ($q) => $q->where('is_cover', true)])
            ->published()->featured()
            ->orderBy('rating_average', 'desc')
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => PropertyResource::collection($properties),
        ]);
    }

    // GET /api/v1/properties/{property}
    public function show(Property $property): JsonResponse
    {
        if ($property->status !== 'published' && auth()->id() !== $property->owner_id && !auth()->user()?->isAdmin()) {
            abort(404);
        }

        $property->increment('views_count');

        $property->load([
            'owner.profile',
            'category',
            'images',
            'amenities',
            'reviews' => fn ($q) => $q->public()->with('reviewer')->latest()->limit(10),
        ]);

        $isFavorited = auth()->check() ? auth()->user()->hasFavorited($property->id) : false;

        return response()->json([
            'success'      => true,
            'data'         => PropertyResource::make($property),
            'is_favorited' => $isFavorited,
        ]);
    }

    // POST /api/v1/properties
    public function store(CreatePropertyRequest $request): JsonResponse
    {
        $this->authorize('create', Property::class);
        $dto = CreatePropertyDTO::fromRequest($request);
        $property = $this->propertyService->create($dto, auth()->user());

        return response()->json([
            'success' => true,
            'message' => __('property.created'),
            'data'    => PropertyResource::make($property),
        ], 201);
    }

    // PUT /api/v1/properties/{property}
    public function update(UpdatePropertyRequest $request, Property $property): JsonResponse
    {
        $this->authorize('update', $property);
        $dto = UpdatePropertyDTO::fromRequest($request);
        $updated = $this->propertyService->update($property, $dto);

        return response()->json([
            'success' => true,
            'message' => __('property.updated'),
            'data'    => PropertyResource::make($updated),
        ]);
    }

    // DELETE /api/v1/properties/{property}
    public function destroy(Property $property): JsonResponse
    {
        $this->authorize('delete', $property);
        $property->delete();

        return response()->json([
            'success' => true,
            'message' => __('property.deleted'),
        ]);
    }

    // POST /api/v1/properties/{property}/images
    public function uploadImages(UploadImagesRequest $request, Property $property): JsonResponse
    {
        $this->authorize('update', $property);
        $images = $this->propertyService->uploadImages($property, $request->file('images'));

        return response()->json([
            'success' => true,
            'message' => count($images) . ' ' . __('property.images_uploaded'),
            'data'    => $images,
        ], 201);
    }

    // DELETE /api/v1/properties/{property}/images/{image}
    public function deleteImage(Property $property, string $imageId): JsonResponse
    {
        $this->authorize('update', $property);
        $this->propertyService->deleteImage($property, $imageId);

        return response()->json([
            'success' => true,
            'message' => __('property.image_deleted'),
        ]);
    }

    // GET /api/v1/properties/{property}/availability
    public function availability(Property $property, Request $request): JsonResponse
    {
        $request->validate(['month' => 'required|integer|min:1|max:12', 'year' => 'required|integer|min:2024']);
        $blocked = $this->propertyService->getAvailability($property, $request->month, $request->year);

        return response()->json([
            'success' => true,
            'data'    => ['blocked_dates' => $blocked],
        ]);
    }

    // GET /api/v1/properties/{property}/price-quote
    public function priceQuote(Property $property, Request $request): JsonResponse
    {
        $request->validate([
            'check_in'  => 'required|date|after:today',
            'check_out' => 'required|date|after:check_in',
        ]);

        $pricing = $property->getPriceForDates(
            \Carbon\Carbon::parse($request->check_in),
            \Carbon\Carbon::parse($request->check_out)
        );

        return response()->json([
            'success' => true,
            'data'    => $pricing,
        ]);
    }

    // GET /api/v1/properties/categories
    public function categories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => PropertyCategory::active()->get(),
        ]);
    }

    // GET /api/v1/properties/amenities
    public function amenities(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => Amenity::active()->get()->groupBy('category'),
        ]);
    }

    // Owner: GET /api/v1/owner/properties
    public function ownerProperties(Request $request): JsonResponse
    {
        $properties = Property::where('owner_id', auth()->id())
            ->with(['category', 'images' => fn ($q) => $q->where('is_cover', true)])
            ->withCount(['bookings', 'reviews'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => PropertyCollection::make($properties),
        ]);
    }

    // Owner: GET /api/v1/owner/properties/{property}
    public function ownerPropertyDetail(Property $property): JsonResponse
    {
        abort_if($property->owner_id !== auth()->id() && !auth()->user()->isAdmin(), 403);

        $property->load(['category', 'images', 'amenities']);

        return response()->json([
            'success' => true,
            'data'    => PropertyResource::make($property),
        ]);
    }

    // Owner: POST /api/v1/owner/properties/{property}/availability/block
    public function blockAvailability(Request $request, Property $property): JsonResponse
    {
        abort_if($property->owner_id !== auth()->id(), 403);

        $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'reason'     => 'nullable|string|max:255',
        ]);

        $block = $property->availabilityBlocks()->create([
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'note'       => $request->reason,
        ]);

        return response()->json(['success' => true, 'data' => $block], 201);
    }

    // Owner: DELETE /api/v1/owner/properties/{property}/availability/blocks/{block}
    public function deleteBlock(Property $property, string $block): JsonResponse
    {
        abort_if($property->owner_id !== auth()->id(), 403);

        $property->availabilityBlocks()->findOrFail($block)->delete();

        return response()->json(['success' => true]);
    }

    // Owner: PATCH /api/v1/properties/{property}/images/{image}/primary
    public function setImagePrimary(Property $property, string $image): JsonResponse
    {
        abort_if($property->owner_id !== auth()->id() && !auth()->user()->isAdmin(), 403);

        $property->images()->update(['is_cover' => false]);
        $property->images()->where('id', $image)->update(['is_cover' => true]);

        return response()->json(['success' => true]);
    }
}
