<?php

namespace App\Enums;

enum Permission: string
{
    /* ---------------- Matters ---------------- */
    case MattersView = 'matters.view';
    case MattersCreate = 'matters.create';
    case MattersUpdate = 'matters.update';
    case MattersApprove = 'matters.approve';
    case MattersAssignTeam = 'matters.assign_team';
    case MattersArchive = 'matters.archive';
    case MatterRolesManage = 'matter_roles.manage';

    /* ---------------- Clients ---------------- */
    case ClientsView = 'clients.view';
    case ClientsCreate = 'clients.create';
    case ClientsUpdate = 'clients.update';
    case ClientsMerge = 'clients.merge';

    /* ---------------- Contacts ---------------- */
    case ContactsView = 'contacts.view';
    case ContactsCreate = 'contacts.create';
    case ContactsUpdate = 'contacts.update';

    /* -------- Documents & Precedents --------- */
    case DocumentsView = 'documents.view';
    case DocumentsUpload = 'documents.upload';
    case DocumentsDownload = 'documents.download';
    case DocumentsDelete = 'documents.delete';
    case PrecedentsView = 'precedents.view';
    case PrecedentsManage = 'precedents.manage';
    case PrecedentsGenerate = 'precedents.generate';

    /* ---------------- Calendar --------------- */
    case CalendarViewOwn = 'calendar.view_own';
    case CalendarViewAll = 'calendar.view_all';
    case CalendarManageOwn = 'calendar.manage_own';
    case CalendarManageAll = 'calendar.manage_all';
    case CalendarDelegate = 'calendar.delegate';
    case DeadlineRulesManage = 'deadline.rules.manage';
    case CalendarEventTypesManage = 'calendar.event_types.manage';

    /* ----------------- Tasks ----------------- */
    case TasksView = 'tasks.view';
    case TasksManageOwn = 'tasks.manage_own';
    case TasksAssign = 'tasks.assign';
    case TasksManageAll = 'tasks.manage_all';

    /* --------------- Messages ---------------- */
    case MessagesViewOwn = 'messages.view_own';
    case MessagesSend = 'messages.send';
    case MessagesSendToClients = 'messages.send_to_clients';
    case MessagesViewAll = 'messages.view_all';
    case MessagesModerate = 'messages.moderate';
    case MessagesDisableUser = 'messages.disable_user';
    case MessagesExport = 'messages.export';
    case MessagesManage = 'messages.manage';

    /* ---------------- Billing ---------------- */
    case BillingTimeEnter = 'billing.time.enter';
    case BillingTimeApprove = 'billing.time.approve';
    case BillingInvoicesCreate = 'billing.invoices.create';
    case BillingInvoicesSend = 'billing.invoices.send';
    case BillingPaymentsRecord = 'billing.payments.record';
    case BillingAdjust = 'billing.adjust';

    /* ---------------- Reports ---------------- */
    case ReportsView = 'reports.view';
    case ReportsFinancial = 'reports.financial';

    /* ---------------- Intake ----------------- */
    case EnquiriesView = 'enquiries.view';
    case EnquiriesTriage = 'enquiries.triage';
    case EnquiriesApprove = 'enquiries.approve';
    case EnquiriesConvert = 'enquiries.convert';
    case EnquiriesOverrideConflict = 'enquiries.override_conflict';

    /* ------------- Administration ------------ */
    case UsersManage = 'users.manage';
    case RolesEdit = 'roles.edit';
    case SettingsManage = 'settings.manage';
    case AuditView = 'audit.view';
    case PracticeAreasManage = 'practice_areas.manage';

    public function group(): string
    {
        return match (true) {
            str_starts_with($this->value, 'matters.'),
            str_starts_with($this->value, 'matter_roles.') => 'Matters',
            str_starts_with($this->value, 'clients.') => 'Clients',
            str_starts_with($this->value, 'contacts.') => 'Contacts',
            str_starts_with($this->value, 'documents.'),
            str_starts_with($this->value, 'precedents.') => 'Documents & Precedents',
            str_starts_with($this->value, 'calendar.') => 'Calendar',
            str_starts_with($this->value, 'tasks.') => 'Tasks',
            str_starts_with($this->value, 'messages.') => 'Messages',
            str_starts_with($this->value, 'billing.') => 'Billing',
            str_starts_with($this->value, 'reports.') => 'Reports',
            str_starts_with($this->value, 'enquiries.') => 'Intake',
            default => 'Administration',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::MattersView => 'View matters',
            self::MattersCreate => 'Open new matters',
            self::MattersUpdate => 'Edit matters',
            self::MattersApprove => 'Approve stage transitions',
            self::MattersAssignTeam => 'Assign matter team',
            self::MattersArchive => 'Archive / reopen matters',
            self::MatterRolesManage => 'Manage matter team roles',

            self::ClientsView => 'View clients',
            self::ClientsCreate => 'Create clients',
            self::ClientsUpdate => 'Edit clients',
            self::ClientsMerge => 'Merge duplicate clients',

            self::ContactsView => 'View contacts',
            self::ContactsCreate => 'Create contacts',
            self::ContactsUpdate => 'Edit contacts',

            self::DocumentsView => 'View documents',
            self::DocumentsUpload => 'Upload documents',
            self::DocumentsDownload => 'Download documents',
            self::DocumentsDelete => 'Delete documents',
            self::PrecedentsView => 'View precedents',
            self::PrecedentsManage => 'Manage precedent templates',
            self::PrecedentsGenerate => 'Generate from precedent',

            self::CalendarViewOwn => 'View own calendar',
            self::CalendarViewAll => 'View firm calendar',
            self::CalendarManageOwn => 'Manage own events',
            self::CalendarManageAll => 'Manage firm calendar',
            self::CalendarEventTypesManage => 'Manage calendar event types',
            self::CalendarDelegate => 'Book events for other staff',
            self::DeadlineRulesManage => 'Manage deadline rules',

            self::TasksView => 'View tasks',
            self::TasksManageOwn => 'Manage own tasks (assigned to me or created by me)',
            self::TasksAssign => 'Assign tasks to others',
            self::TasksManageAll => 'Manage all tasks',

            self::MessagesViewOwn => 'View my conversations',
            self::MessagesSend => 'Send messages to staff',
            self::MessagesSendToClients => 'Send messages to clients (via portal)',
            self::MessagesViewAll => 'View all conversations (compliance)',
            self::MessagesModerate => 'Moderate conversations (mute, manage participants)',
            self::MessagesDisableUser => 'Block users from messaging',
            self::MessagesExport => 'Export conversations for audit',
            self::MessagesManage => 'Full messaging administration',

            self::BillingTimeEnter => 'Enter own time',
            self::BillingTimeApprove => 'Approve timesheets',
            self::BillingInvoicesCreate => 'Create invoices',
            self::BillingInvoicesSend => 'Send invoices',
            self::BillingPaymentsRecord => 'Record payments',
            self::BillingAdjust => 'Adjust / credit notes',

            self::ReportsView => 'View reports',
            self::ReportsFinancial => 'View financial reports',

            self::EnquiriesView => 'View enquiries',
            self::EnquiriesTriage => 'Triage & run conflict checks',
            self::EnquiriesApprove => 'Approve / reject enquiries',
            self::EnquiriesConvert => 'Convert enquiries to matters',
            self::EnquiriesOverrideConflict => 'Override flagged conflicts (with documented reason)',

            self::UsersManage => 'Manage staff accounts',
            self::RolesEdit => 'Edit role permissions',
            self::SettingsManage => 'Manage system settings',
            self::AuditView => 'View audit logs',
            self::PracticeAreasManage => 'Manage practice areas',
        };
    }

    /**
     * Grouped for the checkbox matrix UI:
     * [ 'Matters' => [Permission, ...], 'Clients' => [...], ... ]
     */
    public static function grouped(): array
    {
        $groups = [];

        foreach (self::cases() as $permission) {
            $groups[$permission->group()][] = $permission;
        }

        return $groups;
    }
}