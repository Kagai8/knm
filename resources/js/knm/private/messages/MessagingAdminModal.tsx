import { router } from '@inertiajs/react';

interface StaffMember {
    id: number;
    name: string;
    messages_disabled: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    staff: StaffMember[];
    currentUserId: number;
}

export default function MessagingAdminModal({ isOpen, onClose, staff, currentUserId }: Props) {
    if (!isOpen) return null;

    const toggle = (member: StaffMember) => {
        router.post(
            `/private/users/${member.id}/messaging`,
            { disabled: !member.messages_disabled },
            { preserveScroll: true }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-slate-900">Messaging Controls</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Block or restore messaging access per staff member.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {staff
                        .filter((s) => s.id !== currentUserId)
                        .map((member) => (
                            <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                                    {member.messages_disabled ? (
                                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                                            Blocked
                                        </span>
                                    ) : (
                                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => toggle(member)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                        member.messages_disabled
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                    }`}
                                >
                                    {member.messages_disabled ? 'Unblock' : 'Block'}
                                </button>
                            </div>
                        ))}
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
