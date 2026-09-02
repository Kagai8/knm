import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const practiceAreas = [
    {
        title: 'Conveyancing & Land Law',
        desc: 'The firm offers comprehensive land services in Kenya, excelling in areas such as property development, consultancy, construction contracts, leasing, financing, and legal tutoring. We are now seeking to expand into representing pension schemes, international investors, and cross-border conveyance.',
        img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
        tag: 'Property',
    },
    {
        title: 'Employment Law',
        desc: 'We specialise in employment law, offering comprehensive services to ensure excellent labour relations. We advise on Employment Act compliance, draft employment contracts, handle termination procedures, and provide guidance on disciplinary and grievance matters for a diverse clientele including SMEs, nonprofits, and individuals.',
        img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200',
        tag: 'Labour Relations',
    },
    {
        title: 'Commercial Law',
        desc: 'The firm focuses on banking and finance law, providing legal advice and services covering asset financing, asset management, banking, trusts, finance regulations, and real estate finance. We prioritize customer dedication, efficiency, and rapid response time. Services include compliance, business documentation, and business formation.',
        img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
        tag: 'Banking & Finance',
    },
    {
        title: 'Civil & Criminal Litigation',
        desc: "The firm's litigation practice focuses on civil, commercial, environmental, employment, probate, and appellate matters. Services include legal opinions, debt recovery, contract disputes, and arbitration. We aim to resolve disputes swiftly and effectively, also providing advice on alternative dispute resolution like arbitration and mediation.",
        img: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&q=80&w=1200',
        tag: 'Dispute Resolution',
    },
    {
        title: 'Intellectual Property Law',
        desc: "The firm has expanded its expertise in Intellectual Property law to meet client demands. We specialize in trademarks, copyrights, patents, and licensing. We've successfully represented prominent musicians in copyright cases, providing valuable advice on intellectual property rights, and aiding clients in business decisions and conflict resolution.",
        img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200',
        tag: 'IP & Creative',
    },
    {
        title: 'Procurement Law',
        desc: 'K&A Advocates has developed significant expertise in public procurement law and practices, assisting numerous clients in procurement processes. We provide consultancy and advice on regulatory matters and have expanded into public-private procurement agreements and contracts, including drafting and negotiating agreements, advising on legal frameworks, and reviewing commercial contracts for various works.',
        img: 'https://images.unsplash.com/photo-1450101499163-c68f865f3a3c?auto=format&fit=crop&q=80&w=1200',
        tag: 'Public Procurement',
    },
];

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
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

export default function PracticeAreas() {
    return (
        <>
            <Head title="Practice Areas" />

            {/* Hero Section */}
            <section className="relative bg-white overflow-hidden pt-24 pb-32 min-h-[60vh] flex items-center">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full text-center">
                    <motion.div
                        initial="hidden" animate="visible" variants={staggerContainer}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div
                            variants={fadeUp}
                            className="inline-flex items-center gap-3 mb-8"
                        >
                            <div className="h-px w-12 bg-[#D4AF37]"></div>
                            <span className="text-[#891920] text-sm font-bold tracking-[0.2em] uppercase">Areas of Expertise</span>
                            <div className="h-px w-12 bg-[#D4AF37]"></div>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.05] tracking-tight mb-8"
                        >
                            Our Practice <span className="italic text-[#891920]">Areas</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
                        >
                            K&A Advocates delivers strategic, results-driven counsel across a broad spectrum of legal disciplines. Each practice area is led by dedicated specialists committed to protecting your interests and advancing your objectives.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Practice Areas Grid */}
            <section className="bg-slate-50 py-32 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {practiceAreas.map((area, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-[#D4AF37]/30 flex flex-col"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <img
                                        src={area.img}
                                        alt={area.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-[#891920] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                        {area.tag}
                                    </span>
                                </div>
                                <div className="relative p-8 flex flex-col flex-grow">
                                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 group-hover:text-[#891920] transition-colors">
                                        {area.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed flex-grow mb-6">{area.desc}</p>
                                    <Link
                                        href="/enquiry"
                                        className="inline-flex items-center gap-2 text-[#891920] font-bold text-sm border-b-2 border-transparent hover:border-[#D4AF37] transition-all w-fit group-hover:gap-3"
                                    >
                                        Discuss Your Matter <span className="text-[#D4AF37]">→</span>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Why Choose Us Strip */}
            <section className="bg-white py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                            transition={{ duration: 1, ease: premiumEase }}
                        >
                            <span className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">Why K&A Advocates</span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 mb-8 leading-tight">
                                Depth of Knowledge. <br /> <span className="italic text-[#891920]">Breadth of Service.</span>
                            </h2>
                            <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                                From cross-border conveyance to complex commercial litigation, our multidisciplinary team works as one cohesive unit. We combine rigorous legal analysis with practical, commercial awareness to deliver solutions that work.
                            </p>
                            <div className="space-y-6">
                                {[
                                    'Dedicated specialists in every practice area',
                                    'Rapid response times and clear communication',
                                    'Security-first handling of sensitive matters',
                                    'A client-focused, results-driven approach',
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.6, ease: premiumEase }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#891920]/5 text-[#891920] shrink-0 ring-1 ring-[#891920]/10">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: premiumEase, delay: 0.2 }}
                            className="relative h-[550px] hidden lg:block"
                        >
                            <div className="absolute -inset-4 bg-[#D4AF37]/10 rounded-3xl -z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200"
                                alt="Law library research"
                                className="w-full h-full object-cover rounded-2xl shadow-2xl ring-1 ring-slate-200"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                                transition={{ delay: 0.8, duration: 0.8, ease: "backOut" }}
                                className="absolute -bottom-8 -right-8 bg-[#891920] text-white p-8 rounded-2xl shadow-2xl max-w-xs border-4 border-white"
                            >
                                <div className="text-4xl font-serif font-bold text-[#D4AF37] mb-1">6+</div>
                                <div className="text-xs font-bold uppercase tracking-wider">Core Practice Areas</div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA (Deep Red Anchor) */}
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
                        Not Sure Where Your Matter <br /><span className="italic text-[#D4AF37]">Fits?</span>
                    </h2>
                    <p className="text-white/70 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Tell us about your situation and our team will route your enquiry to the right advocate and practice area — quickly and confidentially.
                    </p>
                    <Link
                        href="/enquiry"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#891920] font-bold rounded-full hover:bg-white transition-all duration-300 shadow-2xl shadow-[#D4AF37]/30 text-lg"
                    >
                        Submit a Client Enquiry
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </motion.div>
            </section>
        </>
    );
}
