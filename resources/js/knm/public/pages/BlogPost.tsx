import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { posts, type BlogBlock } from '@/knm/public/data/posts';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const renderBlock = (block: BlogBlock, i: number) => {
    switch (block.type) {
        case 'heading':
            return <h2 key={i} className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mt-16 mb-6">{block.text}</h2>;
        case 'paragraph':
            return <p key={i} className="text-slate-600 text-lg leading-relaxed mb-6">{block.text}</p>;
        case 'quote':
            return (
                <blockquote key={i} className="border-l-4 border-[#D4AF37] pl-6 py-3 my-12 text-[#891920] font-serif text-xl md:text-2xl italic leading-snug bg-slate-50 p-8 rounded-r-2xl">
                    "{block.text}"
                </blockquote>
            );
        case 'list':
            return (
                <ul key={i} className="space-y-4 mb-8 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                    {block.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-4 text-slate-700 text-lg leading-relaxed">
                            <span className="w-2 h-2 bg-[#D4AF37] rounded-full mt-3 shrink-0"></span>
                            {item}
                        </li>
                    ))}
                </ul>
            );
    }
};

export default function BlogPost({ slug }: { slug: string }) {
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
        return (
            <section className="bg-white py-32 text-center">
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-6">Article not found.</h1>
                <Link href="/blog" className="text-[#891920] hover:text-[#D4AF37] transition-colors font-semibold">← Back to the Journal</Link>
            </section>
        );
    }

    const related = posts.filter((p) => p.slug !== slug).slice(0, 3);

    return (
        <>
            <Head title={post.title} />

            {/* Article Header */}
            <section className="bg-white pt-20 pb-16">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" animate="visible" variants={staggerContainer}
                    >
                        <motion.div variants={fadeUp}>
                            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#891920] transition-colors mb-10 group">
                                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to the Journal
                            </Link>
                        </motion.div>

                        <motion.div variants={fadeUp} className="flex items-center gap-4 text-xs text-slate-500 uppercase tracking-wider mb-8">
                            <span className="px-4 py-1.5 bg-[#891920]/5 border border-[#891920]/20 text-[#891920] font-bold rounded-full">
                                {post.category}
                            </span>
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-serif font-bold text-slate-900 leading-[1.1] mb-10">
                            {post.title}
                        </motion.h1>

                        <motion.div variants={fadeUp} className="flex items-center gap-4 pb-10 border-b border-slate-200">
                            <div className="w-14 h-14 rounded-full bg-[#891920] text-white flex items-center justify-center font-serif font-bold text-lg shadow-lg">
                                {post.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                                <div className="text-slate-900 font-semibold text-base">{post.author}</div>
                                <div className="text-slate-500 text-sm uppercase tracking-wider">{post.authorRole}</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Image */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: premiumEase, delay: 0.3 }}
                className="bg-white pb-20"
            >
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200">
                        <img src={post.image} alt={post.title} className="w-full h-[320px] md:h-[520px] object-cover" />
                    </div>
                </div>
            </motion.section>

            {/* Article Body */}
            <section className="bg-white pb-32">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        {post.content.map((block, i) => (
                            <motion.div key={i} variants={fadeUp}>
                                {renderBlock(block, i)}
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Divider + CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: premiumEase }}
                        className="mt-20 pt-12 border-t-2 border-slate-200 text-center"
                    >
                        <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
                            Need advice on a matter like this?
                        </h3>
                        <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                            Our advocates are ready to help. Submit an enquiry and we'll route it to the right specialist.
                        </p>
                        <Link href="/enquiry" className="group relative inline-flex items-center gap-3 px-10 py-5 bg-[#891920] text-white font-bold rounded-full overflow-hidden transition-all duration-500 shadow-xl shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40">
                            <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                            <span className="relative group-hover:text-[#891920] transition-colors duration-500">Submit a Client Enquiry</span>
                            <svg className="relative w-5 h-5 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Related Posts */}
            <section className="bg-slate-50 py-32 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <div className="flex items-end justify-between mb-12">
                            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
                                Continue <span className="italic text-[#891920]">Reading</span>
                            </motion.h2>
                            <motion.div variants={fadeUp}>
                                <Link href="/blog" className="hidden md:inline-flex items-center gap-2 text-[#891920] font-bold hover:text-[#D4AF37] transition-all hover:gap-3">
                                    View all articles <span className="text-[#D4AF37]">→</span>
                                </Link>
                            </motion.div>
                        </div>
                        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {related.map((p) => (
                                <motion.div key={p.slug} variants={fadeUp}>
                                    <Link href={`/blog/${p.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-[#D4AF37]/30 block h-full">
                                        <div className="h-52 overflow-hidden relative">
                                            <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                            <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-[#891920] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                                {p.category}
                                            </span>
                                        </div>
                                        <div className="p-8">
                                            <div className="flex items-center gap-3 text-xs text-slate-500 uppercase tracking-wider mb-4">
                                                <span>{p.date}</span>
                                                <span>•</span>
                                                <span>{p.readTime}</span>
                                            </div>
                                            <h3 className="text-xl font-serif font-bold text-slate-900 leading-snug group-hover:text-[#891920] transition-colors mb-4">
                                                {p.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{p.excerpt}</p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
