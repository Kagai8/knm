import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import NewIcon from '@/assets/NEWLOGO.avif';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export default function AuthShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left: Brand Panel */}
            <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[#891920] p-12 xl:p-16">
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNGRkYiLz48L3N2Zz4=')]" />
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: premiumEase }}
                    className="relative flex items-center gap-3"
                >
                    <img src={NewIcon} alt="K&A Advocates" className="h-11 w-auto object-contain brightness-0 invert" />
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-serif font-bold text-white">K&A <span className="text-[#D4AF37]">Advocates</span></span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/60 mt-1 font-medium">Professional. Trustworthy. Honest.</span>
                    </div>
                </motion.div>

                <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative">
                    <motion.div variants={fadeUp} className="h-px w-12 bg-[#D4AF37] mb-8" />
                    <motion.h2 variants={fadeUp} className="text-4xl xl:text-5xl font-serif font-bold text-white leading-tight mb-6">
                        Your matters, in <span className="italic text-[#D4AF37]">one secure home.</span>
                    </motion.h2>
                    <motion.p variants={fadeUp} className="text-white/70 text-lg leading-relaxed max-w-md mb-10">
                        Track progress, share documents and message your advocate — any time, from anywhere.
                    </motion.p>
                    <motion.blockquote variants={fadeUp} className="border-l-4 border-[#D4AF37] pl-6 py-1 text-[#D4AF37] font-serif italic text-xl leading-snug max-w-md">
                        "We are building the digital operating system that will support K&A Advocates for many years."
                    </motion.blockquote>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="relative text-white/50 text-xs uppercase tracking-[0.25em]"
                >
                    Client Portal · Secure Access
                </motion.p>
            </div>

            {/* Right: Form Panel */}
            <div className="flex flex-col p-6 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="lg:hidden flex items-center gap-3">
                        <img src={NewIcon} alt="K&A Advocates" className="h-10 w-auto object-contain" />
                        <span className="text-lg font-serif font-bold text-[#891920]">K&A <span className="text-slate-900">Advocates</span></span>
                    </Link>
                    <Link href="/" className="hidden lg:inline-flex text-sm text-slate-500 hover:text-[#891920] transition-colors ml-auto">
                        ← Back to website
                    </Link>
                </div>

                <div className="flex-grow flex items-center justify-center py-10">
                    <div className="w-full max-w-md">{children}</div>
                </div>

                <p className="text-center text-xs text-slate-400">
                    Protected by firm-grade security · <span className="text-[#891920] font-semibold">K&A Advocates</span>
                </p>
            </div>
        </div>
    );
}
