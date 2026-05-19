<?php

namespace App\Exceptions;

use Exception;

class AuthException extends Exception
{
    public function __construct(
        string $message = 'Authentication failed',
        int $code = 401,
        public readonly ?string $type = null,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
