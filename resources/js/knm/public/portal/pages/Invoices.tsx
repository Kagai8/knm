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
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

type Invoice = {
    number: string;
    matter: string;
    issued: string;
    due: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
};

const invoices: Invoice[] = [
    { number: 'INV-2026-014', matter: 'Property Purchase — Karen', issued: '01 Aug 2026', due: '31 Aug 2026', amount: 185000, status: 'Pending' },
    { number: 'INV-2026-031', matter: 'Employment Contract Review', issued: '28 Jul 2026', due: '27 Aug 2026', amount: 45000, status: 'Pending' },
    { number: 'INV-2026-019', matter: 'Property Purchase — Karen', issued: '15 Jun 2026', due: '15 Jul 2026', amount: 60000, status: 'Overdue' },
    { number: 'INV-2026-011', matter: 'Property Purchase — Karen', issued: '12 May 2026', due: '11 Jun 2026', amount: 75000, status: 'Paid' },
    { number: 'INV-2025-087', matter: 'Trademark Registration — Studio Brand', issued: '18 Dec 2025', due: '17 Jan 2026', amount: 120000, status: 'Paid' },
];

const kes = (n: number) => `KES ${n.toLocaleString()}`;

const statusBadge = (status: Invoice['status']) => {
    switch (status) {
        case 'Paid':
            return 'bg-emerald-50 border-emerald-200 text-emerald-700';
        case 'Pending':
            return 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#891920]';
        case 'Overdue':
            return 'bg-red-50 border-red-200 text-red-700';
    }
};

export default function Invoices() {
    const [filter, setFilter] = useState<'all' | 'Paid' | 'Pending' | 'Overdue'>('all');

    const visible = invoices.filter((inv) => filter === 'all' || inv.status === filter);

    const outstanding = invoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
    const overdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);
    const paid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);

    return (
        <PortalLayout>
            <Head title="My Invoices" />

            {/* Page Header */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mb-8">
                <motion.div variants={fadeUp}>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Invoices</h1>
                    <p className="text-slate-500 mt-1">Transparent billing — every invoice linked to the matter it belongs to.</p>
                </motion.div>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
                initial="hidden" animate="visible" variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
                <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/30 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#891920] ring-1 ring-[#D4AF37]/30">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Outstanding</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-serif font-bold text-[#891920]">{kes(outstanding)}</div>
                </motion.div>

                <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 text-red-700 ring-1 ring-red-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L12 3.375c-.866-1.5-2.813-1.5-3.374 0l-7.929 13.75zM12 16.875h.008v.008H12v-.008z" /></svg>
                        </div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Overdue</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-serif font-bold text-red-700">{kes(overdue)}</div>
                </motion.div>

                <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Paid To Date</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-serif font-bold text-emerald-700">{kes(paid)}</div>
                </motion.div>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: premiumEase, delay: 0.2 }}
                className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8"
            >
                {(['all', 'Pending', 'Paid', 'Overdue'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                            filter === tab
                                ? 'bg-[#891920] text-white border-[#891920] shadow-lg shadow-[#891920]/20'
                                : 'border-slate-200 text-slate-600 bg-white hover:border-[#D4AF37] hover:text-[#891920]'
                        }`}
                    >
                        {tab === 'all' ? `All (${invoices.length})` : tab}
                    </button>
                ))}
            </motion.div>

            {/* Invoice List */}
            <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={staggerContainer}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
            >
                {visible.length === 0 ? (
                    <div className="p-16 text-center">
                        <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">No invoices here</h3>
                        <p className="text-slate-500 text-sm">Nothing matches this filter — you're all settled.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {visible.map((inv, i) => (
                            <motion.div key={inv.number} variants={fadeUp} className="flex flex-col md:flex-row md:items-center gap-4 p-6 hover:bg-slate-50 transition-colors group">
                                {/* Invoice Identity */}
                                <div className="flex items-center gap-4 flex-grow min-w-0">
                                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] ring-1 ring-[#891920]/10 shrink-0 group-hover:bg-[#D4AF37] group-hover:ring-[#D4AF37] transition-colors duration-300">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-slate-900 font-semibold text-sm group-hover:text-[#891920] transition-colors">{inv.number}</div>
                                        <div className="text-xs text-slate-400 mt-1 truncate">{inv.matter}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">Issued {inv.issued} · Due {inv.due}</div>
                                    </div>
                                </div>

                                {/* Amount + Status */}
                                <div className="flex items-center gap-4 md:text-right shrink-0">
                                    <div>
                                        <div className="text-slate-900 font-serif font-bold">{kes(inv.amount)}</div>
                                        <span className={`inline-block mt-1.5 px-3 py-1 text-xs font-bold rounded-full border ${statusBadge(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0 md:ml-4">
                                    {inv.status !== 'Paid' && (
                                        <button className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 bg-[#891920] text-white text-xs font-bold rounded-full overflow-hidden transition-all duration-500 shadow-md shadow-[#891920]/20">
                                            <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></span>
                                            <span className="relative group-hover/btn:text-[#891920] transition-colors duration-500">Pay Now</span>
                                        </button>
                                    )}
                                    <button
                                        aria-label={`Download ${inv.number}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-[#891920] hover:border-[#891920] hover:text-white transition-all shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Billing Help */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: premiumEase }}
                className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-4"
            >
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] ring-1 ring-[#891920]/10 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.171 1.025 1.171 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
                </div>
                <div>
                    <h3 className="text-slate-900 font-serif font-bold text-lg mb-1">Questions about an invoice?</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Billing queries go straight to the accounts team. We'll clarify any line item — no surprises, ever.
                    </p>
                    <Link href="/portal/messages" className="inline-flex items-center gap-2 mt-3 text-[#891920] font-bold text-sm hover:text-[#D4AF37] hover:gap-3 transition-all">
                        Contact billing <span className="text-[#D4AF37]">→</span>
                    </Link>
                </div>
            </motion.div>
        </PortalLayout>
    );
}
