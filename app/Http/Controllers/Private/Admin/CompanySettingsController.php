<?php

namespace App\Http\Controllers\Private\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\CompanySettings;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanySettingsController extends Controller
{
    /**
     * Guard: only super admins or users with settings.manage may touch this controller.
     */
    private function guard(): void
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::SettingsManage),
            403
        );
    }

    /**
     * Show the company settings workspace.
     */
    public function index(): Response
    {
        $this->guard();

        return Inertia::render('private/admin/CompanySettings', [
            'settings' => CompanySettings::current(),
        ]);
    }

    /**
     * Update the company settings.
     */
    public function update(Request $request)
    {
        $this->guard();

        $validated = $request->validate([
            // Firm identity
            'firm_name' => ['required', 'string', 'max:255'],
            'firm_code' => ['required', 'string', 'max:10'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
            'po_box' => ['nullable', 'string', 'max:100'],
            'business_hours' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'footer_disclaimer' => ['nullable', 'string', 'max:2000'],

            // Social media & web presence
            'facebook_url' => ['nullable', 'string', 'max:255'],
            'twitter_url' => ['nullable', 'string', 'max:255'],
            'instagram_url' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'string', 'max:255'],
            'tiktok_url' => ['nullable', 'string', 'max:255'],
            'youtube_url' => ['nullable', 'string', 'max:255'],
            'whatsapp_number' => ['nullable', 'string', 'max:50'],
            'google_business_url' => ['nullable', 'string', 'max:255'],

            // Branding
            'logo_path' => ['nullable', 'string', 'max:255'],
            'primary_color' => ['nullable', 'string', 'max:7'],
            'secondary_color' => ['nullable', 'string', 'max:7'],

            // Legal & financial
            'registration_number' => ['nullable', 'string', 'max:100'],
            'tax_pin' => ['nullable', 'string', 'max:100'],
            'vat_number' => ['nullable', 'string', 'max:100'],
            'jurisdiction' => ['nullable', 'string', 'max:100'],
            'currency' => ['nullable', 'string', 'max:10'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:100'],
            'bank_branch' => ['nullable', 'string', 'max:255'],
            'swift_code' => ['nullable', 'string', 'max:50'],

            // File number format
            'file_number_format' => ['nullable', 'string', 'max:255'],
            'file_number_sequence_length' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        $settings = CompanySettings::current();
        $settings->update($validated);

        return redirect()->route('admin.settings.index')
            ->with('success', 'Company settings updated successfully.');
    }
}
