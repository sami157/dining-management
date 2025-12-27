import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addMonths, subMonths, lastDayOfMonth, startOfMonth, eachDayOfInterval } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';

const UserDashboard = () => {
    const axiosSecure = useAxiosSecure();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const firstDate = startOfMonth(currentMonth);
    const lastDate = lastDayOfMonth(currentMonth);

    const dateArray = eachDayOfInterval({
        start: firstDate,
        end: lastDate
    });

    const monthString = format(currentMonth, 'yyyy-MM');

    const { data, isLoading } = useQuery({
        queryKey: ['userMeals', monthString],
        queryFn: async () => {
            const response = await axiosSecure.get(`/users/meals/available?month=${monthString}`);
            return response.data;
        },
    });

    // Create a map of schedules by date for quick lookup
    const scheduleMap = {};
    data?.schedules?.forEach(schedule => {
        const dateKey = format(new Date(schedule.date), 'yyyy-MM-dd');
        scheduleMap[dateKey] = schedule;
    });

    // Helper function to get meal status
    const getMealStatus = (date, mealType) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const schedule = scheduleMap[dateKey];

        if (!schedule) {
            return { available: false, registered: false, menu: '' };
        }

        const meal = schedule.meals.find(m => m.mealType === mealType);

        if (!meal) {
            return { available: false, registered: false, menu: '' };
        }

        return {
            available: meal.isAvailable,
            registered: meal.isRegistered,
            menu: meal.menu || ''
        };
    };

    const handlePreviousMonth = () => {
        setCurrentMonth(prev => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => addMonths(prev, 1));
    };

    // Meal Box Component
    const MealBox = ({ status }) => {
        let bgColor = 'bg-base-300'; // Unavailable (default)
        let title = 'Unavailable';

        if (status.registered) {
            bgColor = 'bg-base-200'; // Registered
            title = `Registered${status.menu ? ` - ${status.menu}` : ''}`;
        } else if (status.available) {
            bgColor = 'bg-base-200'; // Available
            title = `Available${status.menu ? ` - ${status.menu}` : ''}`;
        }

        return (
            <div
                className={`w-8 h-8 rounded ${bgColor}`}
                title={title}
            />
        );
    };

    return (
        <div className='p-4 flex flex-col gap-4 items-center'>
            {/* Month Navigation */}
            <div className='flex items-center justify-between gap-8'>
                <button onClick={handlePreviousMonth} className='btn btn-sm'>
                    ← Previous
                </button>

                <h2 className='text-2xl font-bold'>
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>

                <button onClick={handleNextMonth} className='btn btn-sm'>
                    Next →
                </button>
            </div>

            {/* Legend */}
            <div className='flex gap-4 mb-4 text-sm'>
                <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 rounded bg-base-200' />
                    <span>Available</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 rounded bg-primary/80' />
                    <span>Registered</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 rounded bg-base-300' />
                    <span>Unavailable</span>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className='flex justify-center'>
                    <span className='loading loading-spinner loading-lg'></span>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto max-h-150">
                <table className="table table-pin-rows">
                    {/* Sticky Head */}
                    <thead>
                        <tr>
                            <th className='bg-base-300'>Date</th>
                            <th className='bg-base-300'>Meals</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dateArray.map((date, index) => {
                            const morningStatus = getMealStatus(date, 'morning');
                            const eveningStatus = getMealStatus(date, 'evening');
                            const nightStatus = getMealStatus(date, 'night');
                            const schedule = scheduleMap[format(date, 'yyyy-MM-dd')];

                            return (
                                <tr key={index} className='hover'>
                                    {/* Date Column */}
                                    <td>
                                        <div className='flex flex-col'>
                                            <span className='font-semibold'>
                                                {format(date, 'dd-MM-yyyy')}
                                            </span>
                                            <span className='text-xs text-gray-500'>
                                                {format(date, 'EEEE')}
                                            </span>
                                            {schedule?.isHoliday && (
                                                <span className='badge badge-secondary badge-xs mt-1'>
                                                    Holiday
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Meals Column - 3 boxes */}
                                    <td>
                                        <div className='flex gap-2 items-center'>
                                            <div className='flex flex-col items-center gap-1'>
                                                <MealBox status={morningStatus} />
                                                <span className='text-xs text-gray-500'>M</span>
                                            </div>
                                            <div className='flex flex-col items-center gap-1'>
                                                <MealBox status={eveningStatus} />
                                                <span className='text-xs text-gray-500'>E</span>
                                            </div>
                                            <div className='flex flex-col items-center gap-1'>
                                                <MealBox status={nightStatus} />
                                                <span className='text-xs text-gray-500'>N</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserDashboard;