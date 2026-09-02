import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import PortalLayout from '@/knm/public/portal/layouts/PortalLayout';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const matters = [
    {
        title: 'Property Purchase — Karen',
        reference: 'KAA/CV/2026/014',
        area: 'Conveyancing & Land Law',
        advocate: 'Member Two',
        status: 'Active Work',
        progress: 65,
        nextStep: 'Completion meeting scheduled',
        nextDate: '22 Aug 2026',
    },
    {
        title: 'Employment Contract Review',
        reference: 'KAA/EL/2026/031',
        area: 'Employment Law',
        advocate: 'Member Four',
        status: 'Matter Opened',
        progress: 20,
        nextStep: 'Awaiting signed engagement letter',
        nextDate: '15 Aug 2026',
    },
];

const documents = [
    { name: 'Sale Agreement — Karen Property.pdf', date: '08 Aug 2026', size: '2.4 MB' },
    { name: 'Official Search Results.pdf', date: '01 Aug 2026', size: '890 KB' },
    { name: 'Engagement Letter — Employment.pdf', date: '28 Jul 2026', size: '310 KB' },
];

const stats = [
    {
        label: 'Active Matters',
        value: '2',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.296-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />,
    },
    {
        label: 'Documents',
        value: '8',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
    },
    {
        label: 'Unread Messages',
        value: '3',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />,
    },
    {
        label: 'Upcoming Dates',
        value: '1',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />,
    },
];

export default function Dashboard() {
    return (
        <PortalLayout>
            <Head title="Portal Dashboard" />

            {/* Page Header */}
            <motion.div
                initial="hidden" animate="visible" variants={staggerContainer}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10"
            >
                <motion.div variants={fadeUp}>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">A live view of your matters, documents and next steps.</p>
                </motion.div>
                <motion.div variants={fadeUp}>
                    <Link href="/portal/messages" className="group relative inline-flex items-center gap-2 px-6 py-3 bg-[#891920] text-white text-sm font-bold rounded-full overflow-hidden transition-all duration-500 shadow-lg shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40 w-fit">
                        <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                        <span className="relative group-hover:text-[#891920] transition-colors duration-500">Message Your Advocate</span>
                        <svg className="relative w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial="hidden" animate="visible" variants={staggerContainer}
                className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
            >
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={fadeUp}
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/30 transition-all duration-500 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] ring-1 ring-[#891920]/10 group-hover:bg-[#D4AF37] group-hover:text-[#891920] group-hover:ring-[#D4AF37] transition-colors duration-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{stat.icon}</svg>
                            </div>
                        </div>
                        <div className="text-3xl font-serif font-bold text-[#891920] mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Matters — spans 2 columns */}
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={staggerContainer}
                    className="lg:col-span-2 space-y-6"
                >
                    <motion.div variants={fadeUp} className="flex items-center justify-between">
                        <h2 className="text-2xl font-serif font-bold text-slate-900">My Matters</h2>
                        <Link href="/portal/cases" className="text-sm text-[#891920] font-bold hover:text-[#D4AF37] transition-colors">View all →</Link>
                    </motion.div>

                    {matters.map((matter, i) => (
                        <motion.div
                            key={i}
                            variants={fadeUp}
                            className="bg-white border border-slate-200 hover:border-[#D4AF37]/30 hover:shadow-2xl rounded-2xl p-8 transition-all duration-500"
                        >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-[#891920]/5 border border-[#891920]/20 text-[#891920] text-xs font-bold rounded-full mb-3">
                                        {matter.status}
                                    </span>
                                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-1">{matter.title}</h3>
                                    <p className="text-slate-500 text-sm">{matter.reference} · {matter.area}</p>
                                </div>
                                <div className="md:text-right shrink-0">
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Advocate</div>
                                    <div className="text-slate-900 font-semibold text-sm">{matter.advocate}</div>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs text-slate-500 mb-2">
                                    <span className="font-medium">Progress</span>
                                    <span className="text-[#891920] font-bold">{matter.progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${matter.progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.2, ease: premiumEase, delay: 0.3 }}
                                        className="h-full bg-gradient-to-r from-[#891920] to-[#D4AF37] rounded-full"
                                    ></motion.div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                    Next: {matter.nextStep} · <span className="text-[#891920] font-bold">{matter.nextDate}</span>
                                </div>
                                <Link href="/portal/cases" className="text-sm text-[#891920] font-bold hover:text-[#D4AF37] transition-colors shrink-0">
                                    View Matter →
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Right column */}
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={staggerContainer}
                    className="space-y-8"
                >
                    {/* Recent Documents */}
                    <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-serif font-bold text-slate-900">Documents</h2>
                            <Link href="/portal/documents" className="text-sm text-[#891920] font-bold hover:text-[#D4AF37] transition-colors">All →</Link>
                        </div>
                        <div className="space-y-4">
                            {documents.map((doc, i) => (
                                <div key={i} className="flex items-center gap-3 group cursor-pointer p-2 -m-2 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] ring-1 ring-[#891920]/10 shrink-0 group-hover:bg-[#D4AF37] group-hover:ring-[#D4AF37] transition-colors duration-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm text-slate-900 font-medium truncate group-hover:text-[#891920] transition-colors">{doc.name}</div>
                                        <div className="text-xs text-slate-400">{doc.date} · {doc.size}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Need Help */}
                    <motion.div variants={fadeUp} className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-all duration-500">
                        <h3 className="text-lg font-serif font-bold text-[#891920] mb-2">Need help?</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-5">
                            Have a question about your matter or documents? Your advocate is one message away.
                        </p>
                        <Link href="/portal/messages" className="inline-flex items-center gap-2 text-sm text-[#891920] font-bold hover:text-[#D4AF37] hover:gap-3 transition-all">
                            Start a conversation <span className="text-[#D4AF37]">→</span>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </PortalLayout>
    );
}
