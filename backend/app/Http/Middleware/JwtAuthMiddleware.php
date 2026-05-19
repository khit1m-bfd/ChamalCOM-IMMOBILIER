<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class JwtAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            if (!$user) {
                return response()->json(['message' => 'User not found', 'code' => 401], 401);
            }
            auth()->setUser($user);
        } catch (TokenExpiredException) {
            return response()->json(['message' => 'Token expired', 'code' => 401], 401);
        } catch (TokenInvalidException) {
            return response()->json(['message' => 'Token invalid', 'code' => 401], 401);
        } catch (JWTException) {
            return response()->json(['message' => 'Token absent', 'code' => 401], 401);
        }

        return $next($request);
    }
}
