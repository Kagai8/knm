<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Private\EnquiryController;
use App\Http\Controllers\Private\TriageController;
use App\Http\Controllers\Private\MatterController;
use App\Http\Controllers\Private\MatterStageController;

/*
|--------------------------------------------------------------------------
| WorkOS Google (AuthKit) — Google only
|--------------------------------------------------------------------------
*/
Route::get('auth/google', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

/*
|--------------------------------------------------------------------------
| Authentication — Breeze-style email/password + custom pages
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('login', function () {
        return inertia('public/auth/Login');
    })->name('login');

    Route::get('register', function () {
        return inertia('public/auth/Register');
    })->name('register');

    // Public login: clients go to portal, staff get redirected to private login
    Route::post('login', function (Request $request) {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        // If this user is staff, they used the wrong login page
        if ($request->user()->isStaff()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Staff members should use the private login at /private/login',
            ]);
        }

        return redirect('/portal');
    });

    Route::post('register', function (Request $request) {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // New registrations are always clients
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'client',
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/portal');
    });

    /*
    |----------------------------------------------------------------------
    | Private Login (Staff)
    |----------------------------------------------------------------------
    */
    Route::get('private/login', function () {
        return inertia('private/auth/Login');
    })->name('private.login');

    Route::post('private/login', function (Request $request) {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        // Only staff can enter the private workspace
        if (! $request->user()->isStaff()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'This account does not have staff access.',
            ]);
        }

        // DIRECT redirect — no stale intended URL trap
        return redirect('/private');
    });
});

Route::post('logout', function (Request $request) {
    Auth::logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
})->middleware('auth')->name('logout');

// Handle accidental GET to /logout gracefully
Route::get('logout', function () {
    return redirect('/');
})->name('logout.get');

/*
|--------------------------------------------------------------------------
| Public Pages
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return inertia('public/pages/Home');
})->name('home');

Route::get('/about', function () {
    return inertia('public/pages/About');
})->name('about');

Route::get('/practice-areas', function () {
    return inertia('public/pages/PracticeAreas');
})->name('practice-areas');

Route::get('/team', function () {
    return inertia('public/pages/Team');
})->name('team');

Route::get('/blog', function () {
    return inertia('public/pages/Blog');
})->name('blog');

Route::get('/blog/{slug}', function (string $slug) {
    return inertia('public/pages/BlogPost', ['slug' => $slug]);
})->name('blog.show');

Route::get('/reviews', function () {
    return inertia('public/pages/Reviews');
})->name('reviews');

Route::get('/contact', function () {
    return inertia('public/pages/Contact');
})->name('contact');

/*
|--------------------------------------------------------------------------
| Client Portal (client-facing, app-style)
|--------------------------------------------------------------------------
*/
Route::prefix('portal')->group(function () {
    Route::get('/', function () {
        return inertia('public/portal/pages/Dashboard');
    })->name('portal.dashboard');
    Route::get('/cases', function () {
        return inertia('public/portal/pages/Cases');
    })->name('portal.cases');
    Route::get('/documents', function () {
        return inertia('public/portal/pages/Documents');
    })->name('portal.documents');
    Route::get('/messages', function () {
        return inertia('public/portal/pages/Messages');
    })->name('portal.messages');
    Route::get('/invoices', function () {
        return inertia('public/portal/pages/Invoices');
    })->name('portal.invoices');
    Route::get('/profile', function () {
        return inertia('public/portal/pages/Profile');
    })->name('portal.profile');
});

/*
|--------------------------------------------------------------------------
| Private Workspace (Staff only)
|--------------------------------------------------------------------------
|
| URL is just /private — the "Dashboard" component renders internally.
| Don't visit /private/Dashboard (that's the internal path, not the URL).
|
*/
Route::middleware(['auth', 'staff'])->prefix('private')->group(function () {
    Route::get('/', function () {
        return inertia('private/Dashboard');
    })->name('private.dashboard');
            /* ── Admin / Role Management ──────────────────────────────── */
    Route::get('/admin/roles', [\App\Http\Controllers\Private\Admin\RoleController::class, 'index'])->name('admin.roles.index');
    Route::post('/admin/roles', [\App\Http\Controllers\Private\Admin\RoleController::class, 'store'])->name('admin.roles.store');
    Route::put('/admin/roles/{role}/permissions', [\App\Http\Controllers\Private\Admin\RoleController::class, 'updatePermissions'])->name('admin.roles.permissions.update');
    Route::delete('/admin/roles/{role}', [\App\Http\Controllers\Private\Admin\RoleController::class, 'destroy'])->name('admin.roles.destroy');

        /* ── Admin / User Management ──────────────────────────────── */
    Route::get('/admin/users', [\App\Http\Controllers\Private\Admin\UserController::class, 'index'])->name('admin.users.index');
    Route::post('/admin/users', [\App\Http\Controllers\Private\Admin\UserController::class, 'store'])->name('admin.users.store');
    Route::put('/admin/users/{user}', [\App\Http\Controllers\Private\Admin\UserController::class, 'update'])->name('admin.users.update');
    Route::post('/admin/users/{user}/disable', [\App\Http\Controllers\Private\Admin\UserController::class, 'disable'])->name('admin.users.disable');
    Route::post('/admin/users/{user}/enable', [\App\Http\Controllers\Private\Admin\UserController::class, 'enable'])->name('admin.users.enable');
    Route::delete('/admin/users/{user}', [\App\Http\Controllers\Private\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');


        /* ── Admin / Practice Areas ───────────────────────────────── */
    Route::get('/admin/practice-areas', [\App\Http\Controllers\Private\Admin\PracticeAreaController::class, 'index'])->name('admin.practice-areas.index');
    Route::post('/admin/practice-areas', [\App\Http\Controllers\Private\Admin\PracticeAreaController::class, 'store'])->name('admin.practice-areas.store');
    Route::put('/admin/practice-areas/{practiceArea}', [\App\Http\Controllers\Private\Admin\PracticeAreaController::class, 'update'])->name('admin.practice-areas.update');
    Route::delete('/admin/practice-areas/{practiceArea}', [\App\Http\Controllers\Private\Admin\PracticeAreaController::class, 'destroy'])->name('admin.practice-areas.destroy');


        /* ── Admin / Matter Roles ───────────────────────────────── */
    Route::get('/admin/matter-roles', [\App\Http\Controllers\Private\Admin\MatterRoleController::class, 'index'])->name('admin.matter-roles.index');
    Route::post('/admin/matter-roles', [\App\Http\Controllers\Private\Admin\MatterRoleController::class, 'store'])->name('admin.matter-roles.store');
    Route::put('/admin/matter-roles/{matterRole}', [\App\Http\Controllers\Private\Admin\MatterRoleController::class, 'update'])->name('admin.matter-roles.update');
    Route::delete('/admin/matter-roles/{matterRole}', [\App\Http\Controllers\Private\Admin\MatterRoleController::class, 'destroy'])->name('admin.matter-roles.destroy');


        /* ── Admin / Calendar Event Types ───────────────────────── */
    Route::get('/admin/calendar-event-types', [\App\Http\Controllers\Private\Admin\CalendarEventTypeController::class, 'index'])->name('admin.calendar-event-types.index');
    Route::post('/admin/calendar-event-types', [\App\Http\Controllers\Private\Admin\CalendarEventTypeController::class, 'store'])->name('admin.calendar-event-types.store');
    Route::put('/admin/calendar-event-types/{calendarEventType}', [\App\Http\Controllers\Private\Admin\CalendarEventTypeController::class, 'update'])->name('admin.calendar-event-types.update');
    Route::delete('/admin/calendar-event-types/{calendarEventType}', [\App\Http\Controllers\Private\Admin\CalendarEventTypeController::class, 'destroy'])->name('admin.calendar-event-types.destroy');

        /* ── Admin / Company Settings ─────────────────────────────── */
    Route::get('/admin/settings', [\App\Http\Controllers\Private\Admin\CompanySettingsController::class, 'index'])->name('admin.settings.index');
    Route::put('/admin/settings', [\App\Http\Controllers\Private\Admin\CompanySettingsController::class, 'update'])->name('admin.settings.update');

        /* ── Clients ────────────────────────────────────────────────── */
    Route::get('/clients', [\App\Http\Controllers\Private\ClientController::class, 'index'])->name('private.clients.index');
    Route::post('/clients', [\App\Http\Controllers\Private\ClientController::class, 'store'])->name('private.clients.store');
    Route::get('/clients/{client}', [\App\Http\Controllers\Private\ClientController::class, 'show'])->name('private.clients.show');
    Route::put('/clients/{client}', [\App\Http\Controllers\Private\ClientController::class, 'update'])->name('private.clients.update');
    Route::patch('/clients/{client}/status', [\App\Http\Controllers\Private\ClientController::class, 'updateStatus'])->name('private.clients.status');
    Route::delete('/clients/{client}', [\App\Http\Controllers\Private\ClientController::class, 'destroy'])->name('private.clients.destroy');


    /* ── Contacts ───────────────────────────────────────────────── */
    Route::get('/contacts', [\App\Http\Controllers\Private\ContactController::class, 'index'])->name('private.contacts.index');
    Route::post('/contacts', [\App\Http\Controllers\Private\ContactController::class, 'store'])->name('private.contacts.store');
    Route::put('/contacts/{contact}', [\App\Http\Controllers\Private\ContactController::class, 'update'])->name('private.contacts.update');
    Route::delete('/contacts/{contact}', [\App\Http\Controllers\Private\ContactController::class, 'destroy'])->name('private.contacts.destroy');


    /* ── Enquiries ──────────────────────────────────────────────── */
    Route::get('/enquiries', [EnquiryController::class, 'index'])->name('private.enquiries.index');
    Route::get('/enquiries/{enquiry}', [EnquiryController::class, 'show'])->name('private.enquiries.show');

    /* ── Triage Actions ─────────────────────────────────────────── */
    Route::post('/enquiries/{enquiry}/assign-triager', [TriageController::class, 'assignTriager'])->name('private.enquiries.assign-triager');
    Route::post('/enquiries/{enquiry}/conflict-check', [TriageController::class, 'runConflictCheck'])->name('private.enquiries.conflict-check');
    Route::post('/enquiries/{enquiry}/approve', [TriageController::class, 'approve'])->name('private.enquiries.approve');
    Route::post('/enquiries/{enquiry}/reject', [TriageController::class, 'reject'])->name('private.enquiries.reject');
    Route::post('/enquiries/{enquiry}/convert', [TriageController::class, 'convert'])->name('private.enquiries.convert');
    Route::post('/enquiries/{enquiry}/override-conflict', [TriageController::class, 'overrideConflict'])->name('private.enquiries.override-conflict');

    /* ── Matters ────────────────────────────────────────────────── */
    Route::get('/matters', [MatterController::class, 'index'])->name('private.matters.index');
    Route::post('/matters', [MatterController::class, 'store'])->name('private.matters.store');
    Route::get('/matters/{matter}', [MatterController::class, 'show'])->name('private.matters.show');
    Route::put('/matters/{matter}', [MatterController::class, 'update'])->name('private.matters.update');
    Route::post('/matters/{matter}/team', [MatterController::class, 'assignTeam'])->name('private.matters.team.assign');
    Route::delete('/matters/{matter}/team/{user}/{matterRole}', [MatterController::class, 'removeTeam'])->name('private.matters.team.remove');
    Route::post('/matters/{matter}/contacts', [MatterController::class, 'assignContact'])->name('private.matters.contacts.assign');
    Route::delete('/matters/{matter}/contacts/{contact}', [MatterController::class, 'removeContact'])->name('private.matters.contacts.remove');
    Route::post('/matters/{matter}/archive', [MatterController::class, 'archive'])->name('private.matters.archive');
    Route::post('/matters/{matter}/unarchive', [MatterController::class, 'unarchive'])->name('private.matters.unarchive');

    /* ── Stage Transitions ──────────────────────────────────────── */
    Route::post('/matters/{matter}/advance', [MatterStageController::class, 'advance'])->name('private.matters.advance');
    Route::post('/matters/{matter}/move-to', [MatterStageController::class, 'moveTo'])->name('private.matters');
});

/*
|--------------------------------------------------------------------------
| Starter dashboard (kept for starter kit compatibility)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('/dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
