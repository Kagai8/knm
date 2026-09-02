import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import PortalLayout from '@/knm/public/portal/layouts/PortalLayout';

const premiumEase = [0.25, 0.1, 0.25, 1];
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } },
};

type Message = { from: 'client' | 'advocate'; text: string; time: string };
type Thread = {
    id: number;
    name: string;
    role: string;
    matter: string;
    initials: string;
    unread: number;
    messages: Message[];
};

const initialThreads: Thread[] = [
    {
        id: 1,
        name: 'Member Two',
        role: 'Senior Partner',
        matter: 'Property Purchase — Karen',
        initials: 'MT',
        unread: 2,
        messages: [
            { from: 'advocate', text: 'Good morning Grace. The official search results are back — everything is clean.', time: '09:14' },
            { from: 'advocate', text: 'We can schedule the completion meeting for 22 August. Does 10:00 AM work for you?', time: '09:15' },
            { from: 'client', text: 'That works perfectly. Thank you!', time: '09:32' },
            { from: 'advocate', text: 'Excellent. I have added it to your matter calendar. You will receive reminders 7 days, 3 days and 1 day before.', time: '09:40' },
        ],
    },
    {
        id: 2,
        name: 'Member Four',
        role: 'Senior Associate',
        matter: 'Employment Contract Review',
        initials: 'MF',
        unread: 1,
        messages: [
            { from: 'client', text: 'Hello, I wanted to check on the engagement letter.', time: 'Yesterday' },
            { from: 'advocate', text: 'Hi Grace. The engagement letter is ready for your signature — I have uploaded it to your documents.', time: 'Yesterday' },
            { from: 'advocate', text: 'Once signed, we can begin the full contract review immediately.', time: '08:05' },
        ],
    },
];

export default function Messages() {
    const [threads, setThreads] = useState<Thread[]>(initialThreads);
    const [activeId, setActiveId] = useState<number>(1);
    const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');
    const [draft, setDraft] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const active = threads.find((t) => t.id === activeId) ?? threads[0];

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [activeId, threads, mobileView]);

    const select = (id: number) => {
        setActiveId(id);
        setMobileView('thread');
        setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
    };

    const send = (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft.trim()) return;
        setThreads((prev) =>
            prev.map((t) =>
                t.id === activeId
                    ? { ...t, messages: [...t.messages, { from: 'client', text: draft.trim(), time: 'Just now' }] }
                    : t
            )
        );
        setDraft('');
    };

    return (
        <PortalLayout>
            <Head title="Messages" />

            {/* Page Header */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Messages</h1>
                <p className="text-slate-500 mt-1">Secure conversations with your advocates — visible only to you and your matter team.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
                {/* Conversation List */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: premiumEase, delay: 0.1 }}
                    className={`${mobileView === 'list' ? 'flex' : 'hidden'} lg:flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden`}
                >
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-serif font-bold text-slate-900">Conversations</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => select(thread.id)}
                                className={`w-full flex items-center gap-4 p-5 text-left transition-colors ${
                                    activeId === thread.id && mobileView === 'thread'
                                        ? 'bg-slate-50'
                                        : 'hover:bg-slate-50'
                                }`}
                            >
                                <div className="w-11 h-11 rounded-full bg-[#891920] text-white flex items-center justify-center font-serif font-bold text-sm shrink-0">
                                    {thread.initials}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-slate-900 font-semibold text-sm truncate">{thread.name}</span>
                                        {thread.unread > 0 && (
                                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#D4AF37] text-[#891920] text-[10px] font-bold shrink-0">
                                                {thread.unread}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400 truncate mt-0.5">{thread.matter}</div>
                                    <div className="text-xs text-slate-500 truncate mt-1">{thread.messages[thread.messages.length - 1].text}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Active Thread */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: premiumEase, delay: 0.15 }}
                    className={`${mobileView === 'thread' ? 'flex' : 'hidden'} lg:flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-[640px]`}
                >
                    {/* Thread Header */}
                    <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
                        <button
                            onClick={() => setMobileView('list')}
                            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-[#891920] hover:border-[#891920] transition-colors shrink-0"
                            aria-label="Back to conversations"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="w-11 h-11 rounded-full bg-[#891920] text-white flex items-center justify-center font-serif font-bold text-sm shrink-0">
                            {active.initials}
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="text-slate-900 font-semibold text-sm">{active.name}</div>
                            <div className="text-xs text-slate-400 truncate">{active.role} · {active.matter}</div>
                        </div>
                        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#891920] text-xs font-bold rounded-full shrink-0">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Encrypted
                        </span>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50">
                        {active.messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] ${msg.from === 'client' ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                                            msg.from === 'client'
                                                ? 'bg-[#891920] text-white rounded-2xl rounded-tr-none'
                                                : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-none'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <div className={`text-[10px] text-slate-400 mt-1.5 ${msg.from === 'client' ? 'text-right' : 'text-left'}`}>
                                        {msg.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Composer */}
                    <form onSubmit={send} className="flex items-center gap-3 p-4 border-t border-slate-100 bg-white">
                        <input
                            type="text"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Write a secure message..."
                            className="flex-grow px-5 py-3 rounded-full bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                        />
                        <button
                            type="submit"
                            aria-label="Send message"
                            className="group relative w-12 h-12 flex items-center justify-center rounded-full bg-[#891920] text-white overflow-hidden transition-all duration-500 shadow-lg shadow-[#891920]/20 hover:shadow-2xl hover:shadow-[#891920]/40 shrink-0"
                        >
                            <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                            <svg className="relative w-5 h-5 transition-colors duration-500 group-hover:text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                        </button>
                    </form>
                </motion.div>
            </div>
        </PortalLayout>
    );
}
