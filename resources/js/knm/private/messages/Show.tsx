import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';
import AttachmentPicker, { formatBytes } from './AttachmentPicker';

const csrfToken = () =>
    decodeURIComponent(
        document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? ''
    );

interface Person {
    id: number;
    name: string;
    is_client?: boolean;
    muted_until?: string | null;
}

interface FileAttachment {
    url: string;
    name: string;
    size: string;
    type: string;
}

interface ParentPreview {
    id: number;
    body: string;
    sender: Person;
}

interface ReadReceipt {
    id: number;
    name: string;
    read_at: string;
}

interface MessageItem {
    id: number;
    body: string;
    sender: Person;
    is_mine: boolean;
    created_at: string;
    file: FileAttachment | null;
    parent: ParentPreview | null;
    read_by: ReadReceipt[];
}

interface ConversationData {
    id: number;
    title: string;
    is_group: boolean;
    matter: { id: number; title: string; file_number: string } | null;
    participants: Person[];
}

interface Props {
    conversation: ConversationData;
    messages: MessageItem[];
    can_send: boolean;
    send_blocked_reason: string | null;
}

const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const dayLabel = (iso: string): string => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, yesterday)) return 'Yesterday';
    return d.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const timeLabel = (iso: string): string =>
    new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

const getInitials = (name: string): string =>
    name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export default function Show({ conversation, messages, can_send, send_blocked_reason }: Props) {
    const { auth } = usePage().props as any;
    const currentUserId: number = auth?.user?.id;
    const { can } = useAuth();
    const canModerateUI = can('messages.moderate') || can('messages.manage');

    const [replyTo, setReplyTo] = useState<MessageItem | null>(null);
    const [thread, setThread] = useState<MessageItem[]>(messages);
    const threadRef = useRef<MessageItem[]>(messages);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [attachOpen, setAttachOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState<{ id: number; name: string }[]>([]);
    const [highlightId, setHighlightId] = useState<number | null>(null);
    const [adminOpen, setAdminOpen] = useState(false);
    const [muteDurations, setMuteDurations] = useState<Record<number, number>>({});
    const targetMessageId = new URLSearchParams(window.location.search).get('message');
    const [progress, setProgress] = useState<number | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const form = useForm({
        conversation_id: String(conversation.id),
        body: '',
        parent_id: null as string | null,
        file: null as File | null,
    });

    // Resync thread when server props change (navigation / manual reload)
    useEffect(() => {
        setThread(messages);
    }, [messages]);

    // Deep-link (?message=ID): scroll to the message and flash a gold ring
    useEffect(() => {
        if (!targetMessageId) return;
        const timer = setTimeout(() => {
            const el = document.getElementById('msg-' + targetMessageId);
            if (el) {
                el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                setHighlightId(Number(targetMessageId));
                setTimeout(() => setHighlightId(null), 2500);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [targetMessageId]);

    // Keep ref mirror fresh for the poller
    useEffect(() => {
        threadRef.current = thread;
    }, [thread]);

    // Auto-scroll to newest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread.length]);

    const othersCount = conversation.participants.length;

    const sendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();

        const body = form.data.body.trim();
        if (!body && !selectedFile) return;
        if (sending) return;

        setSending(true);

        const payload = new FormData();
        payload.append('conversation_id', String(conversation.id));
        payload.append('body', body);
        if (form.data.parent_id) payload.append('parent_id', form.data.parent_id);
        if (selectedFile) payload.append('file', selectedFile);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/private/messages');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken());
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
            setSending(false);
            setProgress(null);

            if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText);
                setThread((prev) => [...prev, data.message]);
                form.setData({ body: '', parent_id: null, file: null });
                setSelectedFile(null);
                setAttachOpen(false);
                setReplyTo(null);
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            } else {
                let description = 'Could not send the message.';
                try {
                    const err = JSON.parse(xhr.responseText);
                    description = Object.values(err.errors ?? {}).flat().join(' ') || description;
                } catch {
                    /* keep default */
                }
                toast.error('Message not sent', { description });
            }
        };
        xhr.onerror = () => {
            setSending(false);
            setProgress(null);
            toast.error('Network error', { description: 'Could not reach the server.' });
        };
        xhr.send(payload);
    };

    const startReply = (msg: MessageItem) => {
        setReplyTo(msg);
        form.setData('parent_id', String(msg.id));
    };

    const cancelReply = () => {
        setReplyTo(null);
        form.setData('parent_id', null);
    };

    const setMute = (userId: number, minutes: number) => {
        router.post(
            `/private/conversations/${conversation.id}/mute`,
            { user_id: userId, minutes },
            { preserveScroll: true }
        );
        setAdminOpen(false);
    };

    const readByOthers = (msg: MessageItem) =>
        msg.read_by.filter((r) => r.id !== currentUserId).length;

    // Live updates: poll for new messages every 5 seconds (paused when tab hidden)
    useEffect(() => {
        const csrf = () =>
            decodeURIComponent(
                document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? ''
            );

        const tick = async () => {
            if (document.hidden) return;

            const current = threadRef.current;
            const lastId = current.length ? Math.max(...current.map((m) => m.id)) : 0;

            try {
                const res = await fetch(`/private/conversations/${conversation.id}/poll?after=${lastId}`, {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) return;
                const data = await res.json();

                if (data.messages?.length) {
                    const container = scrollRef.current;
                    const nearBottom = container
                        ? container.scrollHeight - container.scrollTop - container.clientHeight < 120
                        : true;

                    setThread((prev) => [...prev, ...data.messages]);

                    if (nearBottom) {
                        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                    }

                    // Auto-mark incoming messages as read (we're looking at them)
                    const incoming = data.messages
                        .filter((m: MessageItem) => !m.is_mine)
                        .map((m: MessageItem) => m.id);

                    if (incoming.length) {
                        fetch(`/private/conversations/${conversation.id}/read`, {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrf(),
                            },
                            body: JSON.stringify({ message_ids: incoming }),
                        }).catch(() => undefined);
                    }
                }

                // Refresh read receipts on my own messages (live double-checks)
                if (data.receipts?.length) {
                    setThread((prev) =>
                        prev.map((m) => {
                            const r = data.receipts.find((x: { id: number }) => x.id === m.id);
                            return r ? { ...m, read_by: (r as { read_by: ReadReceipt[] }).read_by } : m;
                        })
                    );
                }
            } catch {
                // silent — retry next tick
            }
        };

        const interval = setInterval(tick, 5000);
        return () => clearInterval(interval);
    }, [conversation.id]);

    // Typing indicator: heartbeat while composing + poll others every 2.5s
    const lastTypingPing = useRef(0);

    const pingTyping = () => {
        const now = Date.now();
        if (now - lastTypingPing.current < 2000) return;
        lastTypingPing.current = now;

        fetch(`/private/conversations/${conversation.id}/typing`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
        }).catch(() => undefined);
    };

    useEffect(() => {
        const tick = async () => {
            if (document.hidden) return;
            try {
                const res = await fetch(`/private/conversations/${conversation.id}/typing`, {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) return;
                const data = await res.json();
                setTypingUsers(data.typing ?? []);
            } catch {
                // silent — retry next tick
            }
        };
        const interval = setInterval(tick, 2500);
        return () => clearInterval(interval);
    }, [conversation.id]);

    return (
        <>
            <Head title={`${conversation.title} · Messages`} />

            <div className="h-[calc(100vh-7rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 bg-white">
                    <Link
                        href="/private/conversations"
                        className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
                        title="Back to inbox"
                    >
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>

                    {(() => {
                        const hasClient = conversation.participants.some((p) => p.is_client);
                        return (
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                    conversation.is_group
                                        ? hasClient
                                            ? 'bg-[#D4AF37] text-[#891920]'
                                            : 'bg-[#891920] text-white'
                                        : hasClient
                                          ? 'bg-[#D4AF37] text-[#891920]'
                                          : 'bg-gradient-to-br from-[#891920] to-[#D4AF37] text-white'
                                }`}
                            >
                                {conversation.is_group ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                ) : (
                                    getInitials(conversation.title)
                                )}
                            </div>
                        );
                    })()}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg font-serif font-bold text-slate-900 truncate">{conversation.title}</h1>
                            {conversation.matter && (
                                <Link
                                    href={`/private/matters/${conversation.matter.id}`}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                                        conversation.participants.some((p) => p.is_client)
                                            ? 'bg-[#D4AF37] text-[#891920] hover:bg-[#c5a032] shadow-sm'
                                            : 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#891920] hover:bg-[#D4AF37]/20'
                                    }`}
                                    title={`View matter ${conversation.matter.file_number}`}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                        />
                                    </svg>
                                    {conversation.matter.file_number}
                                </Link>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                            {conversation.is_group ? (
                                <>
                                    {conversation.participants.length + 1} participants ·{' '}
                                    {conversation.participants.map((p, idx) => (
                                        <span key={p.id}>
                                            {idx > 0 && ', '}
                                            {p.name.split(' ')[0]}
                                            {p.is_client && (
                                                <span className="ml-1 inline-flex px-1 py-0 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#891920] text-[8px] font-bold uppercase tracking-wider rounded align-middle">
                                                    CLIENT
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                    , You
                                </>
                            ) : (
                                <>
                                    {conversation.participants.map((p) => p.name).join(', ')}
                                    {conversation.participants.some((p) => p.is_client) && (
                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#891920] text-[9px] font-bold uppercase tracking-wider rounded">
                                            CLIENT
                                        </span>
                                    )}
                                </>
                            )}
                        </p>
                    </div>

                    {/* Conversation options: mute participants / export */}
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setAdminOpen(!adminOpen)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                adminOpen ? 'bg-[#891920]/10 text-[#891920]' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                            title="Conversation options"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                                />
                            </svg>
                        </button>

                        {adminOpen && (
                            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-30 overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Participants</p>
                                </div>

                                <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                                    {conversation.participants.map((p) => (
                                        <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                                                {p.muted_until && (
                                                    <p className="text-[10px] text-red-600 font-semibold">
                                                        Muted until{' '}
                                                        {new Date(p.muted_until).toLocaleString('en-KE', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                            {canModerateUI &&
                                                (p.muted_until ? (
                                                    <button
                                                        onClick={() => setMute(p.id, 0)}
                                                        className="text-[10px] font-bold px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                                                    >
                                                        UNMUTE
                                                    </button>
                                                ) : (
                                                    <>
                                                        <select
                                                            value={muteDurations[p.id] ?? 60}
                                                            onChange={(e) =>
                                                                setMuteDurations({ ...muteDurations, [p.id]: Number(e.target.value) })
                                                            }
                                                            className="text-[10px] border border-slate-200 rounded px-1 py-1 bg-white"
                                                        >
                                                            <option value={60}>1h</option>
                                                            <option value={480}>8h</option>
                                                            <option value={1440}>24h</option>
                                                            <option value={10080}>7d</option>
                                                        </select>
                                                        <button
                                                            onClick={() => setMute(p.id, muteDurations[p.id] ?? 60)}
                                                            className="text-[10px] font-bold px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                                                        >
                                                            MUTE
                                                        </button>
                                                    </>
                                                ))}
                                        </div>
                                    ))}
                                </div>

                                <div className="p-2 border-t border-slate-100">
                                    <a
                                        href={`/private/conversations/${conversation.id}/export`}
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                            />
                                        </svg>
                                        Export conversation (.txt)
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/50">
                    {thread.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-sm font-serif font-bold text-slate-900 mb-1">No messages yet</h3>
                            <p className="text-xs text-slate-500">Send the first message to start the conversation.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {thread.map((msg, idx) => {
                                const prev = thread[idx - 1];
                                const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(msg.created_at);

                                return (
                                    <div key={msg.id} id={`msg-${msg.id}`}>
                                        {newDay && (
                                            <div className="flex items-center gap-4 my-6">
                                                <div className="flex-1 h-px bg-slate-200" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    {dayLabel(msg.created_at)}
                                                </span>
                                                <div className="flex-1 h-px bg-slate-200" />
                                            </div>
                                        )}

                                        <div
                                            className={`group flex items-end gap-2 mb-2 rounded-2xl transition-shadow ${
                                                msg.is_mine ? 'justify-end' : 'justify-start'
                                            } ${highlightId === msg.id ? 'ring-2 ring-[#D4AF37] ring-offset-2' : ''}`}
                                        >
                                            {/* Reply action (others' messages) */}
                                            {!msg.is_mine && can_send && (
                                                <button
                                                    onClick={() => startReply(msg)}
                                                    title="Reply"
                                                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-all shrink-0"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                    </svg>
                                                </button>
                                            )}

                                            <div className={`max-w-[70%] ${msg.is_mine ? 'items-end' : 'items-start'} flex flex-col`}>
                                                {/* Sender name in groups */}
                                                {!msg.is_mine && conversation.is_group && (
                                                    <span className="text-[10px] font-bold text-[#891920] mb-1 ml-1">
                                                        {msg.sender.name}
                                                    </span>
                                                )}

                                                <div
                                                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                                                        msg.is_mine
                                                            ? 'bg-[#891920] text-white rounded-br-md'
                                                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md'
                                                    }`}
                                                >
                                                    {/* Reply quote */}
                                                    {msg.parent && (
                                                        <div
                                                            className={`border-l-2 pl-2 mb-2 text-[11px] leading-snug ${
                                                                msg.is_mine ? 'border-[#D4AF37] text-white/60' : 'border-[#891920] text-slate-500'
                                                            }`}
                                                        >
                                                            <span className="font-bold">{msg.parent.sender.name.split(' ')[0]}:</span>{' '}
                                                            {msg.parent.body.length > 80 ? msg.parent.body.slice(0, 80) + '…' : msg.parent.body}
                                                        </div>
                                                    )}

                                                    {/* Attachment */}
                                                    {msg.file && (
                                                        <a
                                                            href={msg.file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-2 transition-colors ${
                                                                msg.is_mine
                                                                    ? 'bg-white/10 hover:bg-white/20'
                                                                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={1.5}
                                                                    d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                                                                />
                                                            </svg>
                                                            <div className="min-w-0">
                                                                <div className="text-xs font-semibold truncate">{msg.file.name}</div>
                                                                <div className={`text-[10px] ${msg.is_mine ? 'text-white/60' : 'text-slate-500'}`}>
                                                                    {msg.file.size}
                                                                </div>
                                                            </div>
                                                        </a>
                                                    )}

                                                    {/* Body */}
                                                    {msg.body && (
                                                        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.body}</div>
                                                    )}
                                                </div>

                                                {/* Meta: time + read receipts */}
                                                <div
                                                    className={`flex items-center gap-1 mt-1 ${msg.is_mine ? 'justify-end mr-1' : 'ml-1'}`}
                                                >
                                                    <span className="text-[10px] text-slate-400">{timeLabel(msg.created_at)}</span>
                                                    {msg.is_mine && othersCount > 0 && (
                                                        <span
                                                            title={
                                                                readByOthers(msg) > 0
                                                                    ? 'Read by ' +
                                                                      msg.read_by
                                                                          .filter((r) => r.id !== currentUserId)
                                                                          .map(
                                                                              (r) =>
                                                                                  `${r.name} (${new Date(r.read_at).toLocaleTimeString('en-KE', {
                                                                                      hour: '2-digit',
                                                                                      minute: '2-digit',
                                                                                  })})`
                                                                          )
                                                                          .join(', ')
                                                                    : 'Delivered'
                                                            }
                                                            className={
                                                                readByOthers(msg) >= othersCount
                                                                    ? 'text-[#891920]'
                                                                    : readByOthers(msg) > 0
                                                                      ? 'text-slate-400'
                                                                      : 'text-slate-300'
                                                            }
                                                        >
                                                            {readByOthers(msg) > 0 ? (
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 12l5 5L18 6m-8 11l2 2L22 8" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Reply action (my messages: edit/delete come in C.3.3.9 admin + own-message actions) */}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                {/* Composer */}
                <div className="border-t border-slate-200 bg-white p-4">
                    {typingUsers.length > 0 && (
                        <div className="flex items-center gap-2 px-1 pb-2 text-xs text-slate-500">
                            <span className="flex gap-0.5">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                            {typingUsers.length === 1
                                ? `${typingUsers[0].name} is typing…`
                                : `${typingUsers.map((t) => t.name.split(' ')[0]).join(' and ')} are typing…`}
                        </div>
                    )}
                    {!can_send ? (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                            </svg>
                            {send_blocked_reason}
                        </div>
                    ) : (
                        <form onSubmit={sendMessage}>
                            {replyTo && (
                                <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-slate-100 border-l-2 border-[#891920]">
                                    <div className="flex-1 min-w-0 text-xs text-slate-600">
                                        <span className="font-bold text-[#891920]">Replying to {replyTo.sender.name}:</span>{' '}
                                        {replyTo.body.length > 60 ? replyTo.body.slice(0, 60) + '…' : replyTo.body}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={cancelReply}
                                        className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center shrink-0"
                                    >
                                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Upload progress bar */}
                            {progress !== null && (
                                <div className="mb-2">
                                    <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className="h-full bg-[#891920] transition-all duration-200"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">Uploading… {progress}%</div>
                                </div>
                            )}

                            {/* Selected file chip */}
                            {selectedFile && (
                                <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200">
                                    <svg className="w-4 h-4 text-[#891920] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                                        />
                                    </svg>
                                    <span className="flex-1 min-w-0 text-xs font-semibold text-slate-700 truncate">{selectedFile.name}</span>
                                    <span className="text-[10px] text-slate-400 shrink-0">{formatBytes(selectedFile.size)}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            form.setData('file', null);
                                        }}
                                        className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center shrink-0"
                                    >
                                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Attachment picker panel */}
                            {attachOpen && (
                                <AttachmentPicker
                                    onSelect={(file) => {
                                        setSelectedFile(file);
                                        form.setData('file', file);
                                        setAttachOpen(false);
                                    }}
                                    onClose={() => setAttachOpen(false)}
                                />
                            )}

                            <div className="flex items-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAttachOpen(!attachOpen)}
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                                        attachOpen ? 'bg-[#891920]/10 text-[#891920]' : 'hover:bg-slate-100 text-slate-500'
                                    }`}
                                    title="Attach file"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                                        />
                                    </svg>
                                </button>
                                <textarea
                                    rows={1}
                                    value={form.data.body}
                                    onChange={(e) => {
                                        form.setData('body', e.target.value);
                                        pingTyping();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                                    className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/10 transition-all max-h-32"
                                />
                                <button
                                    type="submit"
                                    disabled={(!form.data.body.trim() && !form.data.file) || sending}
                                    className="w-11 h-11 rounded-xl bg-[#891920] hover:bg-[#6b1518] text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                    title="Send"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
