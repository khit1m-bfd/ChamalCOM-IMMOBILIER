<?php

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\ServiceProvider;

return [
    'name'         => env('APP_NAME', 'ChamalCom'),
    'env'          => env('APP_ENV', 'production'),
    'debug'        => (bool) env('APP_DEBUG', false),
    'url'          => env('APP_URL', 'http://localhost'),
    'asset_url'    => env('ASSET_URL'),
    'timezone'     => 'Africa/Casablanca',
    'locale'       => 'ar',
    'fallback_locale' => 'fr',
    'faker_locale' => 'ar_MA',
    'key'          => env('APP_KEY'),
    'cipher'       => 'AES-256-CBC',
    'maintenance'  => ['driver' => 'file'],

    'providers' => ServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
    ])->toArray(),

    'aliases' => Facade::defaultAliases()->merge([
        'JWTAuth'    => Tymon\JWTAuth\Facades\JWTAuth::class,
        'JWTFactory' => Tymon\JWTAuth\Facades\JWTFactory::class,
        'Cloudinary' => CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class,
    ])->toArray(),
];
