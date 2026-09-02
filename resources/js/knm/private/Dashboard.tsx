import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: premiumEase } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const modules = [
    {
        name: 'Matters',
        desc: 'The 7-stage lifecycle — from instruction to archive.',
        icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.296-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0',
    },
    {
        name: 'Clients & Contacts',
        desc: 'Your CRM — clients, courts, witnesses and opposing counsel.',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
    {
        name: 'Calendar & Tasks',
        desc: 'Court dates, deadlines, meetings and assignments.',
        icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    },
    {
        name: 'Billing & Reports',
        desc: 'Time recording, invoices, payments and firm analytics.',
        icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    },
];

export default function Dashboard() {
    const auth = usePage().props.auth as any;
    const user = auth?.user;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const today = new Date().toLocaleDateString('en-KE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

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

                {/* Stage 0 status card */}
                <motion.div
                    variants={fadeUp}
                    className="bg-[#891920] rounded-2xl p-8 md:p-10 mb-10 relative overflow-hidden"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-bold mb-3">
                            Stage 0 · Foundation Complete
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                            The vault is open. The workflow begins next.
                        </h2>
                        <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-2xl">
                            Authentication, roles, permissions and authorization are live. Stage 1 brings the real
                            workflow: matters, clients, calendar, documents and billing — built one module at a time.
                        </p>
                    </div>
                </motion.div>

                {/* Module preview grid */}
                <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif font-bold text-slate-900">Coming in Stage 1</h2>
                </motion.div>

                <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {modules.map((mod) => (
                        <motion.div
                            key={mod.name}
                            variants={fadeUp}
                            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-[#D4AF37]/40 hover:shadow-xl transition-all duration-500 group"
                        >
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] ring-1 ring-[#891920]/10 mb-5 group-hover:bg-[#D4AF37] group-hover:ring-[#D4AF37] transition-colors duration-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mod.icon} />
                                </svg>
                            </div>
                            <h3 className="font-serif font-bold text-slate-900 text-lg mb-2">{mod.name}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4">{mod.desc}</p>
                            <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold rounded-full">
                                Stage 1
                            </span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </>
    );
}
