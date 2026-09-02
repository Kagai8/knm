import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import NewIcon from '@/assets/NEWLOGO.avif';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Practice Areas', href: '/practice-areas' },
    { name: 'Our Team', href: '/team' },
    { name: 'Blog', href: '/blog' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'Contact', href: '/contact' },
];

const LogoIcon = ({ className = "" }: { className?: string }) => (
    <img
        src={NewIcon}
        alt="K&A Advocates Logo"
        width={42}
        height={42}
        className={`h-10 w-auto object-contain ${className}`}
    />
);

export default function PublicLayout({ children }: { children: ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-[#D4AF37] selection:text-[#891920]">

            {/* Top Info Bar (Deep Red Anchor) */}
            <div className="bg-[#891920] text-white/90 text-xs py-2.5 hidden md:block border-b border-[#D4AF37]/20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors cursor-default">
                            <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                            Nairobi, Kenya
                        </span>
                        <span className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors cursor-default">
                            <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                            +254 700 000 000
                        </span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors cursor-default">
                        <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                        info@kaadvocates.co.ke
                    </div>
                </div>
            </div>

            {/* Navbar (White, Sticky, Dynamic Shadow) */}
            <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-lg shadow-slate-900/5 border-b border-slate-100' : 'border-b border-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-24">
                        <Link href="/" className="flex items-center gap-3 group">
                            <LogoIcon />
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-serif font-bold text-[#891920] tracking-wide group-hover:text-[#D4AF37] transition-colors">
                                    K&A <span className="text-slate-900">Advocates</span>
                                </span>
                                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 mt-1 font-medium">Professional. Trustworthy. Honest.</span>
                            </div>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`group relative text-sm font-semibold tracking-wide transition-colors ${
                                        url === link.href ? 'text-[#891920]' : 'text-slate-600 hover:text-[#891920]'
                                    }`}
                                >
                                    {link.name}
                                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37] transition-all duration-300 ${
                                        url === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`}></span>
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden lg:flex items-center gap-6">
                            <Link
                                href="/login"
                                className="text-sm font-semibold text-slate-600 hover:text-[#891920] transition-colors"
                            >
                                Client Portal
                            </Link>
                            <Link
                                href="/contact#enquiry-form"
                                className="px-6 py-2.5 bg-[#891920] text-white text-sm font-bold rounded-full hover:bg-[#D4AF37] hover:text-[#891920] transition-all duration-300 shadow-md shadow-[#891920]/20 hover:shadow-[#D4AF37]/40"
                            >
                               Client Enquiry
                            </Link>
                        </div>

                        <button className="lg:hidden text-slate-900" onClick={() => setMobileOpen(true)}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu (Slide-in Drawer) */}
            <div className={`fixed inset-0 z-50 pointer-events-none ${mobileOpen ? 'pointer-events-auto' : ''}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileOpen(false)}
                />

                {/* Drawer */}
                <div className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full p-8">
                        <div className="flex justify-between items-center mb-12">
                            <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                                <LogoIcon />
                                <span className="text-xl font-serif font-bold text-[#891920]">K&A</span>
                            </Link>
                            <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <nav className="flex flex-col gap-6 text-2xl font-serif font-bold text-slate-900">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`border-b border-slate-100 pb-4 transition-colors ${url === link.href ? 'text-[#891920]' : 'hover:text-[#891920]'}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto space-y-4">
                            <Link href="/login" className="block w-full text-center px-6 py-4 border-2 border-slate-200 text-slate-900 font-bold rounded-full hover:border-[#891920]" onClick={() => setMobileOpen(false)}>
                                Client Portal Login
                            </Link>
                            <Link href="/contact#enquiry-form" className="block w-full text-center px-6 py-4 bg-[#891920] text-white font-bold rounded-full hover:bg-[#D4AF37] hover:text-[#891920] transition-colors" onClick={() => setMobileOpen(false)}>
                                Book Consultation
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content (White Canvas) */}
            <main className="flex-grow bg-white">
                {children}
            </main>

            {/* Footer (Deep Red Anchor) */}
            <footer className="bg-[#891920] text-white mt-auto border-t border-[#D4AF37]/20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">

                        {/* Col 1: Brand */}
                        <div className="lg:col-span-4">
                            <Link href="/" className="flex items-center gap-3 mb-6">
                                <LogoIcon className="brightness-0 invert" />
                                <span className="text-xl font-serif font-bold text-white">K&A <span className="text-[#D4AF37]">Advocates</span></span>
                            </Link>
                            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
                                Building the digital foundation of modern legal practice. We combine deep legal expertise with a digital-first approach to deliver exceptional results.
                            </p>
                            <div className="flex gap-3">
                                {['Li', 'Tw', 'Fb'].map(social => (
                                    <a key={social} href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-[#891920] text-white transition-all text-xs font-bold border border-white/20">
                                        {social}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Col 2: The Firm */}
                        <div className="lg:col-span-2">
                            <h4 className="text-white font-serif font-bold text-lg mb-6">The Firm</h4>
                            <ul className="space-y-3">
                                {navLinks.slice(0, 4).map(link => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-sm text-white/70 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                                            <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 3: Practice Areas */}
                        <div className="lg:col-span-3">
                            <h4 className="text-white font-serif font-bold text-lg mb-6">Practice Areas</h4>
                            <ul className="space-y-3">
                                {['Commercial Law', 'Civil Litigation', 'Conveyancing', 'Employment Law', 'Intellectual Property'].map(area => (
                                    <li key={area}>
                                        <Link href="/practice-areas" className="text-sm text-white/70 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                                            <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>
                                            {area}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 4: Access */}
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <div>
                                <h4 className="text-white font-serif font-bold text-lg mb-4">Access</h4>
                                <ul className="space-y-3">
                                    <li><Link href="/login" className="text-sm text-white/70 hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>Firm Login Portal</Link></li>
                                    <li><Link href="/contact#enquiry-form" className="text-sm text-white/70 hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>New Client Enquiry</Link></li>
                                    <li><Link href="/contact" className="text-sm text-white/70 hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>Contact Support</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-white/50">
                            &copy; {new Date().getFullYear()} K&A Advocates. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-xs text-white/50">
                            <a href="#" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-[#D4AF37] transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
