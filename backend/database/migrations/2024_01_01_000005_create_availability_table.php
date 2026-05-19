<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Availability Blocks (blocked dates by owner)
        Schema::create('availability_blocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('property_id')->constrained()->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('type', ['blocked', 'booked', 'maintenance', 'owner_stay'])->default('blocked');
            $table->string('note')->nullable();
            $table->uuid('booking_id')->nullable(); // FK added after bookings table is created
            $table->timestamps();

            $table->index(['property_id', 'start_date', 'end_date']);
        });

        // Custom Pricing (seasonal pricing)
        Schema::create('property_pricing', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('property_id')->constrained()->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('price_per_night', 10, 2);
            $table->string('label')->nullable(); // "Ramadan", "Summer", "Eid"
            $table->timestamps();

            $table->index(['property_id', 'start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_pricing');
        Schema::dropIfExists('availability_blocks');
    }
};
