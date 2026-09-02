<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isStaff()) {
            // Not logged in or not a staff member — kick them out
            if ($request->user()) {
                auth()->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return redirect('/private/login')->withErrors([
                'email' => 'This account does not have staff access.',
            ]);
        }

        return $next($request);
    }
}
