/* eslint-disable import/consistent-type-specifier-style */
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    size?: ModalSize;
    children: ReactNode;
    footer?: ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, subtitle, size = 'md', children, footer }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop: Darker + stronger blur for focus */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            // "Frosted" entry: scales up slightly and un-blurs
                            initial={{ opacity: 0, scale: 0.96, y: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.96, y: 20, filter: 'blur(10px)' }}
                            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                            className={`bg-white rounded-2xl shadow-[0_30px_90px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5 w-full ${sizeClasses[size]} pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden`}
                        >
                            {/* Header: Subtle off-white background to ground the title */}
                            <div className="flex items-start justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/30 shrink-0">
                                <div>
                                    <h3 className="text-xl font-serif font-bold text-slate-900 tracking-tight">{title}</h3>
                                    {subtitle && <p className="text-sm text-slate-500 mt-1 font-sans">{subtitle}</p>}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all duration-200"
                                    aria-label="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Body: More padding for breathing room */}
                            <div className="px-8 py-8 overflow-y-auto flex-grow bg-white">
                                {children}
                            </div>

                            {/* Footer: Sticky at bottom with subtle blur */}
                            {footer && (
                                <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm shrink-0">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
