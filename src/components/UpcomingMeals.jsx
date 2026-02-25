import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid } from 'lucide-react';
import useAxiosSecure from '../hooks/useAxiosSecure';
import UpcomingMealCard from '../components/UpcomingMealCard';
import useAuth from '../hooks/useAuth';

const UpcomingMeals = () => {
    const axiosSecure = useAxiosSecure();
    const { loading } = useAuth();
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

    const weekEnd = addDays(currentWeekStart, 6);
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    // 1. Fetch Available Meals (Schedules)
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['userMealsWeek', currentWeekStart],
        enabled: !loading,
        queryFn: async () => {
            const res = await axiosSecure.get(
                `/users/meals/available?startDate=${format(currentWeekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`
            );
            return res.data;
        }
    });

    // 2. Fetch All Registrations for the week to calculate counts
    const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
        queryKey: ['registrationsWeek', currentWeekStart],
        enabled: !loading,
        queryFn: async () => {
            const res = await axiosSecure.get(
                `/managers/registrations?startDate=${format(currentWeekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`
            );
            return res.data.registrations;
        }
    });

    // 3. Process registrations into a lookup map: { "2024-05-20": { morning: 5, evening: 10, night: 8 } }
    const registrationCounts = registrationsData?.reduce((acc, reg) => {
        const dateKey = format(new Date(reg.date), 'yyyy-MM-dd');
        const type = reg.mealType; // morning, evening, or night

        if (!acc[dateKey]) acc[dateKey] = { morning: 0, evening: 0, night: 0 };
        if (acc[dateKey][type] !== undefined) {
            acc[dateKey][type] += 1;
        }
        return acc;
    }, {}) || {};

    const scheduleMap = {};
    data?.schedules?.forEach((s) => {
        const key = format(new Date(s.date), 'yyyy-MM-dd');
        scheduleMap[key] = s;
    });

    const handlePreviousWeek = () => setCurrentWeekStart((prev) => addDays(prev, -7));
    const handleNextWeek = () => setCurrentWeekStart((prev) => addDays(prev, 7));
    const handleThisWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));

    return (
        <div className="min-h-screen bg-base-300 p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-base-300 pb-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <LayoutGrid size={20} />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">User Portal</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-base-content">
                            Upcoming Meals
                        </h1>
                        <p className="text-base-content/60 text-xs font-bold uppercase tracking-wide">
                            Plan your week & join the table
                        </p>
                    </div>

                    <div className="flex w-fit items-center bg-base-200/50 p-1.5 rounded-2xl border border-base-300 shadow-none">
                        <button onClick={handlePreviousWeek} className="btn btn-ghost btn-sm btn-circle"><ChevronLeft size={18} /></button>
                        <button onClick={handleThisWeek} className="btn btn-ghost btn-sm px-4 font-bold text-[10px] uppercase tracking-widest">This Week</button>
                        <button onClick={handleNextWeek} className="btn btn-ghost btn-sm btn-circle"><ChevronRight size={18} /></button>
                    </div>
                </header>

                {/* Date Range Badge */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3 bg-base-200 px-6 py-2 rounded-full border border-base-300">
                        <CalendarDays size={16} className="text-primary" />
                        <span className="text-sm font-black uppercase tracking-tight">
                            {format(currentWeekStart, 'MMM dd')} — {format(weekEnd, 'MMM dd, yyyy')}
                        </span>
                    </div>
                </div>

                <main className="relative min-h-[50vh]">
                    {isLoading || registrationsLoading ? (
                        <div className="flex flex-col justify-center items-center h-96 gap-4">
                            <span className="loading loading-ring loading-lg text-primary"></span>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/40 animate-pulse">Loading Kitchen</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {weekDates.map((date) => {
                                const key = format(date, 'yyyy-MM-dd');
                                const schedule = scheduleMap[key];
                                // Pass the specific counts for this date
                                const countsForDate = registrationCounts[key] || { morning: 0, evening: 0, night: 0 };

                                return (
                                    <div key={key} className="h-full">
                                        <UpcomingMealCard
                                            date={date}
                                            schedule={schedule}
                                            counts={countsForDate}
                                            refetch={refetch}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

                {!isLoading && (
                    <footer className="mt-16 text-center border-t border-base-300 pt-10">
                        <p className="text-[10px] text-base-content/30 font-black uppercase tracking-[0.2em]">
                            Deadlines are managed by the mess committee
                        </p>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default UpcomingMeals;