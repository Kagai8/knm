import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PortalLayout from '@/knm/public/portal/layouts/PortalLayout';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const lifecycle = ['Instruction', 'Conflict Check', 'Matter Opened', 'Active Work', 'Billing', 'Closure', 'Archive'];

const cases = [
    {
        title: 'Property Purchase — Karen',
        reference: 'KAA/CV/2026/014',
        area: 'Conveyancing & Land Law',
        advocate: 'Member Two',
        advocateRole: 'Senior Partner',
        status: 'Active Work',
        group: 'active',
        stage: 3,
        progress: 65,
        opened: '12 May 2026',
        nextStep: 'Completion meeting scheduled',
        nextDate: '22 Aug 2026',
        documents: 5,
        updates: 12,
    },
    {
        title: 'Employment Contract Review',
        reference: 'KAA/EL/2026/031',
        area: 'Employment Law',
        advocate: 'Member Four',
        advocateRole: 'Senior Associate',
        status: 'Matter Opened',
        group: 'active',
        stage: 2,
        progress: 20,
        opened: '28 Jul 2026',
        nextStep: 'Awaiting signed engagement letter',
        nextDate: '15 Aug 2026',
        documents: 2,
        updates: 4,
    },
    {
        title: 'Trademark Registration — Studio Brand',
        reference: 'KAA/IP/2025/087',
        area: 'Intellectual Property Law',
        advocate: 'Member Five',
        advocateRole: 'Associate',
        status: 'Archived',
        group: 'completed',
        stage: 6,
        progress: 100,
        opened: '03 Sep 2025',
        nextStep: 'Matter closed & archived',
        nextDate: '20 Dec 2025',
        documents: 8,
        updates: 21,
    },
];

const Stepper = ({ stage }: { stage: number }) => (
    <div className="flex items-start w-full overflow-x-auto no-scrollbar pb-1">
        {lifecycle.map((step, i) => (
            <div key={step} className="flex items-start shrink-0">
                <div className="flex flex-col items-center w-20">
                    <div
                        className={`w-3.5 h-3.5 rounded-full border-2 ${
                            i < stage
                                ? 'bg-[#D4AF37] border-[#D4AF37]'
                                : i === stage
                                ? 'border-[#891920] bg-white ring-4 ring-[#891920]/10'
                                : 'border-slate-200 bg-white'
                        }`}
                    ></div>
                    <span className={`mt-2 text-[9px] uppercase tracking-wider text-center leading-tight ${i <= stage ? 'text-[#891920] font-bold' : 'text-slate-400'}`}>
                        {step}
                    </span>
                </div>
                {i < lifecycle.length - 1 && (
                    <div className={`h-px flex-1 min-w-4 mt-[6px] ${i < stage ? 'bg-[#D4AF37]' : 'bg-slate-200'}`}></div>
                )}
            </div>
        ))}
    </div>
);

export default function Cases() {
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    const visible = cases.filter((c) => filter === 'all' || c.group === filter);
    const activeCount = cases.filter((c) => c.group === 'active').length;
    const completedCount = cases.filter((c) => c.group === 'completed').length;

    return (
        <PortalLayout>
            <Head title="My Cases" />

            {/* Page Header */}
            <motion.div
                initial="hidden" animate="visible" variants={staggerContainer}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10"
            >
                <motion.div variants={fadeUp}>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">My Cases</h1>
                    <p className="text-slate-500 mt-1">Track every matter from instruction to archive.</p>
                </motion.div>

                {/* Filter Tabs */}
                <motion.div variants={fadeUp} className="flex gap-2 flex-wrap">
                    {(
                        [
                            { key: 'all', label: `All (${cases.length})` },
                            { key: 'active', label: `Active (${activeCount})` },
                            { key: 'completed', label: `Completed (${completedCount})` },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                                filter === tab.key
                                    ? 'bg-[#891920] text-white border-[#891920] shadow-lg shadow-[#891920]/20'
                                    : 'border-slate-200 text-slate-600 bg-white hover:border-[#D4AF37] hover:text-[#891920]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </motion.div>
            </motion.div>

            {/* Cases List */}
            <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-8"
            >
                {visible.map((matter, i) => (
                    <motion.div
                        key={i}
                        variants={fadeUp}
                        className="bg-white border border-slate-200 hover:border-[#D4AF37]/30 hover:shadow-2xl rounded-2xl p-8 transition-all duration-500"
                    >
                        {/* Card Header */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <span
                                        className={`px-3 py-1 text-xs font-bold rounded-full border ${
                                            matter.group === 'active'
                                                ? 'bg-[#891920]/5 border-[#891920]/20 text-[#891920]'
                                                : 'bg-slate-100 border-slate-200 text-slate-500'
                                        }`}
                                    >
                                        {matter.status}
                                    </span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Opened {matter.opened}</span>
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">{matter.title}</h2>
                                <p className="text-slate-500 text-sm">{matter.reference} · {matter.area}</p>
                            </div>
                            <div className="lg:text-right shrink-0">
                                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Your Advocate</div>
                                <div className="text-slate-900 font-semibold text-sm">{matter.advocate}</div>
                                <div className="text-slate-500 text-xs">{matter.advocateRole}</div>
                            </div>
                        </div>

                        {/* Lifecycle Stepper */}
                        <div className="mb-8 bg-slate-50 border border-slate-100 rounded-xl px-6 py-5">
                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-medium">Matter Lifecycle</div>
                            <Stepper stage={matter.stage} />
                        </div>

                        {/* Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between text-xs text-slate-500 mb-2">
                                <span className="font-medium">Overall Progress</span>
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

                        {/* Card Footer */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                Next: {matter.nextStep} · <span className="text-[#891920] font-bold">{matter.nextDate}</span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                    {matter.documents} documents
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                                    {matter.updates} updates
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Help Strip */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: premiumEase }}
                className="mt-10 bg-[#891920] border border-[#D4AF37]/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative">
                    <h3 className="text-lg font-serif font-bold text-[#D4AF37] mb-1">Questions about a matter?</h3>
                    <p className="text-white/60 text-sm">Your advocate can walk you through any stage of your case.</p>
                </div>
                <Link href="/portal/messages" className="group relative inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#891920] text-sm font-bold rounded-full overflow-hidden transition-all duration-500 shadow-lg shadow-[#D4AF37]/20 shrink-0">
                    <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                    <span className="relative">Message Your Advocate</span>
                    <svg className="relative w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
            </motion.div>
        </PortalLayout>
    );
}
