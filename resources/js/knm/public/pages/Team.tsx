/* eslint-disable import/order */
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Kenneth from '@/assets/Kenneth.avif';
import John from '@/assets/John.avif';
import Martin from '@/assets/Martin.avif';
import Morris from '@/assets/Morris.avif';
import James from '@/assets/James.avif';
import Jennifer from '@/assets/Jennifer.avif';
import Elena from '@/assets/Elena.avif';
import Jonathan from '@/assets/Jonathan.avif';
import Beatrice from '@/assets/Beatrice.avif';

const team = [
    {
        name: `Kenneth Ndung'u Mburu`,
        role: 'Senior Advocate',
        leads: 'Team Leader & Head of Conveyancing & Financial Service Division',
        bio: 'Leads the firm\'s strategic direction, client engagement, and oversees all legal services. He is a Senior Counsel with extensive experience in conveyancing and financial services.',
        img: Kenneth,
    },
    {
        name: 'John K. Ngetich',
        role: 'Senior Advocate',
        leads: 'Head of Corporation Law & Secretarial Services Division',
        bio: 'Guides corporate clients on governance, compliance, and secretarial matters. He is a Senior Counsel with a strong background in corporate law.',
        img: John,
    },
    {
        name: 'Martin Kariuki',
        role: 'Senior Advocate',
        leads: 'Head of Litigation & Employment Law Division',
        bio: 'Represents clients in litigation and employment law matters. He is a Senior Counsel with a strong background in both areas.',
        img: Martin,
    },
    {
        name: 'Morris M. Kariuki',
        role: 'Senior Associate Advocate',
        leads: 'Head of Commercial Law Division',
        bio: 'Advises clients on commercial contracts, business transactions, and regulatory compliance. He is a Senior Associate Advocate with a focus on commercial law.',
        img: Morris,
    },
    {
        name: 'James O. Onduso',
        role: 'Senior Associate Advocate',
        leads: 'Head of Criminal Law Division',
        bio: 'Specializes in criminal defense, investigations, and legal strategy. He is a Senior Associate Advocate with extensive experience in criminal law.',
        img: James,
    },
    {
        name: 'Jeniffer W. Maina',
        role: 'Senior Legal Assistant',
        leads: 'Head of Service Delivery & Client Relations',
        bio: 'Manages client relations, service delivery, and ensures client satisfaction. She is a Senior Legal Assistant with a focus on client engagement.',
        img: Jennifer,
    },
    {
        name: 'Elena M. Njee',
        role: 'Legal Assistant',
        leads: 'Head of Litigation & Conveyancing Clerical Services',
        bio: 'Supports litigation and conveyancing processes, document preparation, and case management. She is a Legal Assistant with experience in legal clerical services.',
        img: Elena,
    },
    {
        name: 'Jonathan Ndung\'u',
        role: 'Information Technology Administrator',
        leads: 'Head of IT & Digital Practice Systems',
        bio: 'Manages the firm\'s IT infrastructure, digital systems, and cybersecurity. He is an IT Administrator with expertise in legal technology solutions.',
        img: Jonathan,
    },
    {
        name: 'Beatrice W. Maina',
        role: 'Administrative Assistant',
        leads: 'Operations & Client Experience',
        bio: 'Supports administrative operations, scheduling, and client communications. She is an Administrative Assistant with a focus on operational efficiency and client experience.',
        img: Beatrice,
    },
];

// Premium Easing
const premiumEase = [0.25, 0.1, 0.25, 1];

// Fade Up Variant
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};

// Stagger Container
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

// Slide Variants for Carousel
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.95,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
            scale: { duration: 0.4 },
        },
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.95,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
        },
    }),
};

export default function Team() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const total = team.length;
    const maxIndex = total - 1;

    // Autoplay
    useEffect(() => {
        if (isPaused) return;

        timerRef.current = setInterval(() => {
            setDirection(1);
            setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 6000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused, maxIndex]);

    const goTo = (i: number) => {
        setDirection(i > activeIndex ? 1 : -1);
        setActiveIndex(i);
    };

    const next = () => {
        setDirection(1);
        setActiveIndex(activeIndex >= maxIndex ? 0 : activeIndex + 1);
    };

    const prev = () => {
        setDirection(-1);
        setActiveIndex(activeIndex <= 0 ? maxIndex : activeIndex - 1);
    };

    const currentMember = team[activeIndex];

    return (
        <>
            <Head title="Our Team" />

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
                            <span className="text-[#891920] text-sm font-bold tracking-[0.2em] uppercase">The People</span>
                            <div className="h-px w-12 bg-[#D4AF37]"></div>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.05] tracking-tight mb-8"
                        >
                            Meet Our <span className="italic text-[#891920]">Team</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
                        >
                            Nine dedicated professionals, each leading a core function of the firm. Together, we combine deep legal expertise with a modern, digital-first approach to deliver exceptional client outcomes.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Premium Carousel */}
            <section className="bg-slate-50 py-32 border-y border-slate-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div
                        className="relative"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* Carousel Container */}
                        <div className="relative h-[600px] lg:h-[700px] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={activeIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="absolute inset-0"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                                        {/* Portrait Side */}
                                        <div className="relative h-80 lg:h-full overflow-hidden">
                                            <motion.img
                                                initial={{ scale: 1.1 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 1.2, ease: premiumEase }}
                                                src={currentMember.img}
                                                alt={currentMember.name}
                                                className="absolute inset-0 w-full h-full object-cover object-top"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/40"></div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3, duration: 0.6 }}
                                                className="absolute top-6 left-6 lg:top-8 lg:left-8"
                                            >
                                                <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-[#891920] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                                    {currentMember.role}
                                                </span>
                                            </motion.div>

                                            {/* Decorative Corner Element */}
                                            <div className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8 w-16 h-16 border-2 border-[#D4AF37]/40 rounded-full"></div>
                                        </div>

                                        {/* Content Side */}
                                        <div className="relative p-10 lg:p-16 flex flex-col justify-center bg-white">
                                            {/* Ghost Number */}
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4, duration: 0.6 }}
                                                className="absolute top-8 right-10 text-7xl lg:text-9xl font-serif font-bold text-[#891920]/5 select-none pointer-events-none"
                                            >
                                                {String(activeIndex + 1).padStart(2, '0')}
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2, duration: 0.6 }}
                                                className="relative"
                                            >
                                                <div className="inline-flex items-center gap-3 mb-6">
                                                    <div className="h-px w-8 bg-[#D4AF37]"></div>
                                                    <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em]">
                                                        {currentMember.leads || 'Team Member'}
                                                    </span>
                                                </div>

                                                <h3 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
                                                    {currentMember.name}
                                                </h3>

                                                <div className="h-1 w-16 bg-[#D4AF37] mb-6"></div>

                                                <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                                                    {currentMember.bio}
                                                </p>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            <motion.button
                                onClick={prev}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Previous"
                                className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white text-[#891920] shadow-xl hover:bg-[#D4AF37] hover:text-[#891920] transition-colors z-20 border border-slate-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </motion.button>

                            <motion.button
                                onClick={next}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Next"
                                className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white text-[#891920] shadow-xl hover:bg-[#D4AF37] hover:text-[#891920] transition-colors z-20 border border-slate-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.button>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center gap-8 mt-12">
                            <motion.div
                                key={`counter-${activeIndex}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-serif font-bold text-[#891920]"
                            >
                                {String(activeIndex + 1).padStart(2, '0')}
                            </motion.div>

                            <div className="flex justify-center gap-3">
                                {team.map((_, i) => (
                                    <motion.button
                                        key={i}
                                        onClick={() => goTo(i)}
                                        whileHover={{ scale: 1.2 }}
                                        aria-label={`Go to slide ${i + 1}`}
                                        className={`transition-all duration-300 rounded-full ${
                                            i === activeIndex
                                                ? 'w-12 h-3 bg-[#D4AF37]'
                                                : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
                                        }`}
                                    />
                                ))}
                            </div>

                            <div className="text-2xl font-serif font-bold text-slate-400">
                                {String(total).padStart(2, '0')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
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
                        Work With <span className="italic text-[#D4AF37]">Our Team</span>
                    </h2>
                    <p className="text-white/70 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Whatever your legal matter, the right advocate is ready to help. Submit an enquiry and we'll route it to the appropriate specialist.
                    </p>
                    <Link
                        href="/enquiry"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#891920] font-bold rounded-full hover:bg-white transition-all duration-300 shadow-2xl shadow-[#D4AF37]/30 text-lg"
                    >
                        Submit a Client Enquiry
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </motion.div>
            </section>
        </>
    );
}
