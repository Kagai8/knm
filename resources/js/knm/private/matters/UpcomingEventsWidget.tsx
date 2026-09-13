import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Button, Card, CardBody, CardHeader } from '@/knm/shared/ui';

interface Attendee {
    id: number;
    name: string;
}

interface CalendarEvent {
    id: number;
    title: string;
    starts_at: string;
    ends_at: string | null;
    is_all_day: boolean;
    location: string | null;
    color: string;
    is_deadline: boolean;
    attendees: Attendee[];
    notify_client: boolean;
}

interface Props {
    events: CalendarEvent[];
    matterId: number;
    matterTitle: string;
}

const formatEventDate = (iso: string, isAllDay: boolean) => {
    const date = new Date(iso);
    if (isAllDay) {
        return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return date.toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const isPastEvent = (iso: string) => {
    return new Date(iso) < new Date();
};

export default function UpcomingEventsWidget({ events, matterId, matterTitle }: Props) {
    const upcomingEvents = events.filter(e => !isPastEvent(e.starts_at));
    const recentEvents = events.filter(e => isPastEvent(e.starts_at)).slice(-3);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h2 className="text-lg font-serif font-bold text-slate-900">
                            Events & Deadlines
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {upcomingEvents.length} upcoming · {recentEvents.length} recent
                        </p>
                    </div>
                    <Link
                        href={`/private/calendar?matter_id=${matterId}&scope=all`}
                        className="text-xs font-medium text-[#891920] hover:text-[#6b1418] transition-colors"
                    >
                        View all →
                    </Link>
                </div>
            </CardHeader>
            <CardBody>
                {upcomingEvents.length === 0 && recentEvents.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">No events scheduled for this matter yet.</p>
                        <Link
                            href={`/private/calendar?matter_id=${matterId}&open_modal=true`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#891920] text-white text-sm font-medium hover:bg-[#6b1418] transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Schedule Event
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcomingEvents.length > 0 && (
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Upcoming
                                </div>
                                <div className="space-y-2">
                                    {upcomingEvents.slice(0, 5).map((event, idx) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                                        >
                                            <div
                                                className="w-1 rounded-full shrink-0"
                                                style={{ backgroundColor: event.color }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="font-medium text-slate-900 text-sm flex items-center gap-1.5">
                                                        {event.title}
                                                        {event.is_deadline && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                                                                Deadline
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {formatEventDate(event.starts_at, event.is_all_day)}
                                                    {event.location && ` · ${event.location}`}
                                                </div>
                                                {event.attendees.length > 0 && (
                                                    <div className="text-xs text-slate-400 mt-1">
                                                        {event.attendees.map(a => a.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {upcomingEvents.length > 5 && (
                                        <Link
                                            href={`/private/calendar?matter_id=${matterId}&scope=all`}
                                            className="block text-center text-xs text-slate-500 hover:text-[#891920] py-2"
                                        >
                                            +{upcomingEvents.length - 5} more upcoming events
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {recentEvents.length > 0 && (
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 mt-4">
                                    Recent
                                </div>
                                <div className="space-y-2">
                                    {recentEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                                        >
                                            <div
                                                className="w-1 rounded-full shrink-0 opacity-50"
                                                style={{ backgroundColor: event.color }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-600 text-sm">
                                                    {event.title}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {formatEventDate(event.starts_at, event.is_all_day)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-3 border-t border-slate-100">
                            <Link
                                href={`/private/calendar?matter_id=${matterId}&open_modal=true`}
                                className="flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-lg border border-[#891920] text-[#891920] text-sm font-medium hover:bg-[#891920] hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Event
                            </Link>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
