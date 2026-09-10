<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>@yield('code') — {{ config('app.name', 'Ngu-h-e Clinic') }}</title>

        <style>
            body {
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
                margin: 0;
                background-color: #f4f6fb;
                color: #1e293b;
            }
            .wrap {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1.5rem;
                box-sizing: border-box;
            }
            .card {
                width: 100%;
                max-width: 32rem;
                background: #fff;
                border: 1px solid #e2e8f0;
                border-radius: 1rem;
                box-shadow: 0 10px 30px rgba(15, 42, 74, 0.08);
                padding: 2.5rem 2rem;
                text-align: center;
            }
            .brand {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                color: #0f2a4a;
                font-weight: 700;
                font-size: 1.1rem;
                margin-bottom: 1.5rem;
            }
            .code {
                font-size: 3.5rem;
                font-weight: 800;
                color: #0f2a4a;
                line-height: 1;
            }
            .title {
                margin-top: 0.5rem;
                font-size: 1.25rem;
                font-weight: 700;
            }
            .message {
                margin-top: 0.5rem;
                color: #64748b;
                font-size: 0.95rem;
            }
            .actions {
                margin-top: 1.5rem;
                display: flex;
                gap: 0.75rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            .btn {
                display: inline-block;
                padding: 0.6rem 1.25rem;
                border-radius: 0.5rem;
                font-size: 0.9rem;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                border: 1px solid transparent;
            }
            .btn-outline {
                background: #fff;
                border-color: #cbd5e1;
                color: #334155;
            }
            .btn-primary {
                background: #2563eb;
                color: #fff;
            }
        </style>
    </head>
    <body>
        <div class="wrap" role="main">
            <div class="card">
                <div class="brand">Ngu hñe · {{ __('House of Medicine') }}</div>
                <div class="code">@yield('code')</div>
                <div class="title">@yield('title')</div>
                <p class="message">@yield('message')</p>
                <div class="actions">
                    <button type="button" class="btn btn-outline" onclick="window.history.back()">{{ __('Go back') }}</button>
                    @auth
                        <a class="btn btn-primary" href="{{ route('dashboard') }}">{{ __('Back to dashboard') }}</a>
                    @else
                        <a class="btn btn-primary" href="{{ route('login') }}">{{ __('Log in') }}</a>
                    @endauth
                </div>
            </div>
        </div>
    </body>
</html>
