import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import 'cally';
import {
    Activity,
    Ban,
    CircleCheck,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Clock3,
    Filter,
    Hash,
    RotateCcw,
    Utensils,
    UserRound,
    UsersRound,
    Zap,
} from 'lucide-react';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useAuth from '../hooks/useAuth';

const PAGE_SIZE = 25;
const DATE_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const getDhakaDateKey = (date = new Date()) => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).format(date);

const shiftDateKey = (dateKey, days) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const shifted = new Date(Date.UTC(year, month - 1, day + days));
    return [
        shifted.getUTCFullYear(),
        String(shifted.getUTCMonth() + 1).padStart(2, '0'),
        String(shifted.getUTCDate()).padStart(2, '0')
    ].join('-');
};

const getDefaultDateRange = () => {
    const endDate = getDhakaDateKey();
    return { startDate: shiftDateKey(endDate, -6), endDate };
};

const formatDateKey = dateKey => {
    if (!DATE_KEY_PATTERN.test(dateKey || '')) return 'Select date';
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Intl.DateTimeFormat('en-BD', {
        dateStyle: 'medium',
        timeZone: 'Asia/Dhaka'
    }).format(new Date(Date.UTC(year, month - 1, day, 12)));
};

const formatDateTime = value => {
    if (!value) return 'Unknown time';

    try {
        return new Intl.DateTimeFormat('en-BD', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Dhaka'
        }).format(new Date(value));
    } catch {
        return 'Unknown time';
    }
};

const formatMealDate = value => {
    if (!value) return 'Unknown date';

    try {
        return new Intl.DateTimeFormat('en-BD', {
            dateStyle: 'medium',
            timeZone: 'Asia/Dhaka'
        }).format(new Date(value));
    } catch {
        return 'Unknown date';
    }
};

const titleCase = value => String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

const getSourceLabel = (log) => {
    if (log.source === 'auto') return 'Automatic registration';
    if (log.source === 'self') return null;
    return 'By another user';
};

const getActionMeta = action => {
    if (action === 'meal_registered') {
        return {
            label: 'Registration',
            icon: CircleCheck,
            color: 'text-success',
            badge: 'badge-success',
            iconSurface: 'text-success'
        };
    }

    if (action === 'meal_deregistered') {
        return {
            label: 'Cancellation',
            icon: Ban,
            color: 'text-error',
            badge: 'badge-error',
            iconSurface: 'text-error'
        };
    }

    return {
        label: titleCase(action || 'Unknown activity'),
        icon: CircleAlert,
        color: 'text-warning',
        badge: 'badge-warning',
        iconSurface: 'bg-warning/10 text-warning ring-warning/20'
    };
};

const ActivityEntry = ({ log, isOwnView }) => {
    const meta = getActionMeta(log.action);
    const Icon = meta.icon;
    const payload = log.payload || {};
    const isKnownMealEvent = log.action === 'meal_registered' || log.action === 'meal_deregistered';
    const sourceLabel = getSourceLabel(log, isOwnView);
    const hasActorOrTarget = log.target?.name
        || (log.actor?.type === 'user' && log.actor?.name)
        || log.actor?.type === 'system';

    return (
        <article className="group overflow-hidden rounded-2xl bg-base-100 transition-all duration-200 p-4">
            <div className="flex flex-col items-start gap-2">
                <div className='flex items-start w-full justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <h3 className={`font-bold ${meta.iconSurface} uppercase`}>{meta.label}</h3>
                                <p className="mt-1 inline-flex items-center gap-1.5 text-xs opacity-55">
                                    <Clock3 size={13} aria-hidden="true" />
                                    {formatDateTime(log.createdAt)}
                                </p>
                            </div>
                            {sourceLabel && (
                                <span className={`badge badge-sm ${meta.badge} badge-outline w-fit shrink-0 font-bold uppercase tracking-wide`}>
                                    {sourceLabel}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className='px-2 py-1 text-xs rounded-md bg-base-300'>
                        <p className="font-bold">{payload.numberOfMeals || 1}</p>
                    </div>
                </div>
                <div className="w-full">
                    {isKnownMealEvent ? (
                        <div className="w-full">
                            <div className='flex items-center justify-between'>
                                <div className="flex items-center text-sm gap-2 p-1">
                                    <CalendarDays size={14} aria-hidden="true" />
                                    <p>{formatMealDate(payload.mealDate)}</p>
                                </div>
                                <div className="flex items-center text-sm gap-2 p-1">
                                    <Utensils size={14} aria-hidden="true" />
                                    <p>{titleCase(payload.mealType)}</p>
                                </div>
                            </div>
                            {payload.trigger && (
                                <div className="rounded-xl w-full bg-base-300/50 mt-2 p-2 transition-colors">
                                    <p className="flex items-center gap-1.5 text-xs tracking-widest opacity-55">
                                        <Zap size={13} aria-hidden="true" />
                                        Trigger
                                    </p>
                                    <p className="wrap-break-words font-bold">{titleCase(payload.trigger)}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <pre className="mt-4 max-w-full max-h-40 overflow-auto rounded-xl bg-base-200 p-3 text-xs whitespace-pre-wrap wrap-break-words">
                            {JSON.stringify(payload, null, 2)}
                        </pre>
                    )}

                    {hasActorOrTarget && (
                        <div className="mt-4 flex flex-col gap-2 border-t border-base-200 pt-3 text-xs text-base-content/60 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                            {log.target?.name && (
                                <span className="inline-flex min-w-0 items-start gap-1.5">
                                    <UserRound className="mt-0.5 shrink-0" size={13} aria-hidden="true" />
                                    <span className="min-w-0 break-words">Target: {log.target.name}</span>
                                </span>
                            )}
                            {log.actor?.type === 'user' && log.actor?.name && (
                                <span className="inline-flex min-w-0 items-start gap-1.5">
                                    <UsersRound className="mt-0.5 shrink-0" size={13} aria-hidden="true" />
                                    <span className="min-w-0 break-words">Actor: {log.actor.name}</span>
                                </span>
                            )}
                            {log.actor?.type === 'system' && (
                                <span className="inline-flex min-w-0 items-start gap-1.5">
                                    <Zap className="mt-0.5 shrink-0" size={13} aria-hidden="true" />
                                    <span className="min-w-0 break-words">{log.actor.label || 'System action'}</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

const ActivityLog = ({ mode = 'user' }) => {
    const axiosSecure = useAxiosSecure();
    const { loading } = useAuth();
    const isManagerMode = mode === 'manager';
    const [selectedUserId, setSelectedUserId] = useState('');
    const [{ startDate, endDate }, setDateRange] = useState(getDefaultDateRange);
    const [calendarOpen, setCalendarOpen] = useState(null);
    const [page, setPage] = useState(1);
    const startCalendarRef = useRef(null);
    const endCalendarRef = useRef(null);
    const calendarPopoverRef = useRef(null);

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['activityLogUsers'],
        enabled: isManagerMode && !loading,
        queryFn: async () => {
            const response = await axiosSecure.get('/users');
            return response.data.users || [];
        },
        select: users => [...users].sort((left, right) => (left.name || '').localeCompare(right.name || ''))
    });

    const targetUser = useMemo(
        () => (usersData || []).find(user => user._id === selectedUserId),
        [selectedUserId, usersData]
    );

    useEffect(() => {
        const calendar = calendarOpen === 'start' ? startCalendarRef.current : endCalendarRef.current;
        if (!calendar) return undefined;

        const handleCalendarChange = event => {
            const nextDate = String(event.target?.value || '');
            if (DATE_KEY_PATTERN.test(nextDate)) {
                setDateRange(current => calendarOpen === 'start'
                    ? {
                        startDate: nextDate,
                        endDate: current.endDate < nextDate ? nextDate : current.endDate
                    }
                    : {
                        startDate: current.startDate > nextDate ? nextDate : current.startDate,
                        endDate: nextDate
                    });
                setPage(1);
                setCalendarOpen(null);
            }
        };

        calendar.addEventListener('change', handleCalendarChange);
        return () => calendar.removeEventListener('change', handleCalendarChange);
    }, [calendarOpen]);

    useEffect(() => {
        if (!calendarOpen) return undefined;

        const handleOutsideClick = event => {
            if (!calendarPopoverRef.current?.contains(event.target)) setCalendarOpen(null);
        };
        const handleEscape = event => {
            if (event.key === 'Escape') setCalendarOpen(null);
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [calendarOpen]);

    const resetDateRange = () => {
        setDateRange(getDefaultDateRange());
        setPage(1);
        setCalendarOpen(null);
    };

    const { data: logsData, isLoading: logsLoading, isFetching, error } = useQuery({
        queryKey: ['activityLogs', mode, isManagerMode ? selectedUserId || 'all' : 'self', startDate, endDate, page],
        enabled: !loading && Boolean(startDate && endDate),
        queryFn: async () => {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
            if (isManagerMode && selectedUserId) params.set('userId', selectedUserId);
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
            const response = await axiosSecure.get(`/users/activity-logs?${params.toString()}`);
            return response.data;
        }
    });

    const logs = logsData?.logs || [];
    const totalPages = logsData?.totalPages || 0;
    const isOwnView = !isManagerMode;
    const errorMessage = error?.response?.data?.error || 'Failed to load activity logs.';

    return (
        <div className="mx-auto w-[98vw] max-w-7xl p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-primary">
                        <Activity size={22} strokeWidth={2.5} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">
                            {isManagerMode ? 'Manager dashboard' : 'User dashboard'}
                        </span>
                    </div>
                    <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Activity Log</h1>
                    <p className="mt-1 max-w-2xl text-sm opacity-60">
                        {isManagerMode
                            ? 'Review registration and deregistration history for all users, or filter by a specific user.'
                            : 'Review your meal registration and deregistration history.'}
                    </p>
                </div>
                {isFetching && !logsLoading && <span className="loading loading-dots loading-md text-primary" aria-label="Refreshing logs" />}
            </div>

            <section className="mb-6 rounded-2xl p-2 sm:p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest opacity-70">
                    <Filter size={16} /> Filters
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-start gap-2">
                    {isManagerMode && (
                        <div className="form-control w-full sm:w-60">
                            <span className="label-text mb-2 text-xs font-black uppercase tracking-widest opacity-60">User</span>
                            <select
                                className="select border-0 w-full"
                                value={selectedUserId}
                                onChange={event => {
                                    setPage(1);
                                    setSelectedUserId(event.target.value);
                                }}
                                disabled={usersLoading}
                            >
                                <option value="">{usersLoading ? 'Loading users...' : 'All users'}</option>
                                {(usersData || []).map(user => (
                                    <option key={user._id} value={user._id}>
                                        <div className='flex flex-col gap-1'>
                                            <div className='text-xs'>
                                                {user.name}
                                            </div>
                                            <div className='text-xs'>
                                                {user.email || 'No email'}
                                            </div>
                                            <div className='text-xs'>
                                                {user.room || ''}
                                            </div>
                                        </div>
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div
                        className={`flex flex-col sm:flex-row w-full sm:w-fit gap-2`}
                        ref={calendarPopoverRef}
                    >
                        {[
                            { key: 'start', label: 'Start date', value: startDate, max: endDate, ref: startCalendarRef },
                            { key: 'end', label: 'End date', value: endDate, min: startDate, ref: endCalendarRef }
                        ].map(datePicker => (
                            <div className="form-control" key={datePicker.key}>
                                <span className="label-text mb-2 text-xs font-black uppercase tracking-widest opacity-60">{datePicker.label}</span>
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="input border-0 flex h-10 w-full sm:w-fit items-center justify-start gap-3 text-left font-semibold"
                                        onClick={() => setCalendarOpen(current => current === datePicker.key ? null : datePicker.key)}
                                        aria-expanded={calendarOpen === datePicker.key}
                                        aria-haspopup="dialog"
                                    >
                                        <CalendarDays size={18} className="shrink-0 opacity-55" />
                                        <span className="truncate">{formatDateKey(datePicker.value)}</span>
                                    </button>
                                    {calendarOpen === datePicker.key && (
                                        <div className="absolute left-0 top-full z-50 mt-2 w-full sm:w-80 max-w-[96vw] rounded-2xl bg-base-100 p-2 shadow-2xl">
                                            <calendar-date
                                                ref={datePicker.ref}
                                                months={1}
                                                locale="en-BD"
                                                value={datePicker.value}
                                                min={datePicker.min}
                                                max={datePicker.max}
                                                className="activity-calendar"
                                            >
                                                <span slot="previous" className="inline-flex p-1 items-center" aria-label="Previous month">
                                                    <ChevronLeft size={18} aria-hidden="true" />
                                                    <span className="sr-only">Previous month</span>
                                                </span>
                                                <span slot="next" className="inline-flex items-center" aria-label="Next month">
                                                    <ChevronRight size={18} aria-hidden="true" />
                                                    <span className="sr-only">Next month</span>
                                                </span>
                                                <calendar-month></calendar-month>
                                            </calendar-date>
                                            <div className="mt-3 flex items-center justify-between gap-2 border-t border-base-300 pt-3">
                                                <span className="text-xs font-semibold opacity-55">Choose a date</span>
                                                <button type="button" className="btn btn-ghost btn-xs shrink-0 gap-1" onClick={resetDateRange}>
                                                    <RotateCcw size={13} /> Reset
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {isManagerMode && targetUser && (
                    <p className="mt-4 text-xs font-semibold opacity-55">
                        Viewing logs for {targetUser.name}{targetUser.isActive === false ? ' (inactive)' : ''}.
                    </p>
                )}
            </section>

            {error ? (
                <div className="rounded-2xl border border-error/30 bg-error/10 p-8 text-center text-error">
                    <CircleAlert className="mx-auto" size={32} />
                    <p className="mt-3 font-bold">{errorMessage}</p>
                </div>
            ) : logsLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => <div key={index} className="skeleton h-32 w-full rounded-2xl" />)}
                </div>
            ) : logs.length === 0 ? (
                <div className="rounded-2xl p-4 text-center">
                    <Activity className="mx-auto opacity-30" size={36} />
                    <h2 className="mt-3 font-black">No activity found</h2>
                </div>
            ) : (
                <>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {logs.map(log => <ActivityEntry key={log._id} log={log} isOwnView={isOwnView} />)}
                    </div>
                    <div className="mt-4 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-55">
                            {logsData.total} {logsData.total === 1 ? 'entry' : 'entries'} · Page {page} of {totalPages}
                        </p>
                        <div className="join self-end sm:self-auto">
                            <button
                                className="btn btn-sm join-item"
                                onClick={() => setPage(current => current - 1)}
                                disabled={page <= 1 || isFetching}
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <button
                                className="btn btn-sm join-item"
                                onClick={() => setPage(current => current + 1)}
                                disabled={page >= totalPages || isFetching}
                                aria-label="Next page"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ActivityLog;
