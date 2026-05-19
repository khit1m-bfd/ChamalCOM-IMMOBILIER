<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

// ─────────────────────────────────────────────────────────────────
// API V1
// ─────────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // ──── PUBLIC ROUTES ────────────────────────────────────────────

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('register',         [AuthController::class, 'register']);
        Route::post('login',            [AuthController::class, 'login']);
        Route::post('verify-2fa',       [AuthController::class, 'verify2FA']);
        Route::post('verify-email',     [AuthController::class, 'verifyEmail']);
        Route::post('resend-otp',       [AuthController::class, 'resendOtp']);
        Route::post('refresh',          [AuthController::class, 'refresh']);
        Route::post('forgot-password',  [AuthController::class, 'forgotPassword']);
        Route::post('reset-password',   [AuthController::class, 'resetPassword']);
    });

    // Public Properties
    Route::prefix('properties')->group(function () {
        Route::get('/',                             [PropertyController::class, 'index']);
        Route::get('/featured',                     [PropertyController::class, 'featured']);
        Route::get('/categories',                   [PropertyController::class, 'categories']);
        Route::get('/amenities',                    [PropertyController::class, 'amenities']);
        Route::get('/{property}',                   [PropertyController::class, 'show']);
        Route::get('/{property}/availability',      [PropertyController::class, 'availability']);
        Route::get('/{property}/price-quote',       [PropertyController::class, 'priceQuote']);
        Route::get('/{property}/reviews',           [ReviewController::class, 'index']);
    });

    // ──── AUTHENTICATED ROUTES ─────────────────────────────────────
    Route::middleware('auth:api')->group(function () {

        // Auth
        Route::post('auth/logout',  [AuthController::class, 'logout']);
        Route::get('auth/me',       [AuthController::class, 'me']);

        // User Profile
        Route::prefix('user')->group(function () {
            Route::get('profile',                   [UserController::class, 'profile']);
            Route::put('profile',                   [UserController::class, 'updateProfile']);
            Route::post('avatar',                   [UserController::class, 'uploadAvatar']);
            Route::put('password',                  [UserController::class, 'updatePassword']);
            Route::get('notifications',             [UserController::class, 'notifications']);
            Route::post('notifications/{id}/read',  [UserController::class, 'markNotificationRead']);
            Route::post('notifications/read-all',   [UserController::class, 'markAllNotificationsRead']);
        });

        // Favorites
        Route::post('properties/{property}/favorite',   [UserController::class, 'toggleFavorite']);
        Route::get('favorites',                         [UserController::class, 'favorites']);

        // Bookings (Guest/Owner/Admin)
        Route::prefix('bookings')->group(function () {
            Route::post('/',                        [BookingController::class, 'store']);
            Route::get('/',                         [BookingController::class, 'index']);
            Route::get('/stats',                    [BookingController::class, 'stats']);
            Route::get('/{booking}',                [BookingController::class, 'show']);
            Route::post('/{booking}/confirm',       [BookingController::class, 'confirm']);
            Route::post('/{booking}/cancel',        [BookingController::class, 'cancel']);
        });

        // Payments
        Route::prefix('payments')->group(function () {
            Route::post('/intent/{booking}',         [PaymentController::class, 'createIntent']);
            Route::post('/confirm/{booking}',        [PaymentController::class, 'confirmPayment']);
            Route::get('/booking/{booking}',         [PaymentController::class, 'getPayment']);
        });
        Route::post('webhooks/stripe',              [PaymentController::class, 'webhook'])->withoutMiddleware('auth:api');

        // Reviews
        Route::post('bookings/{booking}/review',    [ReviewController::class, 'store']);
        Route::post('reviews/{review}/reply',       [ReviewController::class, 'reply']);

        // Messaging
        Route::prefix('conversations')->group(function () {
            Route::get('/',                         [MessageController::class, 'conversations']);
            Route::post('/',                        [MessageController::class, 'createConversation']);
            Route::get('/{conversation}/messages',  [MessageController::class, 'messages']);
            Route::post('/{conversation}/messages', [MessageController::class, 'send']);
            Route::post('/{conversation}/read',     [MessageController::class, 'markRead']);
        });
        // Alias used by frontend
        Route::get('messages/conversations',        [MessageController::class, 'conversations']);
        Route::get('messages/unread-count',         [MessageController::class, 'unreadCount']);

        // ── OWNER ROUTES ─────────────────────────────────────────────
        Route::middleware('role:owner|admin')->group(function () {
            // Dashboard & stats
            Route::get('owner/dashboard/stats',          [BookingController::class, 'ownerDashboardStats']);
            Route::get('owner/earnings',                 [BookingController::class, 'ownerEarnings']);
            Route::get('owner/analytics',                [BookingController::class, 'ownerAnalytics']);

            // Owner bookings
            Route::get('owner/bookings',                 [BookingController::class, 'ownerBookings']);
            Route::post('owner/bookings/{booking}/confirm', [BookingController::class, 'ownerConfirm']);
            Route::post('owner/bookings/{booking}/reject',  [BookingController::class, 'ownerReject']);

            // Owner properties
            Route::get('owner/properties',               [PropertyController::class, 'ownerProperties']);
            Route::get('owner/properties/{property}',    [PropertyController::class, 'ownerPropertyDetail']);
            Route::post('properties',                    [PropertyController::class, 'store']);
            Route::put('properties/{property}',          [PropertyController::class, 'update']);
            Route::delete('properties/{property}',       [PropertyController::class, 'destroy']);
            Route::post('properties/{property}/images',  [PropertyController::class, 'uploadImages']);
            Route::delete('properties/{property}/images/{image}', [PropertyController::class, 'deleteImage']);
            Route::patch('properties/{property}/images/{image}/primary', [PropertyController::class, 'setImagePrimary']);

            // Availability blocks
            Route::post('owner/properties/{property}/availability/block',             [PropertyController::class, 'blockAvailability']);
            Route::delete('owner/properties/{property}/availability/blocks/{block}',  [PropertyController::class, 'deleteBlock']);
        });

        // ── ADMIN ROUTES ─────────────────────────────────────────────
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('dashboard',                         [AdminController::class, 'dashboard']);
            Route::get('analytics',                         [AdminController::class, 'analytics']);
            Route::get('users',                             [AdminController::class, 'users']);
            Route::patch('users/{user}/status',             [AdminController::class, 'updateUserStatus']);
            Route::get('properties/pending',                [AdminController::class, 'pendingProperties']);
            Route::patch('properties/{property}/approve',   [AdminController::class, 'approveProperty']);
            Route::patch('properties/{property}/feature',   [AdminController::class, 'toggleFeature']);
        });
    });
});
