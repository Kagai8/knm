/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @stylistic/padding-line-between-statements */
/* eslint-disable curly */
import { useState, useMemo, useRef, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardBody, CardHeader, ConfirmModal, FormField, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface EventType {
    id: number;
    name: string;
    color: string;
    is_deadline: boolean;
}

interface MatterOption {
    id: number;
    title: string;
    file_number: string;
    client_id: number | null;
}

interface StaffOption {
    id: number;
    name: string;
}

interface Attendee {
    id: number;
    name: string;
}

interface CalendarEvent {
    id: number;
    title: string;
    description: string | null;
    starts_at: string;
    ends_at: string | null;
    is_all_day: boolean;
    location: string | null;
    color: string;
    is_deadline: boolean;
    notify_client: boolean;
    attendees: Attendee[];
    attendee_ids: number[];
    created_by_id: number;
    created_by_name: string | null;
    is_my_event: boolean;
    matter_id: number | null;
    matter_title: string | null;
    matter_file_number: string | null;
    client_id: number | null;
    client_name: string | null;
    type_id: number;
    type_name: string | null;
    // Legacy aliases (will be removed in C.1.4.c.4)
    attendee_id?: number | null;
    attendee_name?: string | null;
    owner_id?: number | null;
    owner_name?: string | null;
}

interface Props {
    events: CalendarEvent[];
    eventTypes: EventType[];
    matters: MatterOption[];
    staff: StaffOption[];
    canDelegate: boolean;
    filters: {
        start: string;
        end: string;
        scope: string;
        matter_id: string | null;
        view_scale?: string;
        view_mode?: string;
    };
    canViewAll: boolean;
    openModal?: boolean;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const inputClasses = 'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

const formatDateTimeFull = (iso: string) =>
    new Date(iso).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
};

const formatDateForParam = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function Index({ events, eventTypes, matters, staff, canDelegate, filters, canViewAll, openModal }: Props) {
    const { can, user: currentUser } = useAuth();

    const [viewScale, setViewScale] = useState<'month' | 'year'>(
        (filters.view_scale as 'month' | 'year') || 'month'
    );
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>(
        (filters.view_mode as 'calendar' | 'list') || 'calendar'
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentStart = new Date(filters.start);
    const currentYear = currentStart.getFullYear();
    const currentMonth = currentStart.getMonth();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-open modal if coming from matter page
    useEffect(() => {
        if (openModal && can('calendar.manage_own')) {
            openCreateModal();
        }
    }, [openModal]);

    // --- Navigation ---

    const navigateToToday = () => {
        const today = new Date();
        let start: string;
        let end: string;

        if (viewScale === 'year') {
            start = `${today.getFullYear()}-01-01`;
            end = `${today.getFullYear()}-12-31`;
        } else {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            start = formatDateForParam(firstDay);
            end = formatDateForParam(lastDay);
        }

        router.get('/private/calendar', {
            start,
            end,
            scope: filters.scope,
            view_scale: viewScale,
            view_mode: viewMode,
            ...(filters.matter_id ? { matter_id: filters.matter_id } : {})
        });
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1);
        const start = formatDateForParam(newDate);
        const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
        const end = formatDateForParam(lastDay);

        router.get('/private/calendar', {
            start,
            end,
            scope: filters.scope,
            view_scale: viewScale,
            view_mode: viewMode,
            ...(filters.matter_id ? { matter_id: filters.matter_id } : {})
        });
    };

    const navigateYear = (direction: 'prev' | 'next') => {
        const newYear = currentYear + (direction === 'next' ? 1 : -1);
        const start = `${newYear}-01-01`;
        const end = `${newYear}-12-31`;

        router.get('/private/calendar', {
            start,
            end,
            scope: filters.scope,
            view_scale: viewScale,
            view_mode: viewMode,
            ...(filters.matter_id ? { matter_id: filters.matter_id } : {})
        });
    };

    const toggleScope = (scope: 'own' | 'all') => {
        router.get('/private/calendar', {
            start: filters.start,
            end: filters.end,
            scope,
            view_scale: viewScale,
            view_mode: viewMode,
            ...(filters.matter_id ? { matter_id: filters.matter_id } : {})
        });
    };

    const changeViewScale = (scale: 'month' | 'year') => {
        setViewScale(scale);

        let start: string;
        let end: string;

        if (scale === 'year') {
            start = `${currentYear}-01-01`;
            end = `${currentYear}-12-31`;
        } else {
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            start = formatDateForParam(firstDay);
            end = formatDateForParam(lastDay);
        }

        router.get('/private/calendar', {
            start,
            end,
            scope: filters.scope,
            view_scale: scale,
            view_mode: viewMode,
            ...(filters.matter_id ? { matter_id: filters.matter_id } : {})
        }, { preserveState: true });
    };

    const changeViewMode = (mode: 'calendar' | 'list') => {
        setViewMode(mode);
        router.get('/private/calendar', {
            start: filters.start,
            end: filters.end,
            scope: filters.scope,
            view_scale: viewScale,
            view_mode: mode,
            ...(filters.matter_id ? { matter_id: filters.matter_id } : {})
        }, { preserveState: true });
    };

    // --- Calendar Grid ---

    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevDate = new Date(currentYear, currentMonth, -i);
            days.unshift({ date: prevDate, isCurrentMonth: false });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push({ date: new Date(currentYear, currentMonth, day), isCurrentMonth: true });
        }

        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(currentYear, currentMonth + 1, i), isCurrentMonth: false });
        }

        return days;
    }, [currentYear, currentMonth]);

    const getEventsForDay = (date: Date) => {
        return events.filter((event) => {
            const eventStart = new Date(event.starts_at);
            return (
                eventStart.getDate() === date.getDate() &&
                eventStart.getMonth() === date.getMonth() &&
                eventStart.getFullYear() === date.getFullYear()
            );
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    // --- Event Form ---

    const eventForm = useForm({
        title: '',
        description: '',
        starts_at: '',
        ends_at: '',
        is_all_day: false,
        location: '',
        calendar_event_type_id: '',
        matter_id: '',
        attendee_ids: [] as string[],
        notify_client: false,
        force: false,
    });

    const deleteForm = useForm({});

    const toggleAttendee = (id: string) => {
        const current = eventForm.data.attendee_ids;
        if (current.includes(id)) {
            eventForm.setData('attendee_ids', current.filter(i => i !== id));
        } else {
            eventForm.setData('attendee_ids', [...current, id]);
        }
    };

    const openCreateModal = (date?: Date) => {
        const isPast = date && isPastDate(date);

        if (isPast) {
            toast.info('Past date selected', {
                description: 'You clicked on a past date. Use the "+ New Event" button to create backdated events.',
            });
            return;
        }

        setEditingEvent(null);
        eventForm.reset();
        eventForm.clearErrors();

        const defaultDate = date ?? new Date();
        const dateStr = formatDateForParam(defaultDate);
        const timeStr = '09:00';

        eventForm.setData({
            title: '',
            description: '',
            starts_at: `${dateStr}T${timeStr}`,
            ends_at: '',
            is_all_day: false,
            location: '',
            calendar_event_type_id: eventTypes[0]?.id?.toString() ?? '',
            matter_id: filters.matter_id || '',
            attendee_ids: [currentUser?.id?.toString() ?? ''],
            notify_client: false,
            force: false,
        });
        setModalOpen(true);
    };

    const openEditModal = (event: CalendarEvent) => {
        console.log('✏️ EDIT MODAL OPENED', {
            event_id: event.id,
            title: event.title,
            attendee_ids_from_server: event.attendee_ids,
            attendees_from_server: event.attendees,
        });
        setEditingEvent(event);
        eventForm.reset();
        eventForm.clearErrors();

        const eventDate = new Date(event.starts_at);
        const dateStr = formatDateForParam(eventDate);
        const timeStr = eventDate.toTimeString().slice(0, 5);

        const startsAt = event.is_all_day ? dateStr : `${dateStr}T${timeStr}`;

        const endsAt = event.ends_at
            ? (() => {
                const endDate = new Date(event.ends_at);
                const endDateStr = formatDateForParam(endDate);
                const endTimeStr = endDate.toTimeString().slice(0, 5);
                return event.is_all_day ? endDateStr : `${endDateStr}T${endTimeStr}`;
              })()
            : '';

        eventForm.setData({
            title: event.title,
            description: event.description ?? '',
            starts_at: startsAt,
            ends_at: endsAt,
            is_all_day: event.is_all_day,
            location: event.location ?? '',
            calendar_event_type_id: event.type_id.toString(),
            matter_id: event.matter_id?.toString() ?? '',
                        attendee_ids: (event.attendee_ids && event.attendee_ids.length > 0
                ? event.attendee_ids
                : (event.attendees ?? []).map(a => a.id)
            ).map(id => id.toString()),
            notify_client: event.notify_client,
            force: false,
        });
        setModalOpen(true);
    };

    const submitEvent = (e: React.FormEvent) => {
        e.preventDefault();
        const isEditing = editingEvent !== null;
        const url = isEditing ? `/private/calendar/${editingEvent.id}` : '/private/calendar';
        const method = isEditing ? 'put' : 'post';

        eventForm.submit(method, url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? 'Event updated' : 'Event created', {
                    description: `"${eventForm.data.title}" has been ${isEditing ? 'updated' : 'added'} to the calendar.`,
                });
                setModalOpen(false);
                if (!isEditing) eventForm.reset();
            },
            onError: () => {
                toast.error(isEditing ? 'Could not update event' : 'Could not create event', {
                    description: 'Check the form for errors.',
                });
            },
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteForm.delete(`/private/calendar/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Event deleted', { description: `"${deleteTarget.title}" has been removed.` });
                setDeleteTarget(null);
            },
            onError: (errors) => {
                toast.error('Could not delete event', { description: Object.values(errors).flat().join(' ') });
                setDeleteTarget(null);
            },
        });
    };

    const canEditEvent = (event: CalendarEvent) => {
        if (can('calendar.manage_all')) return true;
        if (can('calendar.manage_own') && (event.is_my_event || event.created_by_id === currentUser?.id)) return true;
        return false;
    };

    const getAttendeesLabel = (event: CalendarEvent): string => {
        if (!event.attendees || event.attendees.length === 0) return 'Unknown';
        return event.attendees.map(a => a.name).join(', ');
    };

    const getEventOwnershipLabel = (event: CalendarEvent): string => {
        const creator = event.created_by_name || 'Unknown';
        const attendees = getAttendeesLabel(event);
        return `Created by ${creator} for ${attendees}`;
    };

    // --- Mini Month for Year View ---

    const MiniMonthCalendar = ({ year, month }: { year: number; month: number }) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const cells = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            cells.push(<div key={`empty-${i}`} className="aspect-square" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEvents = getEventsForDay(date);
            const today = isToday(date);
            const past = isPastDate(date);

            cells.push(
                <button
                    key={day}
                    onClick={() => openCreateModal(date)}
                    className={`aspect-square flex flex-col items-center justify-center text-[10px] rounded transition-all hover:bg-slate-100 ${
                        today ? 'bg-[#891920] text-white font-bold' : past ? 'text-slate-400' : 'text-slate-700'
                    }`}
                >
                    <span>{day}</span>
                    {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                            {dayEvents.slice(0, 2).map((e, i) => (
                                <div
                                    key={i}
                                    className="w-1 h-1 rounded-full"
                                    style={{ backgroundColor: e.color }}
                                />
                            ))}
                            {dayEvents.length > 2 && (
                                <span className="text-[8px] text-slate-500">+{dayEvents.length - 2}</span>
                            )}
                        </div>
                    )}
                </button>
            );
        }

        return (
            <div className="p-2 border border-slate-200 rounded-lg">
                <div className="text-center text-xs font-bold text-slate-700 mb-2">{MONTH_NAMES[month]}</div>
                <div className="grid grid-cols-7 gap-0.5">
                    {cells}
                </div>
            </div>
        );
    };

    // --- Event List Item ---

    const EventListItem = ({ event, idx }: { event: CalendarEvent; idx: number }) => (
        <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: event.color }}
                />
                <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {event.title}
                        {event.is_my_event && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                My Event
                            </span>
                        )}
                        {event.is_deadline && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                                Deadline
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                        {event.is_all_day
                            ? `All day · ${formatDate(event.starts_at)}`
                            : formatDateTimeFull(event.starts_at)
                        }
                        {event.location && ` · ${event.location}`}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-500">Attendees:</span> {getAttendeesLabel(event)}
                        {event.matter_title && (
                            <>
                                <span className="mx-1">·</span>
                                Matter: {event.matter_file_number} — {event.matter_title}
                            </>
                        )}
                        {event.notify_client && event.client_name && (
                            <>
                                <span className="mx-1">·</span>
                                <span className="text-green-600">Client notified: {event.client_name}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {canEditEvent(event) && (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(event)}>
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteTarget(event)}
                    >
                        Delete
                    </Button>
                </div>
            )}
        </motion.div>
    );

    return (
        <>
            <Head title="Calendar · K&A Internal" />

            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">Calendar</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {filters.scope === 'all' ? 'Firm-wide calendar' : 'Your personal calendar'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {canViewAll && (
                            <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                <button
                                    onClick={() => toggleScope('own')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                        filters.scope === 'own'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    My Calendar
                                </button>
                                <button
                                    onClick={() => toggleScope('all')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                        filters.scope === 'all'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Firm Calendar
                                </button>
                            </div>
                        )}

                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => changeViewScale('month')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    viewScale === 'month'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => changeViewScale('year')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    viewScale === 'year'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Year
                            </button>
                        </div>

                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => changeViewMode('calendar')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    viewMode === 'calendar'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Calendar
                            </button>
                            <button
                                onClick={() => changeViewMode('list')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                List
                            </button>
                        </div>

                        {can('calendar.manage_own') && (
                            <Button variant="gold" onClick={() => openCreateModal()}>
                                + New Event
                            </Button>
                        )}
                    </div>
                </div>

                {/* Color Legend */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Event types:</span>
                    {eventTypes.map((type) => (
                        <div key={type.id} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded-full border border-slate-200"
                                style={{ backgroundColor: type.color }}
                            />
                            <span className="text-xs text-slate-600">
                                {type.name}
                                {type.is_deadline && <span className="ml-1 text-red-500">⚠</span>}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation with Today button */}
            <div className="mb-4 flex items-center justify-between">
                <button
                    onClick={() => viewScale === 'month' ? navigateMonth('prev') : navigateYear('prev')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {viewScale === 'month' ? 'Previous Month' : 'Previous Year'}
                </button>

                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-serif font-bold text-slate-900">
                        {viewScale === 'month'
                            ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
                            : currentYear
                        }
                    </h2>
                    <Button variant="ghost" size="sm" onClick={navigateToToday}>
                        Today
                    </Button>
                </div>

                <button
                    onClick={() => viewScale === 'month' ? navigateMonth('next') : navigateYear('next')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    {viewScale === 'month' ? 'Next Month' : 'Next Year'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {viewScale === 'month' && viewMode === 'calendar' && (
                <Card>
                    <CardBody className="p-0">
                        <div className="grid grid-cols-7 border-b border-slate-200">
                            {DAYS_OF_WEEK.map((day) => (
                                <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, idx) => {
                                const dayEvents = day.isCurrentMonth ? getEventsForDay(day.date) : [];
                                const today = isToday(day.date);
                                const past = isPastDate(day.date);

                                return (
                                    <div
                                        key={idx}
                                        className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 transition-colors ${
                                            !day.isCurrentMonth ? 'bg-slate-50/50' : past ? 'bg-slate-50/30' : 'bg-white'
                                        } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                                    >
                                        <div className="flex justify-end mb-1">
                                            <button
                                                onClick={() => day.isCurrentMonth && openCreateModal(day.date)}
                                                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${
                                                    today
                                                        ? 'bg-[#891920] text-white'
                                                        : past
                                                        ? 'text-slate-400 hover:bg-slate-100'
                                                        : 'text-slate-700 hover:bg-slate-100'
                                                }`}
                                                title={day.isCurrentMonth ? (past ? 'Past date' : 'Click to add event') : ''}
                                            >
                                                {day.date.getDate()}
                                            </button>
                                        </div>

                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map((event) => (
                                                <motion.button
                                                    key={event.id}
                                                    onClick={() => canEditEvent(event) && openEditModal(event)}
                                                    className={`w-full text-left px-1.5 py-1 rounded text-[10px] font-medium truncate transition-all hover:shadow-sm ${
                                                        canEditEvent(event) ? 'cursor-pointer' : 'cursor-default'
                                                    }`}
                                                    style={{
                                                        backgroundColor: `${event.color}15`,
                                                        color: event.color,
                                                        borderLeft: `3px solid ${event.color}`,
                                                    }}
                                                    title={`${event.title} — ${getEventOwnershipLabel(event)}${event.location ? ` · ${event.location}` : ''}`}
                                                >
                                                    {!event.is_all_day && (
                                                        <span className="font-semibold">{formatTime(event.starts_at)} </span>
                                                    )}
                                                    {event.is_deadline && '⚠ '}
                                                    {event.title}
                                                </motion.button>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-[10px] text-slate-400 px-1.5">
                                                    +{dayEvents.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardBody>
                </Card>
            )}

            {viewScale === 'month' && viewMode === 'list' && (
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-serif font-bold text-slate-900">
                            Events in {MONTH_NAMES[currentMonth]} {currentYear}
                        </h2>
                        <p className="text-xs text-slate-500">{events.length} event{events.length === 1 ? '' : 's'}</p>
                    </CardHeader>
                    <CardBody className="p-0">
                        {events.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {events.map((event, idx) => (
                                    <EventListItem key={event.id} event={event} idx={idx} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <h3 className="text-lg font-serif font-bold text-slate-900">No events this month</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Click on any day or use the "+ New Event" button to schedule something.
                                </p>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {viewScale === 'year' && viewMode === 'calendar' && (
                <Card>
                    <CardBody className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {MONTH_NAMES.map((_, month) => (
                                <MiniMonthCalendar key={month} year={currentYear} month={month} />
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

            {viewScale === 'year' && viewMode === 'list' && (
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-serif font-bold text-slate-900">
                            All Events in {currentYear}
                        </h2>
                        <p className="text-xs text-slate-500">{events.length} event{events.length === 1 ? '' : 's'}</p>
                    </CardHeader>
                    <CardBody className="p-0">
                        {events.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {events.map((event, idx) => (
                                    <EventListItem key={event.id} event={event} idx={idx} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <h3 className="text-lg font-serif font-bold text-slate-900">No events in {currentYear}</h3>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingEvent ? 'Edit Event' : 'New Event'}
                subtitle={
                    editingEvent
                        ? `${getEventOwnershipLabel(editingEvent)} · Updating "${editingEvent.title}"`
                        : 'Schedule a new event on the calendar.'
                }
                size="md"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={eventForm.processing} onClick={submitEvent as any}>
                            {editingEvent ? 'Save Changes' : 'Create Event'}
                        </Button>
                    </>
                }
            >
                <form id="event-form" onSubmit={submitEvent} className="space-y-5">
                    {/* Multi-select Book-for dropdown (only visible with delegate permission) */}
                    {canDelegate && (
                        <div className="relative space-y-1.5" ref={dropdownRef}>
                            <label className="block text-sm font-medium text-slate-700">Book for (Attendees)</label>
                            <div
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className={`block w-full min-h-[42px] rounded-lg border bg-white px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1.5 items-center transition-colors ${
                                    eventForm.errors.attendee_ids ? 'border-red-300 focus:border-red-500' : 'border-slate-300 hover:border-slate-400 focus:border-[#891920]'
                                }`}
                            >
                                {eventForm.data.attendee_ids.length === 0 ? (
                                    <span className="text-slate-400">Select attendees...</span>
                                ) : (
                                    eventForm.data.attendee_ids.map(id => {
                                        const person = staff.find(s => s.id.toString() === id);
                                        return (
                                            <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                                                {person?.id === currentUser?.id ? 'Me' : (person?.name || 'Unknown')}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); toggleAttendee(id); }}
                                                    className="text-slate-400 hover:text-red-500 font-bold leading-none"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        );
                                    })
                                )}
                            </div>
                            {eventForm.errors.attendee_ids && (
                                <p className="text-xs text-red-600 mt-1">{eventForm.errors.attendee_ids}</p>
                            )}
                            {dropdownOpen && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {staff.map(s => (
                                        <label key={s.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">
                                            <input
                                                type="checkbox"
                                                checked={eventForm.data.attendee_ids.includes(s.id.toString())}
                                                onChange={() => toggleAttendee(s.id.toString())}
                                                className="rounded border-slate-300 text-[#891920] focus:ring-[#891920]"
                                            />
                                            <span>{s.id === currentUser?.id ? `Me (${s.name})` : s.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <FormField
                        label="Event Title"
                        value={eventForm.data.title}
                        onChange={(e) => eventForm.setData('title', e.target.value)}
                        error={eventForm.errors.title}
                        placeholder="e.g. Court Hearing — Kamau v Equity Bank"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Event Type</label>
                            <select
                                className={inputClasses}
                                value={eventForm.data.calendar_event_type_id}
                                onChange={(e) => eventForm.setData('calendar_event_type_id', e.target.value)}
                            >
                                <option value="">Select type...</option>
                                {eventTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            {eventForm.errors.calendar_event_type_id && (
                                <p className="text-xs text-red-600 mt-1">{eventForm.errors.calendar_event_type_id}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Link to Matter (optional)</label>
                            <select
                                className={inputClasses}
                                value={eventForm.data.matter_id}
                                onChange={(e) => eventForm.setData('matter_id', e.target.value)}
                            >
                                <option value="">No matter link</option>
                                {matters.map((matter) => (
                                    <option key={matter.id} value={matter.id}>
                                        {matter.file_number} — {matter.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">
                                {eventForm.data.is_all_day ? 'Date' : 'Start Date & Time'}
                            </label>
                            <input
                                type={eventForm.data.is_all_day ? 'date' : 'datetime-local'}
                                className={inputClasses}
                                value={eventForm.data.starts_at}
                                onChange={(e) => eventForm.setData('starts_at', e.target.value)}
                            />
                            {eventForm.errors.starts_at && (
                                <p className="text-xs text-red-600 mt-1">{eventForm.errors.starts_at}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">
                                {eventForm.data.is_all_day ? 'End Date (optional)' : 'End Date & Time (optional)'}
                            </label>
                            <input
                                type={eventForm.data.is_all_day ? 'date' : 'datetime-local'}
                                className={inputClasses}
                                value={eventForm.data.ends_at}
                                onChange={(e) => eventForm.setData('ends_at', e.target.value)}
                            />
                            {eventForm.errors.ends_at && (
                                <p className="text-xs text-red-600 mt-1">{eventForm.errors.ends_at}</p>
                            )}
                        </div>
                    </div>

                    {/* All-day toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                        <div>
                            <label className="block text-sm font-medium text-slate-900">All-day event</label>
                            <p className="text-xs text-slate-500">No specific time — just a date.</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={eventForm.data.is_all_day}
                                onChange={(e) => eventForm.setData('is_all_day', e.target.checked)}
                            />
                            <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#891920]/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#891920]"></div>
                        </label>
                    </div>

                    {/* Force-book override */}
                    {eventForm.errors.starts_at && eventForm.errors.starts_at.includes('committed') && (
                        <label className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-0.5 accent-[#891920]"
                                checked={eventForm.data.force}
                                onChange={(e) => eventForm.setData('force', e.target.checked)}
                            />
                            <div>
                                <span className="text-sm font-medium text-amber-900">
                                    I understand the conflict — book anyway
                                </span>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    This will override the scheduling conflict.
                                </p>
                            </div>
                        </label>
                    )}

                    {/* Inform client checkbox */}
                    {eventForm.data.matter_id && (
                        <label className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-0.5 accent-[#891920]"
                                checked={eventForm.data.notify_client}
                                onChange={(e) => eventForm.setData('notify_client', e.target.checked)}
                            />
                            <div>
                                <span className="text-sm font-medium text-slate-900">
                                    Inform client about this event
                                </span>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    The client will be notified when this event is scheduled.
                                </p>
                            </div>
                        </label>
                    )}

                    <FormField
                        label="Location (optional)"
                        value={eventForm.data.location}
                        onChange={(e) => eventForm.setData('location', e.target.value)}
                        error={eventForm.errors.location}
                        placeholder="e.g. Milimani Court Room 3, Zoom, Client's Office"
                    />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Description (optional)</label>
                        <textarea
                            rows={3}
                            className={inputClasses}
                            value={eventForm.data.description}
                            onChange={(e) => eventForm.setData('description', e.target.value)}
                            placeholder="Any notes or context for this event..."
                        />
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Event"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                confirmLabel="Delete Event"
                variant="danger"
                isLoading={deleteForm.processing}
            />
        </>
    );
}
