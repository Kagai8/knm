import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * K&A Advocates Toast System
 * Wraps Sonner with brand-consistent styling and premium animations.
 */
export const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            position="top-right"
            duration={4000}
            visibleToasts={4}
            closeButton
            richColors={false}
            className="knm-toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        'group toast knm-toast ' +
                        'group-[.toaster]:bg-[#160407] ' +
                        'group-[.toaster]:text-white ' +
                        'group-[.toaster]:border-[#D4AF37]/25 ' +
                        'group-[.toaster]:shadow-2xl ' +
                        'group-[.toaster]:shadow-black/40 ' +
                        'group-[.toaster]:backdrop-blur-xl ' +
                        'font-sans',
                    title: 'group-[.toast]:text-white group-[.toast]:font-semibold group-[.toast]:text-[14px] group-[.toast]:tracking-tight',
                    description: 'group-[.toast]:text-white/60 group-[.toast]:text-[13px] group-[.toast]:mt-0.5',
                    actionButton: 'group-[.toast]:bg-[#D4AF37] group-[.toast]:text-[#891920] group-[.toast]:font-semibold',
                    cancelButton: 'group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:hover:bg-white/20',
                    closeButton:
                        'group-[.toast]:bg-white/5 ' +
                        'group-[.toast]:text-white/60 ' +
                        'group-[.toast]:border-white/10 ' +
                        'group-[.toast]:hover:bg-white/10 ' +
                        'group-[.toast]:hover:text-white',
                    success:
                        'group-[.toast]:bg-[#160407] ' +
                        'group-[.toast]:text-white ' +
                        'group-[.toast]:border-[#D4AF37]/40 ' +
                        '[&_[data-icon]]:text-[#D4AF37]',
                    error:
                        'group-[.toast]:bg-[#160407] ' +
                        'group-[.toast]:text-white ' +
                        'group-[.toast]:border-red-500/40 ' +
                        '[&_[data-icon]]:text-red-400',
                    info:
                        'group-[.toast]:bg-[#160407] ' +
                        'group-[.toast]:text-white ' +
                        'group-[.toast]:border-[#D4AF37]/25 ' +
                        '[&_[data-icon]]:text-[#D4AF37]',
                    warning:
                        'group-[.toast]:bg-[#160407] ' +
                        'group-[.toast]:text-white ' +
                        'group-[.toast]:border-amber-500/40 ' +
                        '[&_[data-icon]]:text-amber-400',
                },
            }}
            {...props}
        />
    );
};

/**
 * Hook for triggering toasts from any component.
 * Usage: const { toast } = useToast();
 */
export const useToast = () => {
    return {
        success: (title: string, options?: Parameters<typeof toast.success>[1]) => {
            return toast.success(title, options);
        },
        error: (title: string, options?: Parameters<typeof toast.error>[1]) => {
            return toast.error(title, options);
        },
        info: (title: string, options?: Parameters<typeof toast.info>[1]) => {
            return toast.info(title, options);
        },
        warning: (title: string, options?: Parameters<typeof toast.warning>[1]) => {
            return toast.warning(title, options);
        },
        dismiss: (toastId?: string | number) => {
            return toast.dismiss(toastId);
        },
    };
};

// Re-export the raw toast function for advanced use cases
export { toast };
