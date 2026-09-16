import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useAuth } from '@/knm/shared/hooks/useAuth';
import MyTasksWidget from '@/knm/private/tasks/MyTasksWidget';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: premiumEase } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

type ModuleCard = {
    name: string;
    desc: string;
    icon: string;
    href?: string;
    permission?: string;
    soon?: boolean;
    badge?: string;
};

const modules: ModuleCard[] = [
    {
        name: 'Matters',
        desc: 'Open and manage the 7-stage matter lifecycle.',
        icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.296-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0',
        href: '/private/matters',
        permission: 'matters.view',
    },
    {
        name: 'Clients',
        desc: 'Your CRM — clients, companies and relationships.',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
        href: '/private/clients',
        permission: 'clients.view',
    },
    {
        name: 'Contacts',
        desc: 'Witnesses, opposing counsel and other contacts.',
        icon: 'M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25zm4.125-9.75a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z',
        href: '/private/contacts',
        permission: 'contacts.view',
    },
    {
        name: 'Calendar',
        desc: 'Court dates, meetings, deadlines and delegate booking.',
        icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
        href: '/private/calendar',
        permission: 'calendar.view_own',
    },
    {
        name: 'Tasks',
        desc: 'Work assignments with priorities, due dates and status tracking.',
        icon: 'M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125m-7.5-3h4.5',
        href: '/private/tasks',
        permission: 'tasks.view',
        badge: 'New',
    },
    {
        name: 'Documents',
        desc: 'Firm-wide document library and precedent templates.',
        icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
        soon: true,
    },
    {
        name: 'Billing',
        desc: 'Time recording, invoices and payments.',
        icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
        soon: true,
    },
    {
        name: 'Reports',
        desc: 'Firm analytics — matters, workload and billing reports.',
        icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
        soon: true,
    },
];

export default function Dashboard() {
    const auth = usePage().props.auth as any;
    const user = auth?.user;
    const { can } = useAuth();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const today = new Date().toLocaleDateString('en-KE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const visibleModules = modules.filter(
        (m) => !m.permission || can(m.permission)
    );

    return (
        <>
            <Head title="Dashboard · K&A Internal" />

            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                {/* Greeting */}
                <motion.div variants={fadeUp} className="mb-8">
                    <div className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold mb-2">{today}</div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
                        {greeting}, <span className="text-[#891920]">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <div className="mt-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#891920] text-xs font-bold rounded-full">
                            <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></span>
                            {user?.role_label}
                        </span>
                    </div>
                </motion.div>

                {/* Two-column layout: main + sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* MAIN COLUMN */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Updated status card */}
                        <motion.div
                            variants={fadeUp}
                            className="bg-[#891920] rounded-2xl p-8 md:p-10 relative overflow-hidden"
                        >
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="relative">
                                <div className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-bold mb-3">
                                    Workspace Live
                                </div>
                                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                                    Matters, Calendar and Tasks are ready for your team.
                                </h2>
                                <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-2xl">
                                    Open matters, schedule court dates and delegate work across the firm. Documents,
                                    billing and reports are coming next.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    <Link
                                        href="/private/matters"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D4AF37] text-[#891920] text-xs font-bold hover:bg-white transition-colors"
                                    >
                                        Open Matters
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                    <Link
                                        href="/private/calendar"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold hover:bg-white/20 transition-colors"
                                    >
                                        View Calendar
                                    </Link>
                                    <Link
                                        href="/private/tasks"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold hover:bg-white/20 transition-colors"
                                    >
                                        My Tasks
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Module grid */}
                        <motion.div variants={fadeUp}>
                            <h2 className="text-xl font-serif font-bold text-slate-900 mb-4">Workspace Modules</h2>
                        </motion.div>

                        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {visibleModules.map((mod) => {
                                const isLive = !!mod.href && !mod.soon;

                                if (mod.soon) {
                                    return (
                                        <div
                                            key={mod.name}
                                            className="bg-white border border-slate-200 rounded-2xl p-6 opacity-60"
                                        >
                                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-4">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mod.icon} />
                                                </svg>
                                            </div>
                                            <h3 className="font-serif font-bold text-slate-700 text-lg mb-1">{mod.name}</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed mb-3">{mod.desc}</p>
                                            <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                                Coming Soon
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <motion.div key={mod.name} variants={fadeUp}>
                                        <Link
                                            href={mod.href!}
                                            className="block bg-white border border-slate-200 rounded-2xl p-6 hover:border-[#D4AF37]/50 hover:shadow-lg transition-all duration-300 group h-full"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] ring-1 ring-[#891920]/10 group-hover:bg-[#D4AF37] group-hover:ring-[#D4AF37] group-hover:text-white transition-colors duration-500">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mod.icon} />
                                                    </svg>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {mod.badge && (
                                                        <span className="px-2 py-0.5 bg-[#D4AF37] text-[#891920] text-[10px] font-bold rounded-full">
                                                            {mod.badge}
                                                        </span>
                                                    )}
                                                    <svg className="w-4 h-4 text-slate-300 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h3 className="font-serif font-bold text-slate-900 text-lg mb-1">{mod.name}</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed">{mod.desc}</p>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div variants={fadeUp}>
                            <MyTasksWidget />
                        </motion.div>

                        {/* Quick links card */}
                        <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-6">
                            <h3 className="font-serif font-bold text-slate-900 mb-3">Quick Links</h3>
                            <div className="space-y-1">
                                {can('matters.create') && (
                                    <Link href="/private/matters" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-[#891920] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                        New Matter
                                    </Link>
                                )}
                                {can('calendar.manage_own') && (
                                    <Link href="/private/calendar" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-[#891920] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Schedule Event
                                    </Link>
                                )}
                                {can('tasks.assign') && (
                                    <Link href="/private/tasks" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-[#891920] transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Assign Task
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}