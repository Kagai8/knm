<?php

namespace App\Http\Controllers\Private;

use App\Enums\ClientStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ClientStatusChange;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    /**
     * Guard: only super admins or users with the given permission may proceed.
     */
    private function guard(Permission $permission): void
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission($permission),
            403
        );
    }

    /**
     * List all clients with search, sorting, filtering, and pagination.
     */
    public function index(Request $request): Response
    {
        $this->guard(Permission::ClientsView);

        $search = $request->query('search');
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $status = $request->query('status');
        $type = $request->query('type');
        $perPage = $request->query('per_page', 25);
        $perPage = $perPage === 'all' || $perPage == 999999 ? 10000 : min((int) $perPage, 100);

        $query = Client::query()->with('createdBy');

        // Global search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%")
                  ->orWhere('company_name', 'ilike', "%{$search}%")
                  ->orWhere('id_number', 'ilike', "%{$search}%")
                  ->orWhere('company_registration', 'ilike', "%{$search}%");
            });
        }

        // Filters
        if ($status) {
            $query->where('status', $status);
        }
        if ($type) {
            $query->where('type', $type);
        }

        // Sorting
        $allowedSorts = ['name', 'email', 'company_name', 'status', 'type', 'created_at'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest('created_at');
        }

        $clients = $query->paginate($perPage)->withQueryString();

        // Format statuses for the frontend
        $statuses = collect(ClientStatus::cases())
            ->map(fn (ClientStatus $s) => ['value' => $s->value, 'label' => $s->label()])
            ->values()
            ->all();

        return Inertia::render('private/clients/Index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'type' => $type,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
            'statuses' => $statuses,
        ]);
    }

    /**
     * Show a single client's CRM detail page.
     */
    public function show(Client $client): Response
    {
        $this->guard(Permission::ClientsView);

        $client->load([
            'createdBy',
            'matters' => fn ($q) => $q->with(['practiceArea', 'leadAdvocate'])->orderBy('created_at', 'desc'),
            'statusChanges.changedBy',
        ]);

        // Fetch enquiries matched by email/ID/registration
        $enquiries = $client->enquiries()->with('practiceArea')->orderBy('created_at', 'desc')->get();

        $statuses = collect(ClientStatus::cases())
            ->map(fn (ClientStatus $s) => ['value' => $s->value, 'label' => $s->label()])
            ->values()
            ->all();

        return Inertia::render('private/clients/Show', [
            'client' => $client,
            'enquiries' => $enquiries,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Create a new client.
     */
    public function store(Request $request)
    {
        $this->guard(Permission::ClientsCreate);

        $validated = $request->validate([
            'type' => ['required', 'in:individual,company'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'id_number' => ['nullable', 'string', 'max:100'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_registration' => ['nullable', 'string', 'max:100'],
            'tax_pin' => ['nullable', 'string', 'max:100'],
            'vat_number' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:1000'],
            'website' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'status' => ['required', 'in:prospect,active,dormant,archived'],
        ]);

        $validated['created_by_id'] = auth()->id();

        Client::create($validated);

        return redirect()->route('private.clients.index')
            ->with('success', 'Client created successfully.');
    }

    /**
     * Update client profile fields.
     * Status is intentionally NOT included here — use updateStatus() for that.
     */
    public function update(Request $request, Client $client)
    {
        $this->guard(Permission::ClientsUpdate);

        $validated = $request->validate([
            'type' => ['required', 'in:individual,company'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'id_number' => ['nullable', 'string', 'max:100'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_registration' => ['nullable', 'string', 'max:100'],
            'tax_pin' => ['nullable', 'string', 'max:100'],
            'vat_number' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:1000'],
            'website' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $client->update($validated);

        return redirect()->route('private.clients.show', $client)
            ->with('success', 'Client profile updated.');
    }

    /**
     * Dedicated endpoint for status changes.
     * Logs every change to the audit trail with who, when, and why.
     */
    public function updateStatus(Request $request, Client $client)
    {
        $this->guard(Permission::ClientsUpdate);

        $validated = $request->validate([
            'status' => ['required', 'in:prospect,active,dormant,archived'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $newStatus = $validated['status'];

        // Only log if the status actually changed
        if ($client->status->value !== $newStatus) {
            ClientStatusChange::create([
                'client_id' => $client->id,
                'from_status' => $client->status->value,
                'to_status' => $newStatus,
                'changed_by_id' => auth()->id(),
                'reason' => $validated['reason'] ?? null,
            ]);

            $client->update(['status' => $newStatus]);
        }

        return redirect()->route('private.clients.show', $client)
            ->with('success', "Client status changed to {$client->fresh()->status->label()}.");
    }

    /**
     * Delete a client permanently.
     * Blocked if they have associated matters.
     */
    public function destroy(Client $client)
    {
        $this->guard(Permission::ClientsUpdate);

        if ($client->matters()->exists()) {
            return back()->with('error', 'Cannot delete client: they have associated matters. Change their status to Archived instead.');
        }

        $client->delete();

        return redirect()->route('private.clients.index')
            ->with('success', 'Client deleted permanently.');
    }
}
