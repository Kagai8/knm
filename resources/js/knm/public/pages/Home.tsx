import { Head, Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Premium Easing Curve (The secret to expensive-feeling motion)
const premiumEase = [0.25, 0.1, 0.25, 1];

// Staggered Text Reveal (Blur + Slide Up)
const wordReveal = {
    hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
    visible: (i: number) => ({
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { delay: i * 0.08, duration: 0.9, ease: premiumEase },
    }),
};

// Standard Fade Up
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};

// Stagger Container for Grids
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

export default function Home() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

    // Parallax effect for hero images
    const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    return (
        <>
            <Head title="Home" />

            {/* 1. Hero Section: Cinematic Parallax & Blur Reveals */}
            <section ref={heroRef} className="relative bg-white overflow-hidden pt-24 pb-32 min-h-[90vh] flex items-center">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                        {/* Left: Staggered Content */}
                        <div className="relative z-10">
                            <motion.div
                                initial="hidden" animate="visible"
                                variants={fadeUp}
                                className="inline-flex items-center gap-3 mb-8"
                            >
                                <div className="h-px w-12 bg-[#D4AF37]"></div>
                                <span className="text-[#891920] text-sm font-bold tracking-[0.2em] uppercase">Est. Legal Excellence</span>
                            </motion.div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.05] tracking-tight mb-8 overflow-hidden">
                                {/* Staggered Word Reveal */}
                                {['Strategic', 'Counsel', 'for', 'a'].map((word, i) => (
                                    <motion.span key={i} custom={i} variants={wordReveal} initial="hidden" animate="visible" className="inline-block mr-4">
                                        {word}
                                    </motion.span>
                                ))}
                                <br />
                                {['Complex', 'World.'].map((word, i) => (
                                    <motion.span key={i} custom={i + 5} variants={wordReveal} initial="hidden" animate="visible" className={`inline-block mr-4 ${word === 'Complex' ? 'italic text-[#891920]' : ''}`}>
                                        {word}
                                    </motion.span>
                                ))}
                            </h1>

                            <motion.p
                                variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.6 }}
                                className="text-lg text-slate-600 max-w-xl mb-12 leading-relaxed"
                            >
                                With a dedicated team of experienced advocates, K&A Advocates knows that the best way to address our clients’ legal issues is to understand their business and industry. Your case is important to us.
                            </motion.p>

                            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="flex flex-wrap items-center gap-6">
                                <Link href="/enquiry" className="group relative flex items-center gap-3 px-8 py-4 bg-[#891920] text-white font-bold rounded-full overflow-hidden transition-all duration-500 shadow-xl shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40">
                                    <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                                    <span className="relative group-hover:text-[#891920] transition-colors duration-500">Book a Consultation</span>
                                    <svg className="relative w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </Link>
                                <Link href="/practice-areas" className="flex items-center gap-2 px-8 py-4 text-slate-900 font-semibold hover:text-[#891920] transition-colors border-b-2 border-transparent hover:border-[#D4AF37]">
                                    Explore Practice Areas
                                </Link>
                            </motion.div>

                            {/* Stats */}
                            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 1 }} className="mt-20 pt-10 border-t border-slate-200 grid grid-cols-3 gap-8">
                                {[{n:'15+', l:'Years Practice'}, {n:'500+', l:'Matters Resolved'}, {n:'24/7', l:'Client Portal'}].map((s, i) => (
                                    <div key={i}>
                                        <div className="text-3xl md:text-4xl font-serif font-bold text-[#891920]">{s.n}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider mt-2 font-medium">{s.l}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right: Parallax Image Collage */}
                        <motion.div style={{ y: heroImageY }} className="relative h-[500px] lg:h-[650px] hidden lg:block">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 1.2, ease: premiumEase, delay: 0.2 }}
                                className="absolute top-0 right-0 w-3/4 h-3/4 rounded-2xl overflow-hidden shadow-2xl border-8 border-white ring-1 ring-slate-200"
                            >
                                <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200" alt="Law Library" className="w-full h-full object-cover" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 1.2, ease: premiumEase, delay: 0.4 }}
                                className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-2xl overflow-hidden shadow-2xl border-8 border-white ring-1 ring-[#D4AF37]/50"
                            >
                                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" alt="Corporate Architecture" className="w-full h-full object-cover" />
                            </motion.div>
                            <div className="absolute -top-10 -right-10 w-32 h-32 border border-[#D4AF37]/40 rounded-full"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Practice Areas: Scroll-Triggered Grid */}
            <section className="bg-slate-50 py-32 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-20"
                    >
                        <motion.span variants={fadeUp} className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">Our Expertise</motion.span>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">Comprehensive Legal <span className="italic text-[#891920]">Solutions</span></motion.h2>
                        <motion.p variants={fadeUp} className="mt-6 text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
                            We provide strategic counsel across a wide spectrum of practice areas, tailored to protect your interests and drive your success.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            { title: 'Corporate & Commercial', desc: 'Advising on mergers, acquisitions, corporate governance, and complex commercial transactions.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800' },
                            { title: 'Litigation & Dispute Resolution', desc: 'Vigorous representation in commercial disputes, civil litigation, and alternative dispute resolution.', img: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800' },
                            { title: 'Real Estate & Conveyancing', desc: 'End-to-end legal support for property transactions, development projects, and real estate finance.', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800' },
                        ].map((area, i) => (
                            <motion.div key={i} variants={fadeUp} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-[#D4AF37]/30 h-full flex flex-col">
                                <div className="h-64 overflow-hidden relative">
                                    <img src={area.img} alt={area.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                </div>
                                <div className="relative p-8 flex flex-col flex-grow">
                                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3 group-hover:text-[#891920] transition-colors">{area.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">{area.desc}</p>
                                    <Link href="/practice-areas" className="inline-flex items-center gap-2 text-[#891920] font-bold text-sm border-b-2 border-transparent hover:border-[#D4AF37] transition-all w-fit">
                                        Learn More <span className="text-[#D4AF37]">→</span>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 3. The K&A Advantage: Split Scroll Reveal */}
            <section className="bg-white py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                            transition={{ duration: 1, ease: premiumEase }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-[#D4AF37]/10 rounded-3xl -z-10"></div>
                            <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1200" alt="Legal Team Meeting" className="rounded-2xl shadow-2xl w-full h-[550px] object-cover ring-1 ring-slate-200" />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.8, ease: "backOut" }}
                                className="absolute -bottom-8 -right-8 bg-[#891920] text-white p-8 rounded-2xl shadow-2xl hidden md:block border-4 border-white"
                            >
                                <div className="text-4xl font-serif font-bold text-[#D4AF37]">98%</div>
                                <div className="text-xs font-bold uppercase tracking-wider mt-1">Client Retention</div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            <motion.span variants={fadeUp} className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">The K&A Advantage</motion.span>
                            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 mb-8 leading-tight">
                                A Modern Approach to <span className="italic text-[#891920]">Legal Practice.</span>
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-slate-600 text-lg mb-12 leading-relaxed">
                                We aren't just practicing law; we are building the digital operating system that supports our clients for years to come. Our firm combines traditional legal rigor with modern operational efficiency.
                            </motion.p>

                            <div className="space-y-8">
                                {[
                                    { title: 'Digital-First Infrastructure', desc: 'Secure client portals and automated matter tracking ensure you are always informed.' },
                                    { title: 'Specialized Advocates', desc: 'Dedicated teams focusing on specific practice areas for unmatched expertise.' },
                                    { title: 'Absolute Confidentiality', desc: 'Security-first architecture protecting your most sensitive assets and information.' },
                                ].map((item, i) => (
                                    <motion.div key={i} variants={fadeUp} className="flex gap-5">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#891920]/5 text-[#891920] shrink-0 mt-1 ring-1 ring-[#891920]/10">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-serif font-bold text-slate-900 mb-2">{item.title}</h4>
                                            <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 4. Executive Quote: Cinematic Scale Reveal */}
            <section className="relative py-40 overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1454165804606-c3d57780b63a?auto=format&fit=crop&q=80&w=2000" alt="Courthouse" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#891920]/95 backdrop-blur-sm"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: premiumEase }}
                    className="relative max-w-4xl mx-auto px-6 text-center"
                >
                    <svg className="w-16 h-16 mx-auto mb-10 text-[#D4AF37] opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                    <blockquote className="text-3xl md:text-5xl font-serif text-white leading-snug mb-12 italic font-light tracking-wide">
                        "We are not simply implementing software. We are building the digital operating system that will support K&A Advocates for many years."
                    </blockquote>
                    <div className="flex items-center justify-center gap-6">
                        <div className="h-px w-16 bg-[#D4AF37]"></div>
                        <cite className="not-italic text-[#D4AF37] font-bold tracking-[0.3em] uppercase text-sm">Executive Vision</cite>
                        <div className="h-px w-16 bg-[#D4AF37]"></div>
                    </div>
                </motion.div>
            </section>
        </>
    );
}
