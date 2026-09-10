<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Branded React error pages (resources/js/pages/errors/*) instead of
        // the plain responses, so users always have a way back.
        // Unknown codes fall through to the default error views.
        $exceptions->respond(function ($response) {
            if (request()->expectsJson()) {
                return $response;
            }

            $component = match ($response->getStatusCode()) {
                401 => 'errors/401',
                402 => 'errors/402',
                403 => 'errors/403',
                404 => 'errors/404',
                419 => 'errors/419',
                429 => 'errors/429',
                500 => 'errors/500',
                503 => 'errors/503',
                default => null,
            };

            if ($component === null) {
                return $response;
            }

            return \Inertia\Inertia::render($component)->toResponse(request())->setStatusCode($response->getStatusCode());
        });
    })->create();
