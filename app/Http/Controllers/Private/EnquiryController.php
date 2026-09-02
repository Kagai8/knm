<?php

namespace App\Http\Controllers\Private;

use App\Enums\EnquiryStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Models\PracticeArea;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EnquiryController extends Controller
{
    /**
     * Guard: super admins or anyone with enquiries.view.
     */
    private function guard(): void
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::EnquiriesView),
            403
        );
    }

    /**
     * List enquiries with search, status filtering, sorting, and pagination.
     */
    public function index(Request $request): Response
    {
        $this->guard();

        $status = $request->query('status');
        $search = $request->query('search');
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');

        $query = Enquiry::query()
            ->with(['practiceArea', 'assignedTriager']);

        // Search across all visible columns including status
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%")
                  ->orWhere('company_name', 'ilike', "%{$search}%")
                  ->orWhere('status', 'ilike', "%{$search}%")
                  ->orWhere('conflict_status', 'ilike', "%{$search}%")
                  ->orWhereHas('practiceArea', fn ($q) => $q->where('name', 'ilike', "%{$search}%"))
                  ->orWhereHas('assignedTriager', fn ($q) => $q->where('name', 'ilike', "%{$search}%"));
            });
        }

        // Status filter
        if ($status) {
            $query->where('status', $status);
        }

        // Sorting (only allow safe columns)
        $allowedSorts = ['name', 'status', 'conflict_status', 'created_at'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $perPage = $request->query('per_page', 25);
        $perPage = $perPage === 'all' || $perPage == 999999 ? 10000 : min((int) $perPage, 100);

        return Inertia::render('private/enquiries/Index', [
            'enquiries' => $query->paginate($perPage)->withQueryString(),
            'filters' => [
                'status' => $status,
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'statuses' => collect(EnquiryStatus::cases())
                ->map(fn (EnquiryStatus $s) => ['value' => $s->value, 'label' => $s->label()])
                ->values()
                ->all(),
            'practiceAreas' => PracticeArea::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'triagers' => User::withPermission(Permission::EnquiriesTriage->value)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Triage workspace for a single enquiry (used in B.2).
     */
    public function show(Enquiry $enquiry): Response
    {
        $this->guard();

        $enquiry->load([
            'practiceArea',
            'assignedTriager',
            'assignedPartner',
            'createdBy',
            'conflictResults.resolvedBy',
            'convertedToMatter',
        ]);

        return Inertia::render('private/enquiries/Show', [
            'enquiry' => $enquiry,
            'practiceAreas' => PracticeArea::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'triagers' => User::withPermission(Permission::EnquiriesTriage->value)->orderBy('name')->get(['id', 'name']),
            'partners' => User::withPermission(Permission::MattersApprove->value)->orderBy('name')->get(['id', 'name']),
        ]);
    }
}
