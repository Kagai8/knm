/* eslint-disable import/order */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    className?: string;
    hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
    return (
        <motion.div
            className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ${hoverable ? 'hover:border-[#D4AF37]/40 hover:shadow-md transition-all duration-300' : ''} ${className}`}
            whileHover={hoverable ? { y: -2 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {children}
        </motion.div>
    );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`px-6 py-4 border-b border-slate-100 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`px-6 py-4 border-t border-slate-100 bg-slate-50/50 ${className}`}>{children}</div>;
}
