<?php

namespace App\DTOs\Auth;

use Illuminate\Http\Request;

readonly class RegisterDTO
{
    public function __construct(
        public string  $firstName,
        public string  $lastName,
        public string  $email,
        public string  $password,
        public ?string $phone  = null,
        public ?string $role   = 'client',
        public ?string $locale = 'ar',
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            firstName: $request->first_name,
            lastName:  $request->last_name,
            email:     $request->email,
            password:  $request->password,
            phone:     $request->phone,
            role:      $request->role ?? 'client',
            locale:    $request->locale ?? 'ar',
        );
    }
}
