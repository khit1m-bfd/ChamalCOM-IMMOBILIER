<?php

namespace App\Services;

use App\Models\OTP;
use Carbon\Carbon;

class OtpService
{
    private int $ttl;
    private int $length;
    private int $maxAttempts = 5;

    public function __construct()
    {
        $this->ttl    = config('auth.otp_ttl', 600);
        $this->length = config('auth.otp_length', 6);
    }

    public function generate(string $identifier, string $type, string $purpose): OTP
    {
        // Invalidate previous unused OTPs
        OTP::where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->where('used', false)
            ->delete();

        $code = str_pad((string) random_int(0, (10 ** $this->length) - 1), $this->length, '0', STR_PAD_LEFT);

        return OTP::create([
            'identifier' => $identifier,
            'type'       => $type,
            'purpose'    => $purpose,
            'code'       => $code,
            'expires_at' => Carbon::now()->addSeconds($this->ttl),
        ]);
    }

    public function verify(string $identifier, string $code, string $purpose): bool
    {
        $otp = OTP::where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otp) return false;

        $otp->increment('attempts');

        if ($otp->attempts > $this->maxAttempts) {
            $otp->update(['used' => true]);
            throw new \App\Exceptions\AuthException('Too many OTP attempts', 429);
        }

        if ($otp->code !== $code) return false;

        $otp->update(['used' => true, 'used_at' => now()]);
        return true;
    }

    public function resend(string $identifier, string $type, string $purpose): OTP
    {
        $lastOtp = OTP::where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->latest()
            ->first();

        // Throttle: min 60 seconds between resends
        if ($lastOtp && $lastOtp->created_at->diffInSeconds(now()) < 60) {
            $wait = 60 - $lastOtp->created_at->diffInSeconds(now());
            throw new \App\Exceptions\AuthException("Please wait {$wait} seconds before resending", 429);
        }

        return $this->generate($identifier, $type, $purpose);
    }
}
