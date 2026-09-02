import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const practiceAreas = [
    'Conveyancing & Land Law',
    'Employment Law',
    'Commercial Law',
    'Civil & Criminal Litigation',
    'Intellectual Property Law',
    'Procurement Law',
    'Other / Not Sure',
];

const inputClass =
    'w-full px-5 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-colors shadow-sm';

export default function Contact() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        area: '',
        method: 'Phone',
        message: '',
        consent: false,
    });

    const update = (key: string, value: string | boolean) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: replace with router.post('/enquiries', form) once backend is wired
        setSubmitted(true);
    };

    return (
        <>
            <Head title="Contact Us" />

            {/* Hero */}
            <section className="relative bg-white overflow-hidden pt-24 pb-32 min-h-[60vh] flex items-center">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full text-center">
                    <motion.div
                        initial="hidden" animate="visible" variants={staggerContainer}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-3 mb-8">
                            <div className="h-px w-12 bg-[#D4AF37]"></div>
                            <span className="text-[#891920] text-sm font-bold tracking-[0.2em] uppercase">Get In Touch</span>
                            <div className="h-px w-12 bg-[#D4AF37]"></div>
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.05] tracking-tight mb-8">
                            Contact <span className="italic text-[#891920]">K&A Advocates</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Whether you need urgent legal counsel or simply want to understand your options, our team is ready to listen. Every enquiry is captured, triaged, and answered promptly.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="bg-slate-50 py-24 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {[
                            {
                                title: 'Visit Us',
                                lines: ['K&A Advocates', 'Nairobi, Kenya'],
                                icon: 'M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z',
                            },
                            {
                                title: 'Call Us',
                                lines: ['+254 700 000 000', 'Mon – Fri'],
                                icon: 'M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z',
                            },
                            {
                                title: 'Email Us',
                                lines: ['info@kaadvocates.co.ke', 'We reply within 24 hours'],
                                icon: 'M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z',
                            },
                            {
                                title: 'Office Hours',
                                lines: ['Mon – Fri: 8:00 – 17:00', 'Sat: 9:00 – 13:00'],
                                icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z',
                            },
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                className="bg-white border border-slate-100 hover:border-[#D4AF37]/30 rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl group"
                            >
                                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#891920]/5 text-[#891920] mb-5 group-hover:bg-[#D4AF37] group-hover:text-[#891920] transition-colors duration-500 ring-1 ring-[#891920]/10 group-hover:ring-[#D4AF37]">
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d={card.icon} clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-slate-900 font-serif font-bold text-xl mb-3 group-hover:text-[#891920] transition-colors">{card.title}</h3>
                                {card.lines.map((line, j) => (
                                    <p key={j} className={`text-sm ${j === 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{line}</p>
                                ))}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Form + Journey Split */}
            <section id="enquiry-form" className="bg-white py-32 scroll-mt-32">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        {/* Left: Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: premiumEase }}
                        >
                            <span className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">Send an Enquiry</span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 mb-10 leading-tight">
                                Tell Us About Your <span className="italic text-[#891920]">Matter</span>
                            </h2>

                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, ease: premiumEase }}
                                    className="bg-slate-50 border-2 border-[#D4AF37]/30 rounded-3xl p-12 text-center"
                                >
                                    <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-[#D4AF37] text-[#891920] mb-6 shadow-lg">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Thank you, {form.name || 'Client'}.</h3>
                                    <p className="text-slate-600 text-lg leading-relaxed">
                                        Your enquiry has been received. It is now in our intake system and will be triaged to the right advocate. Expect a response within one business day.
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm text-slate-700 font-semibold mb-2">Full Name *</label>
                                            <input required type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Jane Doe" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-700 font-semibold mb-2">Phone Number *</label>
                                            <input required type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+254 7XX XXX XXX" className={inputClass} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-700 font-semibold mb-2">Email Address *</label>
                                        <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="jane@example.com" className={inputClass} />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-700 font-semibold mb-2">Practice Area *</label>
                                        <select required value={form.area} onChange={(e) => update('area', e.target.value)} className={inputClass}>
                                            <option value="" disabled>Select a practice area</option>
                                            {practiceAreas.map((area) => (
                                                <option key={area} value={area}>{area}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-700 font-semibold mb-3">Preferred Contact Method</label>
                                        <div className="flex gap-3">
                                            {['Phone', 'Email', 'Either'].map((m) => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => update('method', m)}
                                                    className={`px-6 py-3 rounded-full text-sm font-bold border-2 transition-all ${
                                                        form.method === m
                                                            ? 'bg-[#D4AF37] text-[#891920] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/30'
                                                            : 'border-slate-200 text-slate-600 hover:border-[#D4AF37] hover:text-[#891920]'
                                                    }`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-700 font-semibold mb-2">Brief Description of Your Matter *</label>
                                        <textarea required rows={5} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Please give us a short overview of your matter..." className={inputClass}></textarea>
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input type="checkbox" required checked={form.consent} onChange={(e) => update('consent', e.target.checked)} className="mt-1 w-5 h-5 accent-[#D4AF37] rounded" />
                                        <span className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                                            I consent to K&A Advocates contacting me about this enquiry. All information is treated with strict confidentiality.
                                        </span>
                                    </label>

                                    <button type="submit" className="group relative w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#891920] text-white font-bold rounded-full overflow-hidden transition-all duration-500 shadow-xl shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40">
                                        <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                                        <span className="relative group-hover:text-[#891920] transition-colors duration-500">Submit Enquiry</span>
                                        <svg className="relative w-5 h-5 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </button>
                                </form>
                            )}
                        </motion.div>

                        {/* Right: What Happens Next */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: premiumEase }}
                            className="lg:sticky lg:top-32"
                        >
                            <span className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">Our Process</span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 mb-10 leading-tight">
                                What Happens <span className="italic text-[#891920]">Next?</span>
                            </h2>

                            <div className="space-y-8 mb-12">
                                {[
                                    { step: '01', title: 'Your Enquiry is Captured', desc: 'Your message lands directly in our client database — nothing is lost in an inbox.' },
                                    { step: '02', title: 'AI-Assisted Triage', desc: 'We draft a matter summary and identify the right practice area as your enquiry arrives.' },
                                    { step: '03', title: 'An Advocate is Assigned', desc: 'Your matter is routed to the advocate best suited to your needs.' },
                                    { step: '04', title: 'A Timely Response', desc: 'You receive a professional response within one business day.' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.6, ease: premiumEase }}
                                        className="flex gap-6"
                                    >
                                        <div className="text-4xl font-serif font-bold text-[#D4AF37]/40 shrink-0 w-12">{item.step}</div>
                                        <div>
                                            <h3 className="text-slate-900 font-serif font-bold text-xl mb-2">{item.title}</h3>
                                            <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.6, ease: premiumEase }}
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-all duration-500"
                            >
                                <h4 className="text-[#891920] font-serif font-bold text-xl mb-3">Already a client?</h4>
                                <p className="text-slate-600 text-sm leading-relaxed mb-5">
                                    Access your matter status, upload documents, and message your advocate directly through the secure client portal.
                                </p>
                                <a href="/login" className="inline-flex items-center gap-2 text-[#891920] font-bold text-sm hover:text-[#D4AF37] transition-all hover:gap-3">
                                    Login to Client Portal <span className="text-[#D4AF37]">→</span>
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Map */}
            <section className="bg-slate-50 py-32 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={staggerContainer}
                        className="text-center mb-12"
                    >
                        <motion.span variants={fadeUp} className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">Find Us</motion.span>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">Our <span className="italic text-[#891920]">Location</span></motion.h2>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: premiumEase }}
                        className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200"
                    >
                        <iframe
                            title="K&A Advocates Office Location"
                            src="https://www.google.com/maps?q=Nairobi,+Kenya&output=embed"
                            className="w-full h-[480px] border-0 grayscale-[20%]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
