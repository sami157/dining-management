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
                
                {/* Minimal Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <LayoutGrid size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">User Portal</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-base-content">
                            Upcoming Meals
                        </h1>
                        <p className="text-base-content/60 text-xs font-medium">
                            See ofered meals with menu and Register
                        </p>
                    </div>

                    {/* Compact Navigation Control */}
                    <div className="flex w-fit mx-auto items-center justify-center bg-base-200/50 p-1.5 rounded-2xl border border-base-300 shadow-sm">
                        <button 
                            onClick={handlePreviousWeek} 
                            className="btn btn-ghost btn-sm btn-circle"
                            aria-label="Previous week"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <button 
                            onClick={handleThisWeek} 
                            className="btn btn-ghost btn-sm px-4 font-bold text-xs uppercase tracking-tighter"
                        >
                            THIS WEEk
                        </button>

                        <button 
                            onClick={handleNextWeek} 
                            className="btn btn-ghost btn-sm btn-circle"
                            aria-label="Next week"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </header>

                {/* Date Range Badge */}
                <div className="flex justify-center gap-3 mb-8">
                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/20">
                        <CalendarDays size={14} className="mb-0.5" />
                        <span className="text-sm font-bold whitespace-nowrap">
                            {format(currentWeekStart, 'MMM dd')} — {format(weekEnd, 'MMM dd, yyyy')}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <main className="relative min-h-[50vh]">
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-96 gap-4">
                            <span className="loading loading-ring loading-lg text-primary"></span>
                            <p className="text-xs font-bold uppercase tracking-widest text-base-content/40 animate-pulse">
                                Fetching your menu
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            {weekDates.map((date) => {
                                const key = format(date, 'yyyy-MM-dd');
                                const schedule = scheduleMap[key];

                                return (
                                    <div key={key} className="h-full">
                                        <UpcomingMealCard
                                            date={date}
                                            schedule={schedule}
                                            refetch={refetch}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

                {/* Simple Footer Info */}
                {!isLoading && (
                    <footer className="mt-12 text-center">
                        <p className="text-xs text-base-content/40 font-medium italic">
                            Meal bookings must be done in compliance with the deadlines set by manager
                        </p>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default UpcomingMeals;