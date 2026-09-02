import { Head } from '@inertiajs/react';
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

const documents = [
    { name: 'Sale Agreement — Karen Property.pdf', matter: 'Property Purchase — Karen', type: 'Contract', date: '08 Aug 2026', size: '2.4 MB' },
    { name: 'Draft Transfer Instrument.pdf', matter: 'Property Purchase — Karen', type: 'Draft', date: '05 Aug 2026', size: '1.1 MB' },
    { name: 'Official Search Results.pdf', matter: 'Property Purchase — Karen', type: 'Due Diligence', date: '01 Aug 2026', size: '890 KB' },
    { name: 'National ID — Client.pdf', matter: 'Property Purchase — Karen', type: 'Client ID', date: '12 May 2026', size: '850 KB' },
    { name: 'Employment Act Compliance Memo.pdf', matter: 'Employment Contract Review', type: 'Note', date: '02 Aug 2026', size: '420 KB' },
    { name: 'Engagement Letter — Employment.pdf', matter: 'Employment Contract Review', type: 'Contract', date: '28 Jul 2026', size: '310 KB' },
    { name: 'Trademark Certificate.pdf', matter: 'Trademark Registration — Studio Brand', type: 'Certificate', date: '20 Dec 2025', size: '1.8 MB' },
    { name: 'Invoice — KAA/IP/2025/087.pdf', matter: 'Trademark Registration — Studio Brand', type: 'Invoice', date: '18 Dec 2025', size: '120 KB' },
];

export default function Documents() {
    const [query, setQuery] = useState('');
    const [matterFilter, setMatterFilter] = useState('All Matters');

    const matterFilters = ['All Matters', ...Array.from(new Set(documents.map((d) => d.matter)))];

    const visible = documents.filter(
        (d) =>
            (matterFilter === 'All Matters' || d.matter === matterFilter) &&
            d.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <PortalLayout>
            <Head title="My Documents" />

            {/* Page Header */}
            <motion.div
                initial="hidden" animate="visible" variants={staggerContainer}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8"
            >
                <motion.div variants={fadeUp}>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Documents</h1>
                    <p className="text-slate-500 mt-1">
                        {documents.length} documents · stored securely, searchable, and shared only with your advocate.
                    </p>
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                        <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search documents..."
                            className="w-full sm:w-64 pl-10 pr-4 py-3 rounded-full bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors shadow-sm"
                        />
                    </div>

                    {/* Upload */}
                    <button className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#891920] text-white text-sm font-bold rounded-full overflow-hidden transition-all duration-500 shadow-lg shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40">
                        <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                        <svg className="relative w-4 h-4 transition-colors duration-500 group-hover:text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                        <span className="relative transition-colors duration-500 group-hover:text-[#891920]">Upload Document</span>
                    </button>
                </motion.div>
            </motion.div>

            {/* Matter Filter Chips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: premiumEase, delay: 0.2 }}
                className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8"
            >
                {matterFilters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setMatterFilter(filter)}
                        className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                            matterFilter === filter
                                ? 'bg-[#891920] text-white border-[#891920] shadow-lg shadow-[#891920]/20'
                                : 'border-slate-200 text-slate-600 bg-white hover:border-[#D4AF37] hover:text-[#891920]'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </motion.div>

            {/* Documents List */}
            <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={staggerContainer}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
            >
                {visible.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">No documents found</h3>
                        <p className="text-slate-500 text-sm">Try a different search term or matter filter.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {visible.map((doc, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                className="flex items-center gap-4 p-6 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] ring-1 ring-[#891920]/10 shrink-0 group-hover:bg-[#D4AF37] group-hover:ring-[#D4AF37] transition-colors duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                </div>

                                <div className="flex-grow min-w-0">
                                    <div className="text-slate-900 font-semibold text-sm truncate group-hover:text-[#891920] transition-colors">
                                        {doc.name}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1 truncate">
                                        {doc.matter} · {doc.date} · {doc.size}
                                    </div>
                                </div>

                                <span className="hidden md:inline-block px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#891920] text-xs font-bold rounded-full shrink-0">
                                    {doc.type}
                                </span>

                                <button
                                    aria-label={`Download ${doc.name}`}
                                    className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-[#891920] hover:border-[#891920] hover:text-white transition-all shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Security Note */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: premiumEase }}
                className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-4"
            >
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] ring-1 ring-[#891920]/10 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v4.5m4.5 0a3 3 0 11-6 0 3 3 0 016 0zM12 14.25v3m-1.5-3h3" /></svg>
                </div>
                <div>
                    <h3 className="text-slate-900 font-serif font-bold text-lg mb-1">Security-first by design</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Every document is encrypted, permissioned, and visible only to you and your assigned advocate. Nothing is shared outside your matter team.
                    </p>
                </div>
            </motion.div>
        </PortalLayout>
    );
}
