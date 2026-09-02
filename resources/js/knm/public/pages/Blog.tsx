import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { posts } from '@/knm/public/data/posts';

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

export default function Blog() {
    const [featured, ...rest] = posts;

    return (
        <>
            <Head title="Blog & Insights" />

            {/* Hero */}
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
                            <span className="text-[#891920] text-sm font-bold tracking-[0.2em] uppercase">Insights & Updates</span>
                            <div className="h-px w-12 bg-[#D4AF37]"></div>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.05] tracking-tight mb-8"
                        >
                            The K&A <span className="italic text-[#891920]">Journal</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
                        >
                            Practical legal insight from our advocates — plain-language guidance on conveyancing, employment, litigation, intellectual property, procurement, and the future of legal practice.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Featured Post */}
            <section className="bg-slate-50 py-32 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: premiumEase }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 hover:border-[#D4AF37]/30 transition-all duration-500"
                    >
                        <div className="relative h-96 lg:h-full overflow-hidden">
                            <motion.img
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 1.2, ease: premiumEase }}
                                src={featured.image}
                                alt={featured.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="absolute top-6 left-6 px-4 py-2 bg-[#D4AF37] text-[#891920] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg"
                            >
                                Featured
                            </motion.span>
                        </div>
                        <div className="p-10 lg:p-14">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="flex items-center gap-4 text-xs text-slate-500 uppercase tracking-wider mb-6"
                            >
                                <span className="text-[#891920] font-bold">{featured.category}</span>
                                <span>•</span>
                                <span>{featured.date}</span>
                                <span>•</span>
                                <span>{featured.readTime}</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="text-3xl lg:text-4xl font-serif font-bold text-slate-900 mb-6 leading-tight"
                            >
                                {featured.title}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="text-slate-600 text-lg leading-relaxed mb-8"
                            >
                                {featured.excerpt}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                className="flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-slate-900 font-semibold text-sm">{featured.author}</div>
                                    <div className="text-slate-500 text-xs uppercase tracking-wider">{featured.authorRole}</div>
                                </div>
                                <Link
                                    href={`/blog/${featured.slug}`}
                                    className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-[#891920] text-white text-sm font-bold rounded-full overflow-hidden transition-all duration-500 shadow-lg shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40"
                                >
                                    <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                                    <span className="relative group-hover:text-[#891920] transition-colors duration-500">Read More</span>
                                    <svg className="relative w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="bg-white py-32">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {rest.map((post) => (
                            <motion.article
                                key={post.slug}
                                variants={fadeUp}
                                className="group bg-slate-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-[#D4AF37]/30 flex flex-col"
                            >
                                <div className="h-56 overflow-hidden relative">
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-[#891920] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                        {post.category}
                                    </span>
                                </div>
                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-3 text-xs text-slate-500 uppercase tracking-wider mb-4">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-4 leading-snug group-hover:text-[#891920] transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed flex-grow mb-6">{post.excerpt}</p>
                                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-[#891920] font-bold text-sm border-b-2 border-transparent hover:border-[#D4AF37] transition-all w-fit group-hover:gap-3">
                                        Read More <span className="text-[#D4AF37]">→</span>
                                    </Link>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="bg-slate-50 py-32 border-y border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: premiumEase }}
                    className="relative max-w-4xl mx-auto px-6 text-center"
                >
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                        Stay <span className="italic text-[#891920]">Informed.</span>
                    </h2>
                    <p className="text-slate-600 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Get practical legal insights delivered to your inbox. No jargon, no spam — just clear guidance from our advocates.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="flex-grow px-6 py-4 rounded-full bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-colors shadow-sm"
                        />
                        <button type="submit" className="group relative px-8 py-4 bg-[#891920] text-white font-bold rounded-full overflow-hidden transition-all duration-500 shadow-lg shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40">
                            <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                            <span className="relative group-hover:text-[#891920] transition-colors duration-500">Subscribe</span>
                        </button>
                    </form>
                </motion.div>
            </section>
        </>
    );
}
