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
    const { data, isLoading: mealLoading, refetch } = useQuery({
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
    const dataLoading = mealLoading;

    return (
        <div className="min-h-screen p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <LayoutGrid size={20} />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">User Portal</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase text-base-content">
                            Upcoming Meals
                        </h1>
                    </div>
                </header>

                {/* Date Range Badge */}
                <div className="flex justify-center mb-8">
                    <div className="flex w-fit items-center bg-muted p-1 rounded-lg">
                        <button onClick={handlePreviousWeek} className="btn border-0 btn-ghost btn-sm btn-circle"><ChevronLeft size={18} /></button>
                        <button onClick={handleThisWeek} className="btn border-0 btn-ghost btn-sm px-4 font-bold uppercase tracking-widest">
                            <span className="text-sm font-bold uppercase tracking-tight">
                            {format(currentWeekStart, 'MMM dd')} — {format(weekEnd, 'MMM dd')}
                        </span>
                        </button>
                        <button onClick={handleNextWeek} className="btn border-0 btn-ghost btn-sm btn-circle"><ChevronRight size={18} /></button>
                    </div>
                </div>

                <main className="relative min-h-[50vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {weekDates.map((date) => {
                            const key = format(date, 'yyyy-MM-dd');
                            const schedule = scheduleMap[key];

                            return (
                                <div key={key} className="h-full">
                                    <UpcomingMealCard
                                        date={date}
                                        schedule={schedule}
                                        dataLoading={dataLoading}
                                        refetch={refetch}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </main>
                <footer className="mt-16 text-center border-t border-base-300 pt-10">
                    <p className="text-sm text-base-content/30 font-black uppercase tracking-[0.2em]">
                        Deadlines are managed by the mess managers
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default UpcomingMeals;