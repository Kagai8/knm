import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import NewIcon from '@/assets/NEWLOGO.avif';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: premiumEase } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const inputClass =
    'w-full px-5 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-colors shadow-sm text-sm';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', remember: false });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/private/login');
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#140406] flex items-center justify-center p-6 selection:bg-[#D4AF37] selection:text-[#891920]">
            {/* Ambient glows */}
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#891920]/30 rounded-full blur-3xl pointer-events-none" />
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNGRkYiLz48L3N2Zz4=')]" />

            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative w-full max-w-md">
                {/* Confidential badge */}
                <motion.div variants={fadeUp} className="flex justify-center mb-5">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Private &amp; Confidential
                    </span>
                </motion.div>

                {/* Card */}
                <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-2xl p-10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <img src={NewIcon} alt="K&A Advocates" className="h-12 w-auto object-contain mb-4" />
                        <div className="text-[10px] uppercase tracking-[0.25em] text-[#891920] font-bold mb-2">Internal Operations</div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Staff Sign In</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">Access is limited to authorized K&amp;A personnel.</p>
                    </div>

                    <form className="space-y-5" onSubmit={submit}>
                        <div>
                            <label className="block text-sm text-slate-700 font-semibold mb-2">Work Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="name@kaadvocates.co.ke" className={inputClass} required />
                            {errors.email && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-slate-700 font-semibold mb-2">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="••••••••" className={`${inputClass} pr-12`} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#891920] transition-colors">
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-3.032 4.476M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="w-4 h-4 accent-[#D4AF37] rounded" />
                                <span className="text-sm text-slate-600">Keep me signed in</span>
                            </label>
                            <span className="text-sm font-semibold text-[#891920] cursor-pointer hover:text-[#D4AF37] transition-colors">Forgot?</span>
                        </div>

                        <button type="submit" disabled={processing} className="group relative w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#891920] text-white font-bold rounded-full overflow-hidden transition-all duration-500 shadow-lg shadow-[#891920]/30 hover:shadow-2xl hover:shadow-[#891920]/50 disabled:opacity-60">
                            <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                            <span className="relative group-hover:text-[#891920] transition-colors duration-500">{processing ? 'Verifying…' : 'Enter Workspace'}</span>
                            <svg className="relative w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3">
                        <svg className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            All activity within this workspace is monitored, logged and subject to the firm's confidentiality policy. Unauthorized access is prohibited.
                        </p>
                    </div>
                </motion.div>

                {/* Back to site */}
                <motion.div variants={fadeUp} className="text-center mt-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[#D4AF37] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to public website
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
