import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import CreateConversationModal from './CreateConversationModal';
import MessagingAdminModal from './MessagingAdminModal';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface Participant {
    id: number;
    name: string;
    is_client?: boolean;
}

interface LatestMessage {
    id: number;
    body: string;
    sender: { id: number; name: string };
    created_at: string;
    has_attachment: boolean;
    file_name: string | null;
}

interface MatterLink {
    id: number;
    title: string;
    file_number: string;
}

interface ConversationItem {
    id: number;
    title: string;
    is_group: boolean;
    matter: MatterLink | null;
    participants: Participant[];
    latest_message: LatestMessage | null;
    unread_count: number;
    updated_at: string;
}

interface Staff {
    id: number;
    name: string;
    messages_disabled: boolean;
}

interface Matter {
    id: number;
    title: string;
    file_number: string;
}

interface MessageSearchResult {
    id: number;
    conversation_id: number;
    conversation_title: string;
    sender: { id: number; name: string };
    body: string;
    file_name: string | null;
    created_at: string;
}

interface Client {
    id: number;
    name: string;
    client_id: number;
}

interface Props {
    conversations: ConversationItem[];
    staff: Staff[];
    clients: Client[];
    matters: Matter[];
}

function Highlight({ text, query }: { text: string; query: string }) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1 || !query) {
        return <>{text.length > 160 ? text.slice(0, 160) + '…' : text}</>;
    }
    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + query.length + 100);
    const before = (start > 0 ? '…' : '') + text.slice(start, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length, end) + (end < text.length ? '…' : '');

    return (
        <>
            {before}
            <mark className="bg-[#D4AF37]/40 text-slate-900 rounded px-0.5">{match}</mark>
            {after}
        </>
    );
}

const formatRelativeTime = (iso: string): string => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
    });
};

const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

export default function Index({ conversations, staff, clients, matters }: Props) {
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [adminOpen, setAdminOpen] = useState(false);
    const { can } = useAuth();
    const canAdminMessaging = can('messages.disable_user') || can('messages.manage');
    const [threads, setThreads] = useState<ConversationItem[]>(conversations);
    const [messageResults, setMessageResults] = useState<MessageSearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    // Debounced server-side message search (min 3 chars)
    useEffect(() => {
        const q = search.trim();
        if (q.length < 3) {
            setMessageResults([]);
            setSearching(false);
            return;
        }
        setSearching(true);
        const handle = setTimeout(async () => {
            try {
                const res = await fetch(`/private/conversations/search-messages?q=${encodeURIComponent(q)}`, {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessageResults(data.results ?? []);
                }
            } catch {
                // silent — keep previous results
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(handle);
    }, [search]);

    // Live inbox: refresh unread counts + previews every 10 seconds
    useEffect(() => {
        const tick = async () => {
            if (document.hidden) return;
            try {
                const res = await fetch('/private/conversations/poll', { headers: { Accept: 'application/json' } });
                if (!res.ok) return;
                const data = await res.json();
                setThreads(data.conversations ?? []);
            } catch {
                // silent — retry next tick
            }
        };
        const interval = setInterval(tick, 10000);
        return () => clearInterval(interval);
    }, []);

    const filtered = threads.filter((c) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            c.title.toLowerCase().includes(q) ||
            c.participants.some((p) => p.name.toLowerCase().includes(q)) ||
            (c.matter?.file_number ?? '').toLowerCase().includes(q) ||
            (c.latest_message?.body ?? '').toLowerCase().includes(q) ||
            (c.latest_message?.file_name ?? '').toLowerCase().includes(q)
        );
    });

    const totalUnread = threads.reduce((sum, c) => sum + c.unread_count, 0);

    return (
        <>
            <Head title="Messages · K&A Internal" />

            <div className="h-[calc(100vh-7rem)] flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* LEFT: Conversation List */}
                <div className="w-full md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-200 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-serif font-bold text-slate-900">Messages</h1>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {threads.length} conversation{threads.length === 1 ? '' : 's'}
                                    {totalUnread > 0 && (
                                        <span className="ml-2 text-[#891920] font-semibold">
                                            · {totalUnread} unread
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {canAdminMessaging && (
                                    <button
                                        onClick={() => setAdminOpen(true)}
                                        className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors shadow-sm"
                                        title="Messaging controls"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                                            />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={() => setCreateOpen(true)}
                                    className="w-9 h-9 rounded-lg bg-[#891920] hover:bg-[#6b1518] text-white flex items-center justify-center transition-colors shadow-sm"
                                    title="New conversation"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <svg
                                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/10 transition-all"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-serif font-bold text-slate-900 mb-1">
                                    {search ? 'No matches' : 'No conversations yet'}
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    {search
                                        ? 'Try a different search term.'
                                        : 'Start a conversation with a colleague.'}
                                </p>
                                {!search && (
                                    <button
                                        onClick={() => setCreateOpen(true)}
                                        className="text-xs font-bold text-[#891920] hover:underline"
                                    >
                                        Start new conversation
                                    </button>
                                )}
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {filtered.map((conv) => (
                                    <li key={conv.id}>
                                        <Link
                                            href={`/private/conversations/${conv.id}`}
                                            className={`block p-4 hover:bg-white transition-colors ${
                                                conv.unread_count > 0 ? 'bg-white' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Avatar */}
                                                {(() => {
                                                    const hasClient = conv.participants.some((p) => p.is_client);
                                                    return (
                                                        <div
                                                            className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                                                conv.is_group
                                                                    ? hasClient
                                                                        ? 'bg-[#D4AF37] text-[#891920]'
                                                                        : 'bg-[#891920] text-white'
                                                                    : hasClient
                                                                      ? 'bg-[#D4AF37] text-[#891920]'
                                                                      : 'bg-gradient-to-br from-[#891920] to-[#D4AF37] text-white'
                                                            }`}
                                                        >
                                                            {conv.is_group ? (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                                    />
                                                                </svg>
                                                            ) : (
                                                                getInitials(conv.title)
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <h3
                                                                className={`text-sm font-semibold truncate ${
                                                                    conv.unread_count > 0 ? 'text-slate-900' : 'text-slate-700'
                                                                }`}
                                                            >
                                                                {conv.title}
                                                            </h3>
                                                            {conv.participants.some((p) => p.is_client) && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#891920] text-[9px] font-bold uppercase tracking-wider rounded shrink-0">
                                                                    CLIENT
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                            {conv.latest_message
                                                                ? formatRelativeTime(conv.latest_message.created_at)
                                                                : formatRelativeTime(conv.updated_at)}
                                                        </span>
                                                    </div>

                                                    {/* Matter badge */}
                                                    {conv.matter && (
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <span className="inline-flex items-center px-1.5 py-0.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#891920] text-[9px] font-bold uppercase tracking-wider rounded">
                                                                {conv.matter.file_number}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Latest message preview */}
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {conv.latest_message ? (
                                                            <>
                                                                <span className="font-medium text-slate-600">
                                                                    {conv.latest_message.sender.name.split(' ')[0]}:
                                                                </span>{' '}
                                                                {conv.latest_message.body ? (
                                                                    conv.latest_message.body
                                                                ) : conv.latest_message.has_attachment ? (
                                                                    <span className="italic">
                                                                        📎 {conv.latest_message.file_name ?? 'Attachment'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="italic">(empty message)</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="italic">No messages yet</span>
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Unread badge */}
                                                {conv.unread_count > 0 && (
                                                    <div className="shrink-0 ml-2 w-5 h-5 rounded-full bg-[#891920] text-white text-[10px] font-bold flex items-center justify-center">
                                                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* RIGHT: message search results or empty state */}
                <div className="hidden md:flex flex-1 flex-col bg-gradient-to-br from-slate-50 to-white overflow-hidden">
                    {search.trim().length > 0 && (
                        <>
                            <div className="px-6 py-4 border-b border-slate-200 bg-white">
                                <h2 className="text-sm font-serif font-bold text-slate-900">Message results for “{search}”</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {searching
                                        ? 'Searching…'
                                        : `${messageResults.length} match${messageResults.length === 1 ? '' : 'es'}`}
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {search.trim().length < 3 ? (
                                    <p className="text-sm text-slate-400 text-center py-10">
                                        Type at least 3 characters to search messages.
                                    </p>
                                ) : !searching && messageResults.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-10">No messages match “{search}”.</p>
                                ) : (
                                    messageResults.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => router.visit(`/private/conversations/${r.conversation_id}?message=${r.id}`)}
                                            className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-[#891920]/40 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-xs font-bold text-[#891920] truncate">{r.conversation_title}</span>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                    {formatRelativeTime(r.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                <span className="font-semibold">{r.sender.name.split(' ')[0]}:</span>{' '}
                                                <Highlight
                                                    text={r.body || (r.file_name ? `📎 ${r.file_name}` : '')}
                                                    query={search.trim()}
                                                />
                                            </p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {search.trim().length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8 max-w-md">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#891920]/10 to-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Your Inbox</h2>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            Select a conversation from the list to view messages, or start a new one to collaborate with your team.
                        </p>
                        <button
                            onClick={() => setCreateOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#891920] hover:bg-[#6b1518] text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            New Conversation
                        </button>
                    </div>
                    </div>
                    )}
                </div>
            </div>

            <CreateConversationModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                staff={staff}
                clients={clients}
                matters={matters}
                currentUserId={currentUserId}
            />

            <MessagingAdminModal
                isOpen={adminOpen}
                onClose={() => setAdminOpen(false)}
                staff={staff}
                currentUserId={currentUserId}
            />
        </>
    );
}
