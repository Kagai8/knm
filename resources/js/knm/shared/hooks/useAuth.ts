/* eslint-disable curly */
/* eslint-disable @stylistic/padding-line-between-statements */
import { usePage } from '@inertiajs/react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface User {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    role_label: string;
    is_super_admin: boolean;
    permissions: string[]; // The resolved list of capability keys (or ['*'])
}

export interface PageProps extends Record<string, unknown> {
    auth: {
        user: User | null;
    };
    name: string;
    sidebarOpen: boolean;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useAuth() {
    // Read the shared props from the current page context
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    /**
     * Check if the current user has a specific permission.
     * Super admins (or users with the '*' wildcard) bypass all checks.
     */
    const can = (permission: string): boolean => {
        if (!user) return false;
        if (user.is_super_admin || user.permissions.includes('*')) return true;
        return user.permissions.includes(permission);
    };

    /**
     * Check if the current user is a super admin.
     */
    const isSuperAdmin = (): boolean => {
        return user?.is_super_admin ?? false;
    };

    /**
     * Check if the current user is authenticated.
     */
    const isAuthenticated = !!user;

    return {
        user,
        can,
        isSuperAdmin,
        isAuthenticated,
    };
}
