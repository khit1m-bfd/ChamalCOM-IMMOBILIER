<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\SetLocale;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api:              __DIR__ . '/../routes/api.php',
        web:              __DIR__ . '/../routes/web.php',
        apiPrefix:        'api',
        health:           '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'auth.jwt'  => \App\Http\Middleware\JwtAuthMiddleware::class,
            'role'      => \App\Http\Middleware\CheckRole::class,
            'permission'=> \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'set.locale'=> SetLocale::class,
        ]);

        $middleware->appendToGroup('api', [
            SetLocale::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated', 'code' => 401], 401);
            }
        });

        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors'  => $e->errors(),
                    'code'    => 422,
                ], 422);
            }
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                $model = strtolower(class_basename($e->getModel()));
                return response()->json(['message' => ucfirst($model) . ' not found', 'code' => 404], 404);
            }
        });

        $exceptions->render(function (\Spatie\Permission\Exceptions\UnauthorizedException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Forbidden', 'code' => 403], 403);
            }
        });
    })->create();
