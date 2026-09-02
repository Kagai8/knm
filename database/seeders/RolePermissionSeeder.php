<?php

namespace Database\Seeders;

use App\Enums\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $matrix = [
            // Super Admin holds every permission explicitly (visual consistency;
            // super admin users also bypass via the is_super_admin flag)
            'Super Admin' => Permission::cases(),

            // Partners / Division Heads (Kenneth, John, Martin)
            'Senior Advocate' => [
                Permission::MattersView, Permission::MattersCreate, Permission::MattersUpdate, Permission::MattersApprove, Permission::MattersAssignTeam, Permission::MattersArchive,
                Permission::ClientsView, Permission::ClientsCreate, Permission::ClientsUpdate, Permission::ClientsMerge,
                Permission::ContactsView, Permission::ContactsCreate, Permission::ContactsUpdate,
                Permission::DocumentsView, Permission::DocumentsUpload, Permission::DocumentsDownload, Permission::DocumentsDelete,
                Permission::PrecedentsView, Permission::PrecedentsManage, Permission::PrecedentsGenerate,
                Permission::CalendarViewOwn, Permission::CalendarViewAll, Permission::CalendarManageOwn, Permission::CalendarManageAll,
                Permission::TasksView, Permission::TasksAssign, Permission::TasksManageAll,
                Permission::BillingTimeEnter, Permission::BillingTimeApprove, Permission::BillingInvoicesCreate, Permission::BillingInvoicesSend, Permission::BillingPaymentsRecord, Permission::BillingAdjust,
                Permission::ReportsView, Permission::ReportsFinancial,
            ],

            // Associates (Morris, James)
            'Senior Associate Advocate' => [
                Permission::MattersView, Permission::MattersCreate, Permission::MattersUpdate, Permission::MattersAssignTeam,
                Permission::ClientsView, Permission::ClientsCreate, Permission::ClientsUpdate,
                Permission::ContactsView, Permission::ContactsCreate, Permission::ContactsUpdate,
                Permission::DocumentsView, Permission::DocumentsUpload, Permission::DocumentsDownload,
                Permission::PrecedentsView, Permission::PrecedentsGenerate,
                Permission::CalendarViewOwn, Permission::CalendarManageOwn,
                Permission::TasksView, Permission::TasksAssign,
                Permission::BillingTimeEnter,
                Permission::ReportsView,
            ],

            // Jeniffer (Intake, Client Relations, Conflict Checks)
            'Senior Legal Assistant' => [
                Permission::MattersView, Permission::MattersCreate, Permission::MattersUpdate, Permission::MattersAssignTeam,
                Permission::ClientsView, Permission::ClientsCreate, Permission::ClientsUpdate, Permission::ClientsMerge,
                Permission::ContactsView, Permission::ContactsCreate, Permission::ContactsUpdate,
                Permission::DocumentsView, Permission::DocumentsUpload, Permission::DocumentsDownload,
                Permission::CalendarViewOwn, Permission::CalendarViewAll, Permission::CalendarManageOwn,
                Permission::TasksView, Permission::TasksAssign,
            ],

            // Elena (Clerical, Document Prep)
            'Legal Assistant' => [
                Permission::MattersView, Permission::MattersUpdate,
                Permission::DocumentsView, Permission::DocumentsUpload, Permission::DocumentsDownload,
                Permission::CalendarViewOwn, Permission::CalendarManageOwn,
                Permission::TasksView,
            ],

            // Jonathan (IT & Systems)
            'IT Administrator' => [
                Permission::UsersManage, Permission::RolesEdit, Permission::SettingsManage, Permission::AuditView,
            ],

            // Beatrice (Admin, Scheduling, Reception)
            'Administrative Assistant' => [
                Permission::ContactsView, Permission::ContactsCreate,
                Permission::CalendarViewOwn, Permission::CalendarViewAll, Permission::CalendarManageOwn, Permission::CalendarManageAll,
                Permission::TasksView, Permission::TasksManageAll,
            ],
        ];

        // Clear existing grants before seeding defaults to keep it clean
        RolePermission::query()->delete();

        foreach ($matrix as $roleName => $permissions) {
            $role = Role::where('name', $roleName)->first();

            if (!$role) continue; // Safety check in case a role wasn't found

            foreach ($permissions as $permission) {
                RolePermission::grant($role, $permission);
            }
        }
    }
}
