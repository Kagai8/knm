<?php

namespace App\Http\Controllers\Private;

use App\Enums\EnquiryStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Services\ConflictCheckEngine;
use App\Services\EnquiryConversionService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TriageController extends Controller
{
    public function __construct(
        protected ConflictCheckEngine $conflictEngine,
        protected EnquiryConversionService $conversionService,
    ) {}

    /**
     * Assign a triager to an enquiry and move it to the Triaged stage.
     */
    public function assignTriager(Request $request, Enquiry $enquiry)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::EnquiriesTriage),
            403
        );

        $request->validate([
            'assigned_triager_id' => ['required', 'exists:users,id'],
        ]);

        $enquiry->update([
            'assigned_triager_id' => $request->assigned_triager_id,
            'status' => EnquiryStatus::Triaged,
        ]);

        return back()->with('success', 'Triager assigned successfully.');
    }

    /**
     * Run the conflict check engine against clients, contacts, and matters.
     */
    public function runConflictCheck(Enquiry $enquiry)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::EnquiriesTriage),
            403
        );

        $this->conflictEngine->check($enquiry);

        return back()->with('success', 'Conflict check completed. Review the results below.');
    }

    /**
     * Approve the enquiry, routing it to a practice area and optional partner.
     * A flagged (or never-run) conflict check blocks approval until cleared or overridden.
     */
    public function approve(Request $request, Enquiry $enquiry)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::EnquiriesApprove),
            403
        );

        if ($enquiry->conflict_status !== 'cleared') {
            throw ValidationException::withMessages([
                'practice_area_id' => 'The conflict check must be cleared or overridden before approval.',
            ]);
        }

        $request->validate([
            'practice_area_id' => ['required', 'exists:practice_areas,id'],
        ]);

        $enquiry->update([
            'status' => EnquiryStatus::Approved,
            'practice_area_id' => $request->practice_area_id,
            'assigned_partner_id' => $request->assigned_partner_id,
        ]);

        return back()->with('success', 'Enquiry approved and ready for conversion.');
    }

    /**
     * Reject the enquiry with a permanent, visible reason.
     */
    public function reject(Request $request, Enquiry $enquiry)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::EnquiriesApprove),
            403
        );

        $request->validate([
            'rejection_reason' => ['required', 'string'],
        ]);

        $enquiry->update([
            'status' => EnquiryStatus::Rejected,
            'rejection_reason' => $request->rejection_reason,
        ]);

        return back()->with('success', 'Enquiry rejected.');
    }

    /**
     * Convert an approved enquiry into a formal matter.
     */
    public function convert(Enquiry $enquiry)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::EnquiriesConvert),
            403
        );

        $matter = $this->conversionService->convert($enquiry, auth()->id());

        return back()->with('success', "Enquiry successfully converted to Matter {$matter->file_number}.");
    }

    /**
     * Override a flagged conflict check with a documented reason.
     * Only users with enquiries.override_conflict may do this.
     * The flag is cleared, but the override is permanently recorded in conflict_notes.
     */
    public function overrideConflict(Request $request, Enquiry $enquiry)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::EnquiriesOverrideConflict),
            403
        );

        $validated = $request->validate([
            'override_reason' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $enquiry->update([
            'conflict_status' => 'cleared',
            'conflict_notes' => 'CONFLICT OVERRIDE by ' . auth()->user()->name . ' on ' . now()->toDateTimeString() . ': ' . $validated['override_reason'],
        ]);

        return back()->with('success', 'Conflict override recorded. The enquiry is now cleared for approval.');
    }
}
