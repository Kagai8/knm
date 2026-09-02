import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

// Premium Easing Curve
const premiumEase = [0.25, 0.1, 0.25, 1];

// Fade Up Variant
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};

// Stagger Container
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

export default function About() {
    return (
        <>
            <Head title="About Us" />

            {/* 1. Hero Section: Editorial Split */}
            <section className="relative bg-white overflow-hidden pt-24 pb-32 min-h-[80vh] flex items-center">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        {/* Left: Content */}
                        <div className="relative z-10">
                            <motion.div
                                initial="hidden" animate="visible" variants={fadeUp}
                                className="inline-flex items-center gap-3 mb-8"
                            >
                                <div className="h-px w-12 bg-[#D4AF37]"></div>
                                <span className="text-[#891920] text-sm font-bold tracking-[0.2em] uppercase">Our Firm</span>
                            </motion.div>

                            <motion.h1
                                initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}
                                className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.05] tracking-tight mb-8"
                            >
                                A Legacy of Trust. <br />
                                A Future of <span className="italic text-[#891920]">Innovation.</span>
                            </motion.h1>

                            <motion.p
                                initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}
                                className="text-lg text-slate-600 max-w-xl leading-relaxed mb-10"
                            >
                                K&A Advocates has earned its reputation through the quality of its legal work and the trust of its clients. Today, we are building the digital foundation to support that reputation for decades to come.
                            </motion.p>

                            <motion.div
                                initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }}
                                className="flex items-center gap-8 pt-8 border-t border-slate-200"
                            >
                                <div>
                                    <div className="text-4xl font-serif font-bold text-[#891920]">15+</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-medium">Years of Excellence</div>
                                </div>
                                <div className="h-12 w-px bg-slate-200"></div>
                                <div>
                                    <div className="text-4xl font-serif font-bold text-[#891920]">500+</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-medium">Matters Resolved</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right: Image Collage */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: premiumEase, delay: 0.2 }}
                            className="relative h-[500px] lg:h-[650px] hidden lg:block"
                        >
                            <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-2xl overflow-hidden shadow-2xl border-8 border-white ring-1 ring-slate-200">
                                <img src="https://images.unsplash.com/photo-1507692812060-8844b5980090?auto=format&fit=crop&q=80&w=1200" alt="Law Firm Building" className="w-full h-full object-cover" />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8, ease: "backOut" }}
                                className="absolute -bottom-8 -left-8 bg-[#891920] text-white p-8 rounded-2xl shadow-2xl max-w-xs border-4 border-white"
                            >
                                <svg className="w-8 h-8 text-[#D4AF37] mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                                <p className="font-serif text-xl font-bold italic leading-snug">"Excellence, integrity, and results."</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Executive Message */}
            <section className="bg-slate-50 py-32 border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.span variants={fadeUp} className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">Executive Message</motion.span>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">The Central Premise of <span className="italic text-[#891920]">K&A</span></motion.h2>
                    </motion.div>

                    <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed space-y-8">
                        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            For years, K&A Advocates has operated on a model that served us well: manual case notes, scattered documents, informal reminders, and word-of-mouth referrals. It was built on personal dedication and deep legal knowledge.
                        </motion.p>
                        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}>
                            But a reputation like ours deserves an operational foundation to match it. We recognized that the traditional model increasingly limits visibility, consistency, and growth. Information scattered across notebooks and individual memory is no longer enough for the modern complexities our clients face.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: premiumEase }}
                            className="my-12 py-8 px-8 bg-white rounded-2xl shadow-xl border-l-8 border-[#D4AF37] relative"
                        >
                            <p className="text-[#891920] font-serif text-2xl md:text-3xl italic leading-snug font-medium">
                                "We are not simply implementing software. We are building the digital operating system that will support K&A Advocates for many years."
                            </p>
                        </motion.div>

                        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
                            Today, K&A Advocates merges deep legal expertise with a digital-first approach. We have replaced scattered manual processes with a single, security-first system of record for clients, matters, documents, and deadlines. This ensures that every prospective client receives a timely response, every deadline is met with automated precision, and our partners have real-time visibility into the firm's most critical work.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* 3. Core Values */}
            <section className="bg-white py-32">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-20"
                    >
                        <motion.span variants={fadeUp} className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">What Drives Us</motion.span>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">Our Core <span className="italic text-[#891920]">Values</span></motion.h2>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {[
                            { title: 'Excellence', desc: 'We hold ourselves to the highest standards of legal practice, ensuring every matter receives meticulous attention and strategic rigor.', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
                            { title: 'Integrity', desc: 'Trust is the currency of our profession. We operate with absolute transparency and ethical fortitude in all our dealings.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                            { title: 'Confidentiality', desc: 'We treat your sensitive information with the utmost security. Our digital infrastructure is built on a security-first architecture.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                            { title: 'Innovation', desc: 'We embrace modern technology to streamline workflows, automate reminders, and provide our clients with a seamless digital experience.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
                        ].map((value, i) => (
                            <motion.div key={i} variants={fadeUp} className="group bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-[#D4AF37]/30 hover:shadow-xl transition-all duration-500">
                                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] mb-6 group-hover:bg-[#D4AF37] group-hover:text-[#891920] transition-colors duration-500 ring-1 ring-[#891920]/10 group-hover:ring-[#D4AF37]">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={value.icon} /></svg>
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3 group-hover:text-[#891920] transition-colors">{value.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">{value.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 4. The Team / Culture */}
            <section className="bg-slate-50 py-32 relative overflow-hidden border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                            transition={{ duration: 1, ease: premiumEase }}
                            className="relative order-2 lg:order-1"
                        >
                            <div className="absolute -inset-4 bg-[#D4AF37]/10 rounded-3xl -z-10"></div>
                            <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1200" alt="Legal Team Collaboration" className="rounded-2xl shadow-2xl w-full h-[550px] object-cover ring-1 ring-slate-200" />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.8, ease: "backOut" }}
                                className="absolute -top-6 -left-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-xl hidden md:block"
                            >
                                <div className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">Firm Culture</div>
                                <div className="text-slate-900 font-serif text-xl font-bold">Collaborative & Focused</div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true }}
                            variants={staggerContainer}
                            className="order-1 lg:order-2"
                        >
                            <motion.span variants={fadeUp} className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">Our People</motion.span>
                            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 mb-8 leading-tight">
                                Specialized Teams. <br /> <span className="italic text-[#891920]">Unified Vision.</span>
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-slate-600 text-lg mb-6 leading-relaxed">
                                Our advocates are not generalists; they are dedicated specialists focusing on specific practice areas. This allows for unmatched expertise and deeper counsel for our clients.
                            </motion.p>
                            <motion.p variants={fadeUp} className="text-slate-600 text-lg mb-10 leading-relaxed">
                                Supported by a centralized digital practice management system, our team collaborates seamlessly. Every partner, associate, and paralegal works from the same secure source of truth, ensuring that no detail is lost and every client receives consistent, high-quality representation.
                            </motion.p>
                            <motion.div variants={fadeUp}>
                                <Link href="/team" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#891920] text-white font-bold rounded-full overflow-hidden transition-all duration-500 shadow-xl shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40">
                                    <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                                    <span className="relative group-hover:text-[#891920] transition-colors duration-500">Meet the Team</span>
                                    <svg className="relative w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 5. CTA (Deep Red Anchor) */}
            <section className="bg-[#891920] py-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')]"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: premiumEase }}
                    className="relative max-w-4xl mx-auto px-6 text-center"
                >
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
                        Ready to Experience the <br /><span className="italic text-[#D4AF37]">K&A Difference?</span>
                    </h2>
                    <p className="text-white/70 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Whether you are facing a complex commercial dispute or require strategic corporate counsel, our team is ready to provide the exceptional representation you deserve.
                    </p>
                    <Link href="/enquiry" className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#891920] font-bold rounded-full hover:bg-white transition-all duration-300 shadow-2xl shadow-[#D4AF37]/30 text-lg">
                        Submit a Client Enquiry
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </motion.div>
            </section>
        </>
    );
}
