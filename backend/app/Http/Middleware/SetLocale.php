<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language')
            ?? $request->query('lang')
            ?? auth()->user()?->locale
            ?? config('app.locale', 'ar');

        // Only allow ar and fr
        $locale = in_array(substr($locale, 0, 2), ['ar', 'fr']) ? substr($locale, 0, 2) : 'ar';
        app()->setLocale($locale);

        return $next($request);
    }
}
