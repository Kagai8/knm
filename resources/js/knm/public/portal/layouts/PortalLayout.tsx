import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const premiumEase = [0.25, 0.1, 0.25, 1];

const navItems = [
    {
        name: 'Dashboard',
        href: '/portal',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
    },
    {
        name: 'My Cases',
        href: '/portal/cases',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.296-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />,
    },
    {
        name: 'Documents',
        href: '/portal/documents',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
    },
    {
        name: 'Messages',
        href: '/portal/messages',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />,
    },
    {
        name: 'Invoices',
        href: '/portal/invoices',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />,
    },
    {
        name: 'Profile',
        href: '/portal/profile',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
    },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();

    const isActive = (href: string) =>
        href === '/portal' ? url === '/portal' : url.startsWith(href);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Portal Sub-Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: premiumEase }}
                    className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-5 mb-8 shadow-sm"
                >
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-1">Client Portal</div>
                        <div className="text-slate-900 font-serif font-bold text-xl">Welcome back, Grace</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#D4AF37] rounded-full"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#891920] text-white flex items-center justify-center font-serif font-bold text-sm shadow-md">
                                GW
                            </div>
                            <div className="hidden md:block leading-tight">
                                <div className="text-sm font-semibold text-slate-900">Grace Wanjiru</div>
                                <div className="text-xs text-slate-500">Client since 2024</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
                    {/* Desktop Sidebar (sticky card) */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: premiumEase, delay: 0.1 }}
                        className="hidden lg:block sticky top-28"
                    >
                        <nav className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                        isActive(item.href)
                                            ? 'bg-[#891920] text-white shadow-lg shadow-[#891920]/20'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-[#891920]'
                                    }`}
                                >
                                    <svg className={`w-5 h-5 ${isActive(item.href) ? 'text-[#D4AF37]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {item.icon}
                                    </svg>
                                    {item.name}
                                </Link>
                            ))}

                            <div className="pt-3 mt-3 border-t border-slate-100">
                                <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-[#891920] transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                                    Sign Out
                                </Link>
                            </div>
                        </nav>

                        {/* Help Card */}
                        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h4 className="text-[#891920] font-serif font-bold text-lg mb-2">Need help?</h4>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                Questions about your matter? Your advocate is one message away.
                            </p>
                            <Link href="/portal/messages" className="inline-flex items-center gap-2 text-[#891920] font-bold text-sm hover:text-[#D4AF37] transition-all hover:gap-3">
                                Send a message <span className="text-[#D4AF37]">→</span>
                            </Link>
                        </div>
                    </motion.aside>

                    {/* Content Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: premiumEase, delay: 0.15 }}
                    >
                        {/* Mobile Pill Nav */}
                        <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                                        isActive(item.href)
                                            ? 'bg-[#891920] text-white border-[#891920]'
                                            : 'border-slate-200 text-slate-600 bg-white'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
