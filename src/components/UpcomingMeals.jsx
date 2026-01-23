import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import UpcomingMealCard from '../components/UpcomingMealCard';

const UpcomingMeals = () => {
  const axiosSecure = useAxiosSecure();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    new Date()
  );

  const weekEnd = addDays(currentWeekStart, 6);

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  // ✅ USER-AWARE MEALS
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userMealsWeek', currentWeekStart],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/users/meals/available?startDate=${format(
          currentWeekStart,
          'yyyy-MM-dd'
        )}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`
      );
      return res.data;
    }
  });

  // Build map by date
  const scheduleMap = {};
  data?.schedules?.forEach((s) => {
    const key = format(new Date(s.date), 'yyyy-MM-dd');
    scheduleMap[key] = s;
  });

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Upcoming Meals</h1>

        <div className="flex gap-2">
          <button onClick={handlePreviousWeek} className="btn btn-sm">
            ← Previous
          </button>
          <button onClick={handleThisWeek} className="btn btn-sm btn-outline">
            This Week
          </button>
          <button onClick={handleNextWeek} className="btn btn-sm">
            Next →
          </button>
        </div>
      </div>

      {/* Week range */}
      <p className="text-center text-lg font-semibold text-gray-600 mb-6">
        {format(currentWeekStart, 'MMM dd')} –{' '}
        {format(weekEnd, 'MMM dd, yyyy')}
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {weekDates.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const schedule = scheduleMap[key];

          return (
            <UpcomingMealCard
              key={key}
              date={date}
              schedule={schedule}
              refetch={refetch}
            />
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingMeals;
