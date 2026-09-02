import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import AuthShell from '@/knm/public/auth/components/AuthShell';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const inputClass =
    'w-full px-5 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-colors shadow-sm text-sm';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <AuthShell>
            <Head title="Create Account · K&A Advocates" />

            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                <motion.div variants={fadeUp} className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">Create your account</h1>
                    <p className="text-slate-500">Your secure home for matters, documents and messages.</p>
                </motion.div>

                <motion.form variants={fadeUp} onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm text-slate-700 font-semibold mb-2">Full Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Jane Doe"
                                className={inputClass}
                                required
                            />
                            {errors.name && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 font-semibold mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+254 7XX XXX XXX"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-700 font-semibold mb-2">Email Address</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            className={inputClass}
                            required
                        />
                        {errors.email && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm text-slate-700 font-semibold mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Minimum 8 characters"
                                className={`${inputClass} pr-12`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#891920] transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-3.032 4.476M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm text-slate-700 font-semibold mb-2">Confirm Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Repeat your password"
                            className={inputClass}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="group relative w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#891920] text-white font-bold rounded-full overflow-hidden transition-all duration-500 shadow-lg shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40 disabled:opacity-60"
                    >
                        <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                        <span className="relative group-hover:text-[#891920] transition-colors duration-500">
                            {processing ? 'Creating account…' : 'Create Account'}
                        </span>
                        <svg className="relative w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>

                    <p className="text-xs text-slate-400 leading-relaxed">
                        By creating an account, you agree to be contacted by K&A Advocates regarding your enquiries. All information is treated with strict confidentiality.
                    </p>
                </motion.form>

                <motion.div variants={fadeUp} className="mt-8 text-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-slate-400 uppercase tracking-wider">Already a client?</span></div>
                    </div>
                    <Link href="/login" className="text-sm font-semibold text-[#891920] hover:text-[#D4AF37] transition-colors">
                        Sign in to your portal →
                    </Link>
                </motion.div>
            </motion.div>
        </AuthShell>
    );
}
