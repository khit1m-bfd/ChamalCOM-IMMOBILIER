<?php

namespace App\Http\Controllers\Auth;

use App\DTOs\Auth\LoginDTO;
use App\DTOs\Auth\RegisterDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Requests\Auth\Verify2FARequest;
use App\Http\Resources\Auth\AuthResource;
use App\Http\Resources\Auth\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    // POST /api/v1/auth/register
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register(RegisterDTO::fromRequest($request));

        $response = [
            'success' => true,
            'message' => __('auth.registration_success'),
            'data'    => UserResource::make($result['user']),
        ];

        if (config('app.debug') && isset($result['debug_otp'])) {
            $response['debug_otp'] = $result['debug_otp'];
        }

        return response()->json($response, 201);
    }

    // POST /api/v1/auth/login
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            LoginDTO::fromRequest($request),
            $request->ip(),
            $request->userAgent()
        );

        if (isset($result['requires_2fa'])) {
            return response()->json([
                'success'     => true,
                'requires_2fa'=> true,
                'temp_token'  => $result['temp_token'],
                'message'     => __('auth.2fa_required'),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => __('auth.login_success'),
            'data'    => AuthResource::make($result),
        ]);
    }

    // POST /api/v1/auth/verify-2fa
    public function verify2FA(Verify2FARequest $request): JsonResponse
    {
        $result = $this->authService->verify2FA(
            $request->temp_token,
            $request->code,
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => __('auth.login_success'),
            'data'    => AuthResource::make($result),
        ]);
    }

    // POST /api/v1/auth/verify-email
    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        $this->authService->verifyEmail($request->email, $request->code);
        return response()->json([
            'success' => true,
            'message' => __('auth.email_verified'),
        ]);
    }

    // POST /api/v1/auth/resend-otp
    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email'   => 'required|email',
            'purpose' => 'required|in:verification,password_reset,email_verification',
        ]);

        // Normalize frontend alias 'email_verification' → 'verification'
        $purpose = $request->purpose === 'email_verification' ? 'verification' : $request->purpose;

        app(\App\Services\OtpService::class)->resend($request->email, 'email', $purpose);

        return response()->json([
            'success' => true,
            'message' => __('auth.otp_sent'),
        ]);
    }

    // POST /api/v1/auth/refresh
    public function refresh(Request $request): JsonResponse
    {
        $request->validate(['refresh_token' => 'required|string']);
        $result = $this->authService->refreshToken($request->refresh_token);

        return response()->json([
            'success' => true,
            'data'    => AuthResource::make($result),
        ]);
    }

    // POST /api/v1/auth/forgot-password
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->forgotPassword($request->email);
        return response()->json([
            'success' => true,
            'message' => __('auth.password_reset_sent'),
        ]);
    }

    // POST /api/v1/auth/reset-password
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword($request->email, $request->code, $request->password);
        return response()->json([
            'success' => true,
            'message' => __('auth.password_reset_success'),
        ]);
    }

    // POST /api/v1/auth/logout
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout(auth()->user(), $request->refresh_token);
        return response()->json([
            'success' => true,
            'message' => __('auth.logout_success'),
        ]);
    }

    // GET /api/v1/auth/me
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => UserResource::make(auth()->user()->load(['profile', 'roles.permissions'])),
        ]);
    }
}
