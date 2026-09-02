/* eslint-disable curly */
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useState } from 'react';
import NewIcon from '@/assets/NEWLOGO.avif';
import { useAuth } from '@/knm/shared/hooks/useAuth';

const premiumEase = [0.25, 0.1, 0.25, 1];

type NavItem = {
    name: string;
    href: string;
    icon: string;
    permission?: string; // Required capability to see this item. Omit = always visible.
    soon?: boolean;
};

type NavSection = {
    label: string | null;
    items: NavItem[];
};

const icons = {
    dashboard: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.75h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
    matters: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.296-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0',
    clients: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    contacts: 'M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25zm4.125-9.75a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z',
    calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    documents: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    precedents: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    tasks: 'M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125m-7.5-3h4.5',
    time: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    invoices: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
    payments: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
    reports: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    admin: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
    bell: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
    menu: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
    close: 'M6 18L18 6M6 6l12 12',
    logout: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
    chevron: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
    inbox: 'M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z',
    building: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
    cog: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.525 6.525 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        users: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
};

export default function PrivateLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();
    const { user, can } = useAuth();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        Workspace: true,
        Library: true,
        Finance: true,
        Insights: true,
        System: true,
    });

    const toggleSection = (label: string) => {
        setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const isActive = (href: string) =>
        href === '/private' ? url === '/private' : url.startsWith(href);

    const initials =
        user?.name
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() ?? '';

    const logout = () => router.post('/logout');

    const sections: NavSection[] = [
        {
            label: null,
            items: [{ name: 'Dashboard', href: '/private', icon: icons.dashboard }],
        },
        {
            label: 'Intake',
            items: [{ name: 'Enquiries', href: '/private/enquiries', icon: icons.inbox, permission: 'enquiries.view' }],
        },
                {
            label: 'Workspace',
            items: [
                { name: 'Matters', href: '/private/matters', icon: icons.matters, permission: 'matters.view' },
                { name: 'Clients', href: '/private/clients', icon: icons.clients, permission: 'clients.view' },
                { name: 'Contacts', href: '/private/contacts', icon: icons.contacts, permission: 'contacts.view' },
                { name: 'Calendar', href: '/private/calendar', icon: icons.calendar, permission: 'calendar.view_own', soon: true },
            ],
        },
        {
            label: 'Library',
            items: [
                { name: 'Documents', href: '/private/documents', icon: icons.documents, permission: 'documents.view', soon: true },
                { name: 'Precedents', href: '/private/precedents', icon: icons.precedents, permission: 'precedents.view', soon: true },
                { name: 'Tasks', href: '/private/tasks', icon: icons.tasks, permission: 'tasks.view', soon: true },
            ],
        },
        {
            label: 'Finance',
            items: [
                { name: 'Time Recording', href: '/private/time', icon: icons.time, permission: 'billing.time.enter', soon: true },
                { name: 'Invoices', href: '/private/invoices', icon: icons.invoices, permission: 'billing.invoices.create', soon: true },
                { name: 'Payments', href: '/private/payments', icon: icons.payments, permission: 'billing.payments.record', soon: true },
            ],
        },
        {
            label: 'Insights',
            items: [{ name: 'Reports', href: '/private/reports', icon: icons.reports, permission: 'reports.view', soon: true }],
        },
        {
            label: 'System',
            items: [
                { name: 'Role Management', href: '/private/admin/roles', icon: icons.admin, permission: 'settings.manage' },
                { name: 'User Management', href: '/private/admin/users', icon: icons.clients, permission: 'users.manage' },
                { name: 'Practice Areas', href: '/private/admin/practice-areas', icon: icons.building, permission: 'practice_areas.manage' },
                { name: 'Company Settings', href: '/private/admin/settings', icon: icons.cog, permission: 'settings.manage' },
                { name: 'Matter Roles', href: '/private/admin/matter-roles', icon: icons.users, permission: 'matter_roles.manage' },
                { name: 'Event Types', href: '/private/admin/calendar-event-types', icon: icons.calendar, permission: 'calendar.event_types.manage' },
            ],
        },
    ];

    const renderItem = (item: NavItem) => {
        if (item.soon) {
            return (
                <div
                    key={item.name}
                    title="Arriving in Stage 1"
                    className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/30 cursor-not-allowed select-none"
                >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    <span className="flex-grow">{item.name}</span>
                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                        Soon
                    </span>
                </div>
            );
        }

        const active = isActive(item.href);

        return (
            <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active ? 'text-[#D4AF37]' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
                {active && (
                    <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                )}
                <svg className="relative w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span className="relative">{item.name}</span>
            </Link>
        );
    };

    const SidebarContent = (
        <>
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 h-20 border-b border-white/5 shrink-0">
                <img src={NewIcon} alt="K&A Advocates" className="h-9 w-auto object-contain brightness-0 invert" />
                <div className="flex flex-col leading-none">
                    <span className="font-serif font-bold text-white">
                        K&A <span className="text-[#D4AF37]">Advocates</span>
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 mt-1 font-medium">
                        Internal Workspace
                    </span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-grow overflow-y-auto px-4 py-4 no-scrollbar">
                {sections.map((section) => {
                    // Permission filter: only show items the user has access to
                    const visibleItems = section.items.filter(
                        (item) => !item.permission || can(item.permission)
                    );

                    // Hide the entire section if nothing is visible
                    if (visibleItems.length === 0) return null;

                    const isCollapsible = section.label !== null;
                    const isOpen = isCollapsible ? (openSections[section.label as string] ?? true) : true;

                    return (
                        <div key={section.label ?? 'main'}>
                            {isCollapsible ? (
                                <button
                                    onClick={() => toggleSection(section.label as string)}
                                    className="w-full flex items-center justify-between px-4 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 hover:text-white/50 transition-colors"
                                >
                                    <span>{section.label}</span>
                                    <motion.svg
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons.chevron} />
                                    </motion.svg>
                                </button>
                            ) : (
                                section.label && (
                                    <div className="px-4 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                                        {section.label}
                                    </div>
                                )
                            )}

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="space-y-1 pb-1">
                                            {visibleItems.map((item) => renderItem(item))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            {/* User card */}
            <div className="p-4 border-t border-white/5 shrink-0">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#891920] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                        {initials}
                    </div>
                    <div className="flex-grow min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                        <div className="text-xs text-white/40 truncate">{user?.role_label}</div>
                    </div>
                    <button
                        onClick={logout}
                        title="Sign out"
                        className="w-9 h-9 flex items-center justify-center rounded-full text-white/40 hover:text-[#D4AF37] hover:bg-white/5 transition-colors shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons.logout} />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col bg-[#160407] border-r border-[#D4AF37]/10 z-40">
                {SidebarContent}
            </aside>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            className="absolute inset-y-0 left-0 w-80 max-w-[85vw] flex flex-col bg-[#160407] shadow-2xl"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-5 right-4 w-9 h-9 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors z-10"
                                aria-label="Close menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons.close} />
                                </svg>
                            </button>
                            {SidebarContent}
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {/* Main column */}
            <div className="lg:pl-72 flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200 flex items-center gap-3 px-4 lg:px-8">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Open menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons.menu} />
                        </svg>
                    </button>

                    {/* Search */}
                    <button
                        title="Command palette — arrives in Stage 1"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-slate-400 text-sm hover:border-[#D4AF37] hover:text-slate-600 transition-colors cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons.search} />
                        </svg>
                        <span className="hidden sm:inline">Search matters, clients, documents…</span>
                        <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-400 font-sans">
                            ⌘K
                        </kbd>
                    </button>

                    <div className="flex-grow" />

                    {/* Notifications */}
                    <button
                        title="Notifications — arrives in Stage 1"
                        className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons.bell} />
                        </svg>
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#D4AF37] rounded-full"></span>
                    </button>

                    {/* User chip (desktop) */}
                    <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="w-9 h-9 rounded-full bg-[#891920] text-white flex items-center justify-center font-serif font-bold text-xs">
                            {initials}
                        </div>
                        <div className="leading-tight">
                            <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                            <div className="text-xs text-slate-400">{user?.role_label}</div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-grow p-4 sm:p-6 lg:p-10">
                    <motion.div
                        key={url}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: premiumEase }}
                        className="max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </main>

                {/* Footer strip */}
                <footer className="px-4 lg:px-8 py-4 border-t border-slate-200 text-center text-xs text-slate-400">
                    K&A Advocates · Internal Workspace · Private &amp; Confidential
                </footer>
            </div>
        </div>
    );
}
