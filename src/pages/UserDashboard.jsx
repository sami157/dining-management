import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addMonths, subMonths, lastDayOfMonth, startOfMonth, eachDayOfInterval } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const axiosSecure = useAxiosSecure();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const firstDate = startOfMonth(currentMonth);
    const lastDate = lastDayOfMonth(currentMonth);

    const dateArray = eachDayOfInterval({
        start: firstDate,
        end: lastDate
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const monthString = format(currentMonth, 'yyyy-MM');

    const { data, isLoading, refetch } = useQuery({
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
            return { available: false, registered: false, menu: '', canRegister: false, registrationId: null };
        }

        const meal = schedule.meals.find(m => m.mealType === mealType);

        if (!meal) {
            return { available: false, registered: false, menu: '', canRegister: false, registrationId: null };
        }

        return {
            available: meal.isAvailable,
            registered: meal.isRegistered,
            menu: meal.menu || '',
            canRegister: meal.canRegister,
            registrationId: meal.registrationId
        };
    };

    const handlePreviousMonth = () => {
        setCurrentMonth(prev => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => addMonths(prev, 1));
    };

    // Handle meal registration
    const handleMealClick = async (date, mealType, status) => {
        // If unavailable, do nothing
        if (!status.available) {
            toast.error('This meal is not available');
            return;
        }

        // If registered, cancel registration (no deadline check needed - if they could register, they can cancel)
        if (status.registered && status.registrationId) {
            toast.promise(
                axiosSecure.delete(`/users/meals/register/cancel/${status.registrationId}`)
                    .then(() => refetch()),
                {
                    loading: 'Cancelling registration...',
                    success: 'Registration cancelled',
                    error: 'Failed to cancel registration'
                }
            );
            return;
        }

        // For new registration, check deadline
        if (!status.canRegister) {
            toast.error('Deadline has passed');
            return;
        }

        // Register
        const dateStr = format(date, 'yyyy-MM-dd');
        toast.promise(
            axiosSecure.post('/users/meals/register', {
                date: dateStr,
                mealType: mealType
            }).then(() => refetch()),
            {
                loading: 'Registering...',
                success: 'Meal registered successfully',
                error: 'Failed to register meal'
            }
        );
    };

    // Meal Box Component
    const MealBox = ({ status, date, mealType }) => {
        let bgColor = 'bg-base-300'; // Unavailable (default)
        let title = 'Unavailable';
        let cursorClass = 'cursor-not-allowed';

        if (status.registered) {
            // Registered - always clickable to cancel
            bgColor = 'bg-primary/80';
            title = `Registered${status.menu ? ` - ${status.menu}` : ''} (Click to cancel)`;
            cursorClass = 'cursor-pointer hover:bg-primary';
        } else if (status.available) {
            // Available meal
            bgColor = 'bg-base-200';

            if (status.canRegister) {
                // Can register - clickable
                title = `Available${status.menu ? ` - ${status.menu}` : ''} (Click to register)`;
                cursorClass = 'cursor-pointer hover:bg-base-100';
            } else {
                // Deadline passed - not clickable
                title = `Not registered - Deadline passed${status.menu ? ` - ${status.menu}` : ''}`;
                cursorClass = 'cursor-not-allowed';
            }
        }

        return (
            <div
                className={`w-8 h-8 rounded ${bgColor} ${cursorClass} transition-colors duration-150`}
                title={title}
                onClick={() => handleMealClick(date, mealType, status)}
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
                    <span>Not registered</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 rounded bg-primary/80' />
                    <span>Registered</span>
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

                            return (
                                <tr key={index} className='hover'>
                                    {/* Date Column */}
                                    <td>
                                        <div className='flex flex-col'>
                                            <span className={`${format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? 'font-extrabold' : ''}`}>
                                                {format(date, 'dd-MM-yyyy')}
                                            </span>
                                            <span className='text-xs text-gray-500'>
                                                {format(date, 'EEEE')}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Meals Column - 3 boxes */}
                                    <td>
                                        <div className='flex gap-2 items-center'>
                                            <div className='flex flex-col items-center gap-1'>
                                                <MealBox
                                                    status={morningStatus}
                                                    date={date}
                                                    mealType="morning"
                                                />
                                                <span className='text-xs text-gray-500'>M</span>
                                            </div>
                                            <div className='flex flex-col items-center gap-1'>
                                                <MealBox
                                                    status={eveningStatus}
                                                    date={date}
                                                    mealType="evening"
                                                />
                                                <span className='text-xs text-gray-500'>E</span>
                                            </div>
                                            <div className='flex flex-col items-center gap-1'>
                                                <MealBox
                                                    status={nightStatus}
                                                    date={date}
                                                    mealType="night"
                                                />
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