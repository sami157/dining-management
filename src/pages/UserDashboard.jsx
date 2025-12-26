import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addMonths, subMonths } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';

const UserDashboard = () => {
    const axiosSecure = useAxiosSecure();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Format month as YYYY-MM
    const monthString = format(currentMonth, 'yyyy-MM');

    const { data, isLoading } = useQuery({
        queryKey: ['userMeals', monthString],
        queryFn: async () => {
            const response = await axiosSecure.get(`/users/meals/available?month=${monthString}`);
            console.log(response.data)
            return response.data;
        },
    });

    const handlePreviousMonth = () => {
        setCurrentMonth(prev => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => addMonths(prev, 1));
    };

    return (
        <div className='p-4'>
            {/* Month Navigation */}
            <div className='flex items-center justify-between mb-6'>
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

            {/* Loading */}
            {isLoading && (
                <div className='flex justify-center'>
                    <span className='loading loading-spinner loading-lg'></span>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;