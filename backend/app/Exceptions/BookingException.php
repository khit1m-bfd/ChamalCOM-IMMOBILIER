<?php

namespace App\Exceptions;

use Exception;

class BookingException extends Exception
{
    public function __construct(string $message = 'Booking error', int $code = 422, ?\Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
