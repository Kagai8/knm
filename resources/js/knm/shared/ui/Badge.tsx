import type { ReactNode } from 'react';

type Color = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';

interface BadgeProps {
    color?: Color;
    children: ReactNode;
    dot?: boolean;
    className?: string;
}

const colorClasses: Record<Color, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    gold: 'bg-[#D4AF37]/10 text-[#891920] border-[#D4AF37]/30',
};

const dotColors: Record<Color, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-400',
    gold: 'bg-[#D4AF37]',
};

export function Badge({ color = 'neutral', children, dot = false, className = '' }: BadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]} ${className}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`} />}
            {children}
        </span>
    );
}
