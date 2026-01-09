import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import UpcomingMealCard from '../components/UpcomingMealCard';

const UpcomingMeals = () => {
  const axiosSecure = useAxiosSecure();
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const weekEnd = addDays(currentWeekStart,6)

  // Generate array of 7 days for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Fetch meal schedules for the week
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['weekSchedules', currentWeekStart],
    queryFn: async () => {
      const response = await axiosSecure.get(`/managers/schedules?startDate=${format(currentWeekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`);
      return response.data.schedules;
    },
  });

  // Fetch all registrations for the week
  const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
    queryKey: ['weekRegistrations', currentWeekStart],
    queryFn: async () => {
      const response = await axiosSecure.get(`/managers/registrations?startDate=${format(currentWeekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`);
      return response.data.registrations;
    },
  });

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  // Get schedule for a specific date
  const getScheduleForDate = (date) => {
    if (!schedulesData) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedulesData.find(s => format(new Date(s.date), 'yyyy-MM-dd') === dateStr);
  };

  if (schedulesLoading || registrationsLoading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    );
  }

  return (
    <div className='p-4 max-w-4/5 mx-auto'>
      {/* Header with Navigation */}
      <div className='flex flex-col justify-between items-center mb-4 gap-4'>
        <h1 className='text-3xl font-bold'>Upcoming Meals</h1>
        
        <div className='flex items-center gap-2'>
          <button onClick={handlePreviousWeek} className='btn btn-sm'>
            ← Previous
          </button>
          <button onClick={handleThisWeek} className='btn btn-sm btn-outline'>
            This Week
          </button>
          <button onClick={handleNextWeek} className='btn btn-sm'>
            Next →
          </button>
        </div>
      </div>

      {/* Week Range Display */}
      <div className='text-center mb-6'>
        <p className='text-xl font-semibold text-gray-600'>
          {format(currentWeekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
        </p>
      </div>

      {/* Responsive Grid of Meal Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {weekDates.map((date, index) => {
          const schedule = getScheduleForDate(date);
          
          return (
            <UpcomingMealCard
              key={index}
              date={date}
              schedule={schedule}
              registrations={registrationsData || []}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className='flex justify-center gap-6 mt-8 text-sm'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-success'></div>
          <span>Available</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded ring-4 ring-primary'></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default UpcomingMeals;