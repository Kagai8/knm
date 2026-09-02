/* eslint-disable import/order */
/* eslint-disable import/consistent-type-specifier-style */
import { motion } from 'framer-motion';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    href?: string;
}

const variantClasses: Record<Variant, string> = {
    primary: 'bg-[#891920] text-white hover:bg-[#6b1319] shadow-sm shadow-[#891920]/20',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    gold: 'bg-[#D4AF37] text-[#891920] hover:bg-[#c2a032] shadow-sm shadow-[#D4AF37]/20 font-semibold',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, href, className = '', ...props }, ref) => {
        const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#891920]/50 disabled:opacity-50 disabled:cursor-not-allowed';
        const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

        if (href && !props.disabled) {
            return (
                <Link href={href} className={classes}>
                    {leftIcon && !isLoading && leftIcon}
                    {isLoading ? <Spinner /> : children}
                    {rightIcon && !isLoading && rightIcon}
                </Link>
            );
        }

        return (
            <motion.button
                ref={ref}
                className={classes}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                disabled={isLoading || props.disabled}
                {...(props as any)}
            >
                {leftIcon && !isLoading && leftIcon}
                {isLoading ? <Spinner /> : children}
                {rightIcon && !isLoading && rightIcon}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

const Spinner = () => (
    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
