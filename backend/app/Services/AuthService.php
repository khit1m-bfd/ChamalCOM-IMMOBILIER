<?php

namespace App\Services;

use App\DTOs\Auth\LoginDTO;
use App\DTOs\Auth\RegisterDTO;
use App\Models\OTP;
use App\Models\RefreshToken;
use App\Models\User;
use App\Models\UserProfile;
use App\Notifications\Auth\EmailVerificationNotification;
use App\Notifications\Auth\PasswordResetNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function __construct(
        private readonly OtpService $otpService,
    ) {}

    // ─── Register ─────────────────────────────────────────────────

    public function register(RegisterDTO $dto): array
    {
        return DB::transaction(function () use ($dto) {
            $user = User::create([
                'first_name' => $dto->firstName,
                'last_name'  => $dto->lastName,
                'email'      => $dto->email,
                'phone'      => $dto->phone,
                'password'   => Hash::make($dto->password),
                'locale'     => $dto->locale ?? 'ar',
                'status'     => 'pending',
            ]);

            $user->assignRole($dto->role ?? 'client');

            UserProfile::create(['user_id' => $user->id]);

            // Send email verification OTP
            $otp = $this->otpService->generate($user->email, 'email', 'verification');

            try {
                $user->notify(new EmailVerificationNotification($otp->code));
            } catch (\Throwable $e) {
                // Log mail failure but do not block registration
                \Illuminate\Support\Facades\Log::warning('Email verification send failed: ' . $e->getMessage());
            }

            $response = [
                'user'    => $user->load('profile'),
                'message' => 'Registration successful. Please verify your email.',
            ];

            // Expose OTP in debug mode so devs can verify without real email
            if (config('app.debug')) {
                $response['debug_otp'] = $otp->code;
            }

            return $response;
        });
    }

    // ─── Login ────────────────────────────────────────────────────

    public function login(LoginDTO $dto, string $ip = null, string $userAgent = null): array
    {
        $user = User::where('email', $dto->email)->first();

        if (!$user || !Hash::check($dto->password, $user->password)) {
            throw new \App\Exceptions\AuthException('Invalid credentials', 401);
        }

        if ($user->status === 'suspended') {
            throw new \App\Exceptions\AuthException('Account suspended', 403);
        }

        if (!$user->email_verified) {
            throw new \App\Exceptions\AuthException('Email not verified', 403, 'email_unverified');
        }

        // 2FA Check
        if ($user->two_factor_enabled) {
            $tempToken = Str::random(64);
            cache()->put("2fa_temp_{$tempToken}", $user->id, 300);
            return ['requires_2fa' => true, 'temp_token' => $tempToken];
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
            'status'        => 'active',
        ]);

        return $this->generateTokens($user, $dto->deviceName ?? 'Web', 'browser', $ip);
    }

    // ─── Verify 2FA ───────────────────────────────────────────────

    public function verify2FA(string $tempToken, string $code, string $ip = null): array
    {
        $userId = cache()->get("2fa_temp_{$tempToken}");
        if (!$userId) {
            throw new \App\Exceptions\AuthException('Invalid or expired 2FA session', 401);
        }

        $user = User::findOrFail($userId);
        $valid = $this->otpService->verify($user->phone ?? $user->email, $code, 'two_factor');

        if (!$valid) {
            throw new \App\Exceptions\AuthException('Invalid 2FA code', 401);
        }

        cache()->forget("2fa_temp_{$tempToken}");
        $user->update(['last_login_at' => now(), 'last_login_ip' => $ip]);

        return $this->generateTokens($user);
    }

    // ─── Verify Email ────────────────────────────────────────────

    public function verifyEmail(string $email, string $code): void
    {
        $valid = $this->otpService->verify($email, $code, 'verification');
        if (!$valid) {
            throw new \App\Exceptions\AuthException('Invalid or expired OTP', 422);
        }

        User::where('email', $email)->update([
            'email_verified'    => true,
            'email_verified_at' => now(),
            'status'            => 'active',
        ]);
    }

    // ─── Refresh Token ────────────────────────────────────────────

    public function refreshToken(string $refreshToken): array
    {
        $token = RefreshToken::with('user')
            ->where('token', hash('sha256', $refreshToken))
            ->valid()
            ->first();

        if (!$token) {
            throw new \App\Exceptions\AuthException('Invalid or expired refresh token', 401);
        }

        $token->update(['last_used_at' => now()]);
        $token->revoke();

        return $this->generateTokens($token->user);
    }

    // ─── Forgot Password ──────────────────────────────────────────

    public function forgotPassword(string $email): void
    {
        $user = User::where('email', $email)->first();
        if (!$user) return; // Silent fail for security

        $otp = $this->otpService->generate($email, 'email', 'password_reset');
        $user->notify(new PasswordResetNotification($otp->code));
    }

    // ─── Reset Password ───────────────────────────────────────────

    public function resetPassword(string $email, string $code, string $newPassword): void
    {
        $valid = $this->otpService->verify($email, $code, 'password_reset');
        if (!$valid) {
            throw new \App\Exceptions\AuthException('Invalid or expired OTP', 422);
        }

        User::where('email', $email)->update([
            'password' => Hash::make($newPassword),
        ]);

        // Revoke all refresh tokens
        RefreshToken::where('user_id', function ($q) use ($email) {
            $q->select('id')->from('users')->where('email', $email);
        })->update(['revoked' => true]);
    }

    // ─── Logout ───────────────────────────────────────────────────

    public function logout(User $user, string $refreshToken = null): void
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        if ($refreshToken) {
            RefreshToken::where('token', hash('sha256', $refreshToken))
                ->where('user_id', $user->id)
                ->update(['revoked' => true]);
        }
    }

    // ─── Token Generation ─────────────────────────────────────────

    private function generateTokens(User $user, string $deviceName = 'Web', string $deviceType = 'browser', string $ip = null): array
    {
        $accessToken = JWTAuth::fromUser($user);

        $rawRefreshToken = Str::random(64);
        RefreshToken::create([
            'user_id'      => $user->id,
            'token'        => hash('sha256', $rawRefreshToken),
            'device_name'  => $deviceName,
            'device_type'  => $deviceType,
            'ip_address'   => $ip,
            'expires_at'   => Carbon::now()->addMinutes(config('jwt.refresh_ttl', 20160)),
        ]);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $rawRefreshToken,
            'token_type'    => 'Bearer',
            'expires_in'    => config('jwt.ttl', 60) * 60,
            'user'          => $user->load(['profile', 'roles']),
        ];
    }
}
