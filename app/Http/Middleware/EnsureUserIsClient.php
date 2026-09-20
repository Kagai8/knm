<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsClient
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isClient()) {
            \Log::warning('🚫 Non-client attempted portal access', [
                'user_id' => $request->user()?->id,
                'email' => $request->user()?->email,
                'url' => $request->url(),
            ]);

            abort(403, 'This area is reserved for clients.');
        }

        return $next($request);
    }
}
