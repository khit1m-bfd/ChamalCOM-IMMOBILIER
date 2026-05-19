<?php

namespace App\DTOs\Auth;

use Illuminate\Http\Request;

readonly class LoginDTO
{
    public function __construct(
        public string  $email,
        public string  $password,
        public ?string $deviceName = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            email:      $request->email,
            password:   $request->password,
            deviceName: $request->device_name ?? $request->userAgent(),
        );
    }
}
