/* eslint-disable import/consistent-type-specifier-style */
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, error, hint, leftIcon, rightIcon, id, className = '', ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#891920]/20 focus:border-[#891920] ${
                            error
                                ? 'border-red-300 text-red-900 placeholder-red-300'
                                : 'border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400'
                        } ${leftIcon ? 'pl-10' : 'pl-3.5'} ${rightIcon ? 'pr-10' : 'pr-3.5'} py-2.5 text-sm ${className}`}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p className="text-xs text-slate-500 mt-1">{hint}</p>
                )}
            </div>
        );
    }
);

FormField.displayName = 'FormField';
