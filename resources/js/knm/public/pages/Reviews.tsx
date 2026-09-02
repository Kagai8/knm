import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const reviews = [
    {
        name: 'Grace Wanjiru',
        type: 'SME Owner',
        area: 'Employment Law',
        rating: 5,
        date: 'July 2026',
        text: 'K&A helped us restructure our employment contracts after a difficult dispute. They explained every step clearly and responded within hours. I finally feel like our business is protected.',
    },
    {
        name: 'David Omondi',
        type: 'Property Developer',
        area: 'Conveyancing & Land Law',
        rating: 5,
        date: 'June 2026',
        text: 'The due diligence they conducted before we completed on a property saved us from a fraudulent seller. Thorough, professional, and worth every shilling.',
    },
    {
        name: 'Amina Hassan',
        type: 'Individual Client',
        area: 'Civil Litigation',
        rating: 5,
        date: 'June 2026',
        text: 'I was nervous about going to court, but my advocate kept me informed at every stage. The matter was resolved faster than I expected. Highly recommended.',
    },
    {
        name: 'Peter Kariuki',
        type: 'Startup Founder',
        area: 'Commercial Law',
        rating: 5,
        date: 'May 2026',
        text: 'From company formation to our first investment round, K&A has been with us the whole way. They understand business, not just law.',
    },
    {
        name: 'Lucy Njeri',
        type: 'Creative Artist',
        area: 'Intellectual Property',
        rating: 5,
        date: 'April 2026',
        text: 'They registered my trademarks and helped me resolve a copyright dispute without going to court. The team genuinely cares about their clients.',
    },
    {
        name: 'James Mwangi',
        type: 'Corporate Client',
        area: 'Procurement Law',
        rating: 4,
        date: 'March 2026',
        text: 'Solid guidance through a complex public tender process. Their knowledge of procurement regulations is impressive. Would have appreciated slightly faster turnaround on one document, but overall excellent.',
    },
];

const Star = ({ filled }: { filled: boolean }) => (
    <svg
        className={`w-5 h-5 ${filled ? 'text-[#D4AF37]' : 'text-slate-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const StarRow = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} filled={i <= rating} />
        ))}
    </div>
);

export default function Reviews() {
    return (
        <>
            <Head title="Client Reviews" />

            {/* Hero */}
            <section className="relative bg-white overflow-hidden pt-24 pb-32 min-h-[60vh] flex items-center">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full text-center">
                    <motion.div
                        initial="hidden" animate="visible" variants={staggerContainer}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-3 mb-8">
                            <div className="h-px w-12 bg-[#D4AF37]"></div>
                            <span className="text-[#891920] text-sm font-bold tracking-[0.2em] uppercase">Client Voices</span>
                            <div className="h-px w-12 bg-[#D4AF37]"></div>
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.05] tracking-tight mb-8">
                            What Our Clients <span className="italic text-[#891920]">Say</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Our reputation is built on the trust of the clients we serve. Every matter we close ends with an invitation for honest feedback — because accountability is at the heart of how we practise.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Rating Summary */}
            <section className="bg-slate-50 py-24 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <motion.div variants={fadeUp} className="bg-white border border-slate-100 rounded-2xl p-10 text-center shadow-sm hover:shadow-2xl hover:border-[#D4AF37]/30 transition-all duration-500">
                            <div className="text-6xl font-serif font-bold text-[#891920] mb-4">4.9</div>
                            <div className="flex justify-center mb-4">
                                <StarRow rating={5} />
                            </div>
                            <p className="text-slate-500 text-sm uppercase tracking-wider font-medium">Average Rating</p>
                        </motion.div>

                        <motion.div variants={fadeUp} className="bg-white border border-slate-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-2xl hover:border-[#D4AF37]/30 transition-all duration-500">
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white border-2 border-slate-100 text-2xl font-bold mb-4 shadow-lg">
                                <span className="text-[#891920]">G</span>
                            </div>
                            <h3 className="text-slate-900 font-serif font-bold text-xl mb-2">Google Reviews</h3>
                            <p className="text-slate-500 text-sm">Verified reviews from our Google Business Profile</p>
                        </motion.div>

                        <motion.div variants={fadeUp} className="bg-white border border-slate-100 rounded-2xl p-10 text-center flex flex-col justify-center shadow-sm hover:shadow-2xl hover:border-[#D4AF37]/30 transition-all duration-500">
                            <div className="text-6xl font-serif font-bold text-[#891920] mb-4">100%</div>
                            <p className="text-slate-500 text-sm uppercase tracking-wider font-medium">of feedback reviewed by a partner</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Testimonial */}
            <section className="bg-white py-32 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                    <span className="text-[18rem] font-serif font-bold text-[#891920]">"</span>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: premiumEase }}
                    className="relative max-w-4xl mx-auto px-6 text-center"
                >
                    <div className="flex justify-center mb-8">
                        <StarRow rating={5} />
                    </div>
                    <blockquote className="text-3xl md:text-5xl font-serif text-slate-900 leading-snug mb-10 italic font-light tracking-wide">
                        "The due diligence they conducted saved us from a fraudulent seller. Thorough, professional, and worth every shilling."
                    </blockquote>
                    <div className="flex items-center justify-center gap-6">
                        <div className="h-px w-16 bg-[#D4AF37]"></div>
                        <cite className="not-italic text-[#891920] font-bold tracking-[0.3em] uppercase text-sm">David Omondi — Property Developer</cite>
                        <div className="h-px w-16 bg-[#D4AF37]"></div>
                    </div>
                </motion.div>
            </section>

            {/* Reviews Grid */}
            <section className="bg-slate-50 py-32 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.span variants={fadeUp} className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">Verified Feedback</motion.span>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">Recent Client <span className="italic text-[#891920]">Reviews</span></motion.h2>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {reviews.map((review, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                className="bg-white rounded-2xl border border-slate-100 hover:border-[#D4AF37]/30 hover:shadow-2xl transition-all duration-500 p-8 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <StarRow rating={review.rating} />
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">{review.date}</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed flex-grow mb-6 italic">"{review.text}"</p>
                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <div className="text-slate-900 font-semibold text-sm">{review.name}</div>
                                        <div className="text-slate-500 text-xs uppercase tracking-wider">{review.type}</div>
                                    </div>
                                    <span className="px-3 py-1 bg-[#891920]/5 border border-[#891920]/20 text-[#891920] text-xs font-bold rounded-full">
                                        {review.area}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How We Earn Our Reviews */}
            <section className="bg-white py-32">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.span variants={fadeUp} className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase">Our Process</motion.span>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 mb-16">
                            How We Earn Our <span className="italic text-[#891920]">Reviews</span>
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { step: '01', title: 'Matter Completed', desc: 'When your matter is closed and archived, we consider the work done — but the relationship is not.' },
                                { step: '02', title: 'Feedback Requested', desc: 'We invite you to share honest feedback on your experience, which is reviewed directly by a partner.' },
                                { step: '03', title: 'Review Shared', desc: 'Satisfied clients are invited to leave a public Google review, helping others find trusted counsel.' },
                            ].map((item, i) => (
                                <motion.div key={i} variants={fadeUp} className="bg-slate-50 rounded-2xl border border-slate-100 p-10 text-left hover:border-[#D4AF37]/30 hover:shadow-xl transition-all duration-500">
                                    <div className="text-5xl font-serif font-bold text-[#D4AF37]/40 mb-6">{item.step}</div>
                                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">{item.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#891920] py-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')]"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: premiumEase }}
                    className="relative max-w-4xl mx-auto px-6 text-center"
                >
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
                        Worked With <span className="italic text-[#D4AF37]">K&A Advocates?</span>
                    </h2>
                    <p className="text-white/70 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Your experience matters. Share a review on Google and help other clients find trusted legal counsel.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://g.page/kaadvocates/review"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#891920] font-bold rounded-full hover:bg-white transition-all duration-300 shadow-2xl shadow-[#D4AF37]/30 text-lg"
                        >
                            Leave a Google Review
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                        <Link
                            href="/enquiry"
                            className="group relative inline-flex items-center gap-3 px-10 py-5 border-2 border-white text-white font-bold rounded-full overflow-hidden transition-all duration-500 text-lg"
                        >
                            <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                            <span className="relative group-hover:text-[#891920] transition-colors duration-500">Become a Client</span>
                        </Link>
                    </div>
                </motion.div>
            </section>
        </>
    );
}
