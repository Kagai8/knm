<?php

namespace App\Http\Controllers\Private;

use App\Enums\MatterStage;
use App\Enums\MatterStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Matter;
use App\Models\MatterRole;
use App\Models\PracticeArea;
use App\Models\User;
use App\Services\FileNumberGenerator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Contact;

class MatterController extends Controller
{
    public function __construct(
        protected FileNumberGenerator $fileNumbers
    ) {}

        /**
     * List all matters the user is allowed to see, with search, filtering, sorting, and pagination.
     */
    public function index(Request $request): Response
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersView),
            403
        );

        $search = $request->query('search');
        $sort = $request->query('sort', 'opened_at');
        $direction = $request->query('direction', 'desc');
        $perPage = $request->query('per_page', 25);
        $perPage = $perPage === 'all' || $perPage == 999999 ? 10000 : min((int) $perPage, 100);

        $query = Matter::query()
            ->with(['client', 'practiceArea', 'leadAdvocate']);

        // Global search across matter fields and related models
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('file_number', 'ilike', "%{$search}%")
                  ->orWhere('title', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%")
                  ->orWhereHas('client', fn ($q) => $q->where('name', 'ilike', "%{$search}%"))
                  ->orWhereHas('practiceArea', fn ($q) => $q->where('name', 'ilike', "%{$search}%"))
                  ->orWhereHas('leadAdvocate', fn ($q) => $q->where('name', 'ilike', "%{$search}%"));
            });
        }

        // Apply filters from the URL query string
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($stage = $request->query('stage')) {
            $query->where('stage', $stage);
        }
        if ($practiceAreaId = $request->query('practice_area_id')) {
            $query->where('practice_area_id', $practiceAreaId);
        }

        // Sorting (only allow safe columns)
        $allowedSorts = ['file_number', 'title', 'stage', 'status', 'opened_at', 'created_at'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest('opened_at');
        }

        $matters = $query->paginate($perPage)->withQueryString();

        // Format statuses and stages for the frontend
        $statuses = collect(MatterStatus::cases())
            ->map(fn (MatterStatus $s) => ['value' => $s->value, 'label' => $s->label()])
            ->values()
            ->all();

        $stages = collect(MatterStage::cases())
            ->map(fn (MatterStage $s) => ['value' => $s->value, 'label' => $s->label()])
            ->values()
            ->all();

        return Inertia::render('private/matters/Index', [
            'matters' => $matters,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'stage' => $stage,
                'practice_area_id' => $practiceAreaId,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
            'statuses' => $statuses,
            'stages' => $stages,
            'practiceAreas' => PracticeArea::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'clients' => Client::orderBy('name')->get(['id', 'name']),
            // Lead advocates = partners (users who can approve matters).
            // Associates/paralegals join a matter later via the Team (C.4).
            'advocates' => User::withPermission(Permission::MattersApprove->value)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Show the deep-dive workspace for a single matter.
     */
    public function show(Matter $matter): Response
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersView),
            403
        );

        // Eager load everything the matter dashboard needs in a single query pass
        $matter->load([
            'client',
            'practiceArea',
            'leadAdvocate',
            'team', // Load the users; we will map their roles via the matterRoles prop
            'contacts',
            'statusHistory.changedBy',
        ]);

        return Inertia::render('private/matters/Show', [
            'matter' => $matter,
            'practiceAreas' => PracticeArea::where('is_active', true)->get(['id', 'name']),
            'advocates' => User::whereNotNull('role_id')->orderBy('name')->get(['id', 'name']),
            'matterRoles' => MatterRole::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            // Pass all contacts so the "Link Contact" dropdown has options
            'allContacts' => Contact::orderBy('name')->get(['id', 'name', 'type', 'company_name', 'email']),
        ]);
    }

    /**
     * Manually create a new matter (bypassing the enquiry pipeline).
     */
    public function store(Request $request)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersCreate),
            403
        );

        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'practice_area_id' => ['required', 'exists:practice_areas,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'lead_advocate_id' => ['nullable', 'exists:users,id'],
        ]);

        $practiceArea = PracticeArea::findOrFail($validated['practice_area_id']);

        $matter = Matter::create([
            'file_number' => $this->fileNumbers->generate($practiceArea),
            'title' => $validated['title'],
            'client_id' => $validated['client_id'],
            'practice_area_id' => $practiceArea->id,
            'lead_advocate_id' => $validated['lead_advocate_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'stage' => MatterStage::Instruction,
            'status' => MatterStatus::Open,
            'opened_at' => now(),
        ]);

        return redirect()->route('private.matters.show', $matter)
            ->with('success', "Matter {$matter->file_number} opened successfully.");
    }

    /**
     * Update core matter details (does NOT handle stage transitions).
     */
    public function update(Request $request, Matter $matter)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersUpdate),
            403
        );

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'lead_advocate_id' => ['nullable', 'exists:users,id'],
        ]);

        $matter->update($validated);

        return back()->with('success', 'Matter details updated.');
    }

        /**
     * Assign a staff member to the matter team with a specific role.
     */
    public function assignTeam(Request $request, Matter $matter)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersAssignTeam),
            403
        );

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'matter_role_id' => ['required', 'exists:matter_roles,id'],
        ]);

        // Prevent duplicate assignments of the exact same role
        $exists = $matter->team()
            ->where('user_id', $validated['user_id'])
            ->wherePivot('matter_role_id', $validated['matter_role_id'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'This team member already holds this role on the matter.');
        }

        $matter->team()->attach($validated['user_id'], [
            'matter_role_id' => $validated['matter_role_id'],
            'assigned_at' => now(),
        ]);

        return back()->with('success', 'Team member assigned successfully.');
    }

    /**
     * Remove a staff member from a specific role on the matter.
     */
    public function removeTeam(Request $request, Matter $matter, User $user, MatterRole $matterRole)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersAssignTeam),
            403
        );

        $matter->team()
            ->where('user_id', $user->id)
            ->wherePivot('matter_role_id', $matterRole->id)
            ->detach();

        return back()->with('success', 'Team member removed from matter.');
    }

        /**
     * Link a contact to the matter with a specific role (e.g., "Co-Defendant", "Expert Witness").
     */
    public function assignContact(Request $request, Matter $matter)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersUpdate),
            403
        );

        $validated = $request->validate([
            'contact_id' => ['required', 'exists:contacts,id'],
            'role' => ['required', 'string', 'max:255'],
        ]);

        // Prevent duplicate exact matches (same contact, same role string)
        $exists = $matter->contacts()
            ->where('contact_id', $validated['contact_id'])
            ->wherePivot('role', $validated['role'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'This contact is already linked with this role.');
        }

        $matter->contacts()->attach($validated['contact_id'], [
            'role' => $validated['role'],
        ]);

        return back()->with('success', 'Contact linked successfully.');
    }

    /**
     * Remove a contact from the matter entirely (detaches all their roles on this matter).
     */
    public function removeContact(Matter $matter, Contact $contact)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersUpdate),
            403
        );

        $matter->contacts()->detach($contact->id);

        return back()->with('success', 'Contact removed from matter.');
    }

        /**
     * Archive a matter. Sets status to archived and stamps the archive date.
     */
    public function archive(Matter $matter)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersArchive),
            403
        );

        if ($matter->isArchived()) {
            return back()->with('error', 'Matter is already archived.');
        }

        $matter->update([
            'status' => MatterStatus::Archived,
            'archived_at' => now(),
        ]);

        return back()->with('success', 'Matter archived successfully.');
    }

    /**
     * Reopen an archived matter. Restores status to open and clears the archive date.
     */
    public function unarchive(Matter $matter)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::MattersArchive),
            403
        );

        if (! $matter->isArchived()) {
            return back()->with('error', 'Matter is not archived.');
        }

        $matter->update([
            'status' => MatterStatus::Open,
            'archived_at' => null,
        ]);

        return back()->with('success', 'Matter reopened successfully.');
    }
}
