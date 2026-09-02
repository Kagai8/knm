import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                    variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-serif font-bold text-slate-900 mb-1">{title}</h3>
                                    <p className="text-sm text-slate-600">{message}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                                    {cancelLabel}
                                </Button>
                                <Button
                                    variant={variant === 'danger' ? 'danger' : 'primary'}
                                    onClick={onConfirm}
                                    isLoading={isLoading}
                                >
                                    {confirmLabel}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
