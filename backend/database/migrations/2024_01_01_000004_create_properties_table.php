<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Property Categories
        Schema::create('property_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name_ar', 100);
            $table->string('name_fr', 100);
            $table->string('slug', 120)->unique();
            $table->string('icon', 50)->default('home');
            $table->string('description_ar')->nullable();
            $table->string('description_fr')->nullable();
            $table->boolean('active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Amenities
        Schema::create('amenities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name_ar', 100);
            $table->string('name_fr', 100);
            $table->string('icon', 50);
            $table->string('category', 50)->default('general'); // general, safety, kitchen, outdoor...
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // Properties
        Schema::create('properties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('category_id')->constrained('property_categories')->restrictOnDelete();

            // Basic Info
            $table->string('title_ar');
            $table->string('title_fr');
            $table->text('description_ar');
            $table->text('description_fr');
            $table->string('slug', 300)->unique();

            // Pricing
            $table->decimal('price_per_night', 10, 2);
            $table->decimal('price_per_week', 10, 2)->nullable();
            $table->decimal('price_per_month', 10, 2)->nullable();
            $table->string('currency', 3)->default('MAD');
            $table->decimal('security_deposit', 10, 2)->default(0);
            $table->decimal('cleaning_fee', 10, 2)->default(0);

            // Location
            $table->string('address_street');
            $table->string('address_city', 100)->default('Oued Laou');
            $table->string('address_region', 100)->default('Tétouan-Al Hoceïma-Taounate');
            $table->string('address_country', 5)->default('MA');
            $table->string('address_postal', 10)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('location_description_ar')->nullable();
            $table->text('location_description_fr')->nullable();

            // Capacity
            $table->unsignedTinyInteger('max_guests')->default(1);
            $table->unsignedTinyInteger('bedrooms')->default(1);
            $table->unsignedTinyInteger('bathrooms')->default(1);
            $table->unsignedTinyInteger('beds')->default(1);

            // Rules & Policies
            $table->unsignedTinyInteger('min_nights')->default(1);
            $table->unsignedSmallInteger('max_nights')->default(365);
            $table->unsignedTinyInteger('check_in_hour')->default(14);
            $table->unsignedTinyInteger('check_out_hour')->default(11);
            $table->boolean('instant_booking')->default(false);
            $table->boolean('pets_allowed')->default(false);
            $table->boolean('smoking_allowed')->default(false);
            $table->boolean('events_allowed')->default(false);
            $table->boolean('children_allowed')->default(true);
            $table->text('house_rules_ar')->nullable();
            $table->text('house_rules_fr')->nullable();
            $table->enum('cancellation_policy', ['flexible', 'moderate', 'strict', 'super_strict'])->default('moderate');

            // Status
            $table->enum('status', ['draft', 'pending', 'published', 'suspended', 'archived'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_verified')->default(false);

            // Stats
            $table->decimal('rating_average', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('bookings_count')->default(0);
            $table->unsignedInteger('favorites_count')->default(0);

            // SEO
            $table->string('meta_title_ar')->nullable();
            $table->string('meta_title_fr')->nullable();
            $table->text('meta_description_ar')->nullable();
            $table->text('meta_description_fr')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['owner_id', 'status']);
            $table->index(['status', 'is_featured']);
            $table->index(['address_city', 'status']);
            $table->index(['latitude', 'longitude']);
            $table->index('price_per_night');
            $table->index('created_at');
        });

        // Property Images
        Schema::create('property_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('property_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->string('public_id');
            $table->string('thumbnail_url')->nullable();
            $table->string('alt_ar')->nullable();
            $table->string('alt_fr')->nullable();
            $table->boolean('is_cover')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->timestamps();

            $table->index(['property_id', 'is_cover']);
        });

        // Property - Amenities pivot
        Schema::create('property_amenity', function (Blueprint $table) {
            $table->foreignUuid('property_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('amenity_id')->constrained()->cascadeOnDelete();
            $table->primary(['property_id', 'amenity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_amenity');
        Schema::dropIfExists('property_images');
        Schema::dropIfExists('properties');
        Schema::dropIfExists('amenities');
        Schema::dropIfExists('property_categories');
    }
};
