<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference', 20)->unique(); // CHML-2024-001234
            $table->foreignUuid('property_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('guest_id')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('owner_id')->constrained('users')->restrictOnDelete();

            // Dates
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->unsignedSmallInteger('nights_count');

            // Guests
            $table->unsignedTinyInteger('adults_count')->default(1);
            $table->unsignedTinyInteger('children_count')->default(0);
            $table->unsignedTinyInteger('infants_count')->default(0);
            $table->unsignedTinyInteger('pets_count')->default(0);

            // Pricing Snapshot (frozen at booking time)
            $table->decimal('base_price', 10, 2);
            $table->decimal('cleaning_fee', 10, 2)->default(0);
            $table->decimal('security_deposit', 10, 2)->default(0);
            $table->decimal('service_fee', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->string('currency', 3)->default('MAD');

            // Status
            $table->enum('status', [
                'pending',
                'confirmed',
                'cancelled_by_guest',
                'cancelled_by_owner',
                'cancelled_by_admin',
                'completed',
                'no_show'
            ])->default('pending');

            $table->enum('payment_status', [
                'pending',
                'partial',
                'paid',
                'refunded',
                'partially_refunded',
                'failed'
            ])->default('pending');

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->decimal('refund_amount', 10, 2)->default(0);

            // Additional
            $table->text('guest_message')->nullable();
            $table->text('owner_message')->nullable();
            $table->boolean('guest_reviewed')->default(false);
            $table->boolean('owner_reviewed')->default(false);
            $table->string('source', 20)->default('web'); // web, mobile, admin
            $table->json('snapshot')->nullable(); // property details at booking time

            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['guest_id', 'status']);
            $table->index(['owner_id', 'status']);
            $table->index(['property_id', 'check_in_date', 'check_out_date']);
            $table->index(['status', 'payment_status']);
            $table->index('reference');
            $table->index('created_at');
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->restrictOnDelete();
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->string('stripe_charge_id')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('MAD');
            $table->enum('type', ['booking', 'security_deposit', 'refund'])->default('booking');
            $table->enum('status', ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->string('payment_method')->nullable(); // card, cmi, paypal
            $table->json('payment_details')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index('stripe_payment_intent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('bookings');
    }
};
