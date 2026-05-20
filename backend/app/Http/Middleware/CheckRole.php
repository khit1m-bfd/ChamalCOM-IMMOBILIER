<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        // Check role using the roles relationship directly (guard-agnostic)
        $userRoles = $user->roles->pluck('name')->toArray();

        foreach ($roles as $role) {
            // Support "owner|admin" style passed as a single param
            $allowed = array_filter(array_map('trim', explode('|', $role)));
            if (array_intersect($allowed, $userRoles)) {
                return $next($request);
            }
        }

        abort(403, 'Insufficient permissions.');
    }
}
