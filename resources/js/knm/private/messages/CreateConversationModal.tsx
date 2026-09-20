import { useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Staff {
    id: number;
    name: string;
}

interface Client {
    id: number;
    name: string;
    client_id: number;
}

interface Matter {
    id: number;
    title: string;
    file_number: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    staff: Staff[];
    clients: Client[];
    matters: Matter[];
    currentUserId: number;
}

export default function CreateConversationModal({ isOpen, onClose, staff, clients, matters, currentUserId }: Props) {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'staff' | 'clients'>('staff');

    const form = useForm({
        participant_ids: [] as number[],
        title: '',
        matter_id: '',
    });

    const filteredStaff = staff.filter((s) =>
        s.id !== currentUserId && s.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredClients = clients.filter((c) =>
        c.id !== currentUserId && c.name.toLowerCase().includes(search.toLowerCase())
    );

    const hasClientParticipant = form.data.participant_ids.some((id) =>
        clients.some((c) => c.id === id)
    );

    const toggleParticipant = (id: number) => {
        const current = form.data.participant_ids;
        if (current.includes(id)) {
            form.setData('participant_ids', current.filter((p) => p !== id));
        } else {
            form.setData('participant_ids', [...current, id]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/private/conversations', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setSearch('');
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-serif font-bold text-slate-900">New Conversation</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Participant Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Participants <span className="text-red-500">*</span>
                            </label>

                            {/* Tab switcher */}
                            <div className="flex items-center gap-1 mb-3 p-1 bg-slate-100 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('staff')}
                                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-colors ${
                                        activeTab === 'staff'
                                            ? 'bg-white text-[#891920] shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Staff ({staff.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('clients')}
                                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-colors ${
                                        activeTab === 'clients'
                                            ? 'bg-white text-[#891920] shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Clients ({clients.length})
                                </button>
                            </div>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={`Search ${activeTab}...`}
                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/10 transition-all mb-3"
                            />

                            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                                {activeTab === 'staff' ? (
                                    filteredStaff.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-500">No staff found</div>
                                    ) : (
                                        filteredStaff.map((person) => (
                                            <label
                                                key={person.id}
                                                className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.participant_ids.includes(person.id)}
                                                    onChange={() => toggleParticipant(person.id)}
                                                    className="w-4 h-4 text-[#891920] border-slate-300 rounded focus:ring-[#891920]"
                                                />
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">{person.name}</span>
                                            </label>
                                        ))
                                    )
                                ) : (
                                    filteredClients.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-500">No clients found</div>
                                    ) : (
                                        filteredClients.map((client) => (
                                            <label
                                                key={client.id}
                                                className="flex items-center gap-3 p-3 hover:bg-[#D4AF37]/5 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.participant_ids.includes(client.id)}
                                                    onChange={() => toggleParticipant(client.id)}
                                                    className="w-4 h-4 text-[#891920] border-slate-300 rounded focus:ring-[#891920]"
                                                />
                                                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#891920]">
                                                    {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-slate-900">{client.name}</div>
                                                    <div className="text-[10px] text-slate-500">Client</div>
                                                </div>
                                                <span className="px-2 py-0.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#891920] text-[9px] font-bold uppercase tracking-wider rounded">
                                                    CLIENT
                                                </span>
                                            </label>
                                        ))
                                    )
                                )}
                            </div>

                            {form.errors.participant_ids && (
                                <p className="mt-2 text-xs text-red-600">{form.errors.participant_ids}</p>
                            )}
                            {form.data.participant_ids.length > 0 && (
                                <p className="mt-2 text-xs text-slate-500">
                                    {form.data.participant_ids.length} participant{form.data.participant_ids.length === 1 ? '' : 's'} selected
                                    {hasClientParticipant && (
                                        <span className="ml-2 text-[#891920] font-semibold">(includes client)</span>
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Matter Link (REQUIRED when client participant exists) */}
                        {hasClientParticipant && matters.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Link to Matter <span className="text-red-500">*</span>
                                    <span className="ml-2 text-xs text-slate-500 font-normal">(required for client threads)</span>
                                </label>
                                <select
                                    value={form.data.matter_id}
                                    onChange={(e) => form.setData('matter_id', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/10 transition-all"
                                >
                                    <option value="">Select a matter...</option>
                                    {matters.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.file_number} — {m.title}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.matter_id && (
                                    <p className="mt-2 text-xs text-red-600">{form.errors.matter_id}</p>
                                )}
                                {!form.data.matter_id && (
                                    <p className="mt-2 text-xs text-red-600 font-semibold">
                                        A matter is required when messaging clients.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Title (optional for group threads) */}
                        {form.data.participant_ids.length > 1 && !hasClientParticipant && (
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Group Title <span className="text-slate-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="e.g., Kamau v KCB defence team"
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/10 transition-all"
                                />
                                {form.errors.title && (
                                    <p className="mt-2 text-xs text-red-600">{form.errors.title}</p>
                                )}
                            </div>
                        )}

                        {/* Matter Link (optional for staff-only threads) */}
                        {!hasClientParticipant && matters.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Link to Matter <span className="text-slate-400 font-normal">(optional)</span>
                                </label>
                                <select
                                    value={form.data.matter_id}
                                    onChange={(e) => form.setData('matter_id', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/10 transition-all"
                                >
                                    <option value="">No matter link</option>
                                    {matters.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.file_number} — {m.title}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.matter_id && (
                                    <p className="mt-2 text-xs text-red-600">{form.errors.matter_id}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={form.processing}
                            className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing || form.data.participant_ids.length === 0 || (hasClientParticipant && !form.data.matter_id)}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-[#891920] hover:bg-[#6b1518] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {form.processing ? 'Creating...' : 'Start Conversation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
