<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to WorkOS AuthKit (Google only).
     */
    public function redirect(Request $request)
    {
        $state = Str::random(40);
        $request->session()->put('google_state', $state);

        $query = http_build_query([
            'client_id' => config('services.workos.client_id'),
            'redirect_uri' => route('google.callback'),
            'response_type' => 'code',
            'provider' => 'GoogleOAuth', // Google only — no Apple, no Microsoft
            'state' => $state,
        ]);

        return redirect()->away('https://api.workos.com/user_management/authorize?' . $query);
    }

    /**
     * Handle the WorkOS callback and sign the user in.
     */
    public function callback(Request $request)
    {
        $state = $request->session()->pull('google_state');

        if (! $state || $state !== $request->query('state')) {
            return redirect()->route('login')->withErrors(['email' => 'Invalid sign-in state. Please try again.']);
        }

        $response = Http::post('https://api.workos.com/user_management/authenticate', [
            'client_id' => config('services.workos.client_id'),
            'client_secret' => config('services.workos.client_secret'),
            'code' => $request->query('code'),
            'grant_type' => 'authorization_code',
        ]);

        if ($response->failed()) {
            Log::error('WorkOS Google authentication failed', $response->json() ?? []);

            return redirect()->route('login')->withErrors(['email' => 'Google sign-in failed. Please try again.']);
        }

        $workosUser = $response->json('user');

        $user = User::firstOrCreate(
            ['email' => $workosUser['email']],
            [
                'name' => trim(($workosUser['first_name'] ?? '') . ' ' . ($workosUser['last_name'] ?? '')) ?: $workosUser['email'],
                'password' => Hash::make(Str::random(40)),
            ]
        );

        Auth::login($user, true);

        return redirect()->intended('/portal');
    }
}
