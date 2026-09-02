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
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const inputClass =
    'w-full px-5 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-colors shadow-sm text-sm';

const labelClass = 'block text-sm text-slate-700 font-semibold mb-2';

const Toggle = ({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) => (
    <button
        type="button"
        aria-label={label}
        onClick={onChange}
        className={`relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0 ${
            enabled ? 'bg-[#891920]' : 'bg-slate-200'
        }`}
    >
        <span
            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                enabled ? 'translate-x-5' : ''
            }`}
        ></span>
    </button>
);

export default function Profile() {
    const [profile, setProfile] = useState({
        name: 'Grace Wanjiru',
        email: 'grace@example.com',
        phone: '+254 712 345 678',
        address: 'Westlands, Nairobi, Kenya',
        idNumber: '23456789',
    });

    const [notifications, setNotifications] = useState({
        emailReminders: true,
        smsReminders: true,
        matterUpdates: true,
        newsletter: false,
    });

    const [saved, setSaved] = useState(false);

    const update = (key: string, value: string) => setProfile((prev) => ({ ...prev, [key]: value }));

    const toggle = (key: keyof typeof notifications) =>
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

    const save = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <PortalLayout>
            <Head title="My Profile" />

            {/* Page Header */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Profile</h1>
                <p className="text-slate-500 mt-1">Your personal details, preferences and account security.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
                {/* Left Column: Summary + Security */}
                <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
                    {/* Profile Summary */}
                    <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
                        <div className="w-24 h-24 mx-auto rounded-full bg-[#891920] text-white flex items-center justify-center font-serif font-bold text-3xl shadow-lg shadow-[#891920]/20 mb-5">
                            GW
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">{profile.name}</h2>
                        <p className="text-slate-500 text-sm mb-6">Client since 2024</p>

                        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100">
                            <div>
                                <div className="text-xl font-serif font-bold text-[#891920]">2</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1">Matters</div>
                            </div>
                            <div>
                                <div className="text-xl font-serif font-bold text-[#891920]">8</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1">Documents</div>
                            </div>
                            <div>
                                <div className="text-xl font-serif font-bold text-[#891920]">3</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1">Messages</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Security Card */}
                    <motion.div variants={fadeUp} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] ring-1 ring-[#891920]/10">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-serif font-bold text-lg">Account Security</h3>
                                <p className="text-slate-500 text-xs">Last login: 14 Aug 2026, 08:12 · Nairobi</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Your account is protected with encrypted sessions. All portal activity is visible only to you and your assigned advocate.
                        </p>
                    </motion.div>
                </motion.div>

                {/* Right Column: Forms */}
                <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
                    {/* Personal Information */}
                    <motion.form variants={fadeUp} onSubmit={save} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-serif font-bold text-slate-900">Personal Information</h2>
                            {saved && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    Saved
                                </motion.span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input type="text" value={profile.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>ID / Passport Number</label>
                                <input type="text" value={profile.idNumber} onChange={(e) => update('idNumber', e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Email Address</label>
                                <input type="email" value={profile.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <input type="tel" value={profile.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Physical Address</label>
                                <input type="text" value={profile.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
                            </div>
                        </div>

                        <button type="submit" className="group relative inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#891920] text-white text-sm font-bold rounded-full overflow-hidden transition-all duration-500 shadow-lg shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40">
                            <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                            <span className="relative group-hover:text-[#891920] transition-colors duration-500">Save Changes</span>
                        </button>
                    </motion.form>

                    {/* Notification Preferences */}
                    <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Notification Preferences</h2>
                        <p className="text-slate-500 text-sm mb-6">Choose how we keep you informed about your matters.</p>

                        <div className="space-y-5">
                            {[
                                { key: 'emailReminders' as const, title: 'Email Reminders', desc: 'Court dates, deadlines and meeting reminders by email.' },
                                { key: 'smsReminders' as const, title: 'SMS Reminders', desc: 'Time-critical alerts sent to your phone.' },
                                { key: 'matterUpdates' as const, title: 'Matter Updates', desc: 'Progress updates whenever your advocate moves a matter forward.' },
                                { key: 'newsletter' as const, title: 'Legal Insights Newsletter', desc: 'Occasional articles and updates from the firm.' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#D4AF37]/30 transition-colors">
                                    <div>
                                        <div className="text-slate-900 font-semibold text-sm">{item.title}</div>
                                        <div className="text-slate-500 text-xs mt-0.5">{item.desc}</div>
                                    </div>
                                    <Toggle enabled={notifications[item.key]} onChange={() => toggle(item.key)} label={item.title} />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Change Password */}
                    <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <h2 className="text-xl font-serif font-bold text-slate-900 mb-6">Change Password</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className={labelClass}>Current Password</label>
                                <input type="password" placeholder="••••••••" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>New Password</label>
                                <input type="password" placeholder="••••••••" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Confirm </label>
                                <input type="password" placeholder="••••••••" className={inputClass} />
                            </div>
                        </div>
                        <button type="button" className="group relative inline-flex items-center gap-2 mt-6 px-6 py-3 border-2 border-[#891920] text-[#891920] text-sm font-bold rounded-full overflow-hidden transition-all duration-500">
                            <span className="absolute inset-0 bg-[#891920] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                            <span className="relative group-hover:text-white transition-colors duration-500">Update Password</span>
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </PortalLayout>
    );
}
