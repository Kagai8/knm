<?php

namespace App\Http\Controllers\Private;

use App\Enums\ContactType;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
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
     * List all contacts with search, sorting, filtering, and pagination.
     */
    public function index(Request $request): Response
    {
        $this->guard(Permission::ContactsView);

        $search = $request->query('search');
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $type = $request->query('type');
        $perPage = $request->query('per_page', 25);
        $perPage = $perPage === 'all' || $perPage == 999999 ? 10000 : min((int) $perPage, 100);

        $query = Contact::query();

        // Global search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%")
                  ->orWhere('company_name', 'ilike', "%{$search}%");
            });
        }

        // Filter by type
        if ($type) {
            $query->where('type', $type);
        }

        // Sorting
        $allowedSorts = ['name', 'company_name', 'type', 'created_at'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest('created_at');
        }

        $contacts = $query->paginate($perPage)->withQueryString();

        // Format types for the frontend
        $types = collect(ContactType::cases())
            ->map(fn (ContactType $t) => ['value' => $t->value, 'label' => $t->label()])
            ->values()
            ->all();

        return Inertia::render('private/contacts/Index', [
            'contacts' => $contacts,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
            'types' => $types,
        ]);
    }

    /**
     * Create a new contact.
     */
    public function store(Request $request)
    {
        $this->guard(Permission::ContactsCreate);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(ContactType::class)],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        Contact::create($validated);

        return redirect()->route('private.contacts.index')
            ->with('success', 'Contact created successfully.');
    }

    /**
     * Update an existing contact.
     */
    public function update(Request $request, Contact $contact)
    {
        $this->guard(Permission::ContactsUpdate);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(ContactType::class)],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $contact->update($validated);

        return redirect()->route('private.contacts.index')
            ->with('success', 'Contact updated successfully.');
    }

    /**
     * Delete a contact permanently.
     * Blocked if they are linked to any matters.
     */
    public function destroy(Contact $contact)
    {
        $this->guard(Permission::ContactsUpdate); // Using update permission for destructive action

        if ($contact->matters()->exists()) {
            return back()->with('error', 'Cannot delete contact: they are currently linked to matters. Remove them from matters first.');
        }

        $contact->delete();

        return redirect()->route('private.contacts.index')
            ->with('success', 'Contact deleted permanently.');
    }
}
