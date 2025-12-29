import React, { useState, useEffect } from 'react';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import MealCard from '../components/MealCard';
import toast from 'react-hot-toast';

const MealSchedule = () => {
    const axiosSecure = useAxiosSecure();
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 })); // Sunday

    // Calculate week end date
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });

    const { data: schedules, isLoading, refetch } = useQuery({
        queryKey: ['schedules', currentWeekStart],
        queryFn: async () => {
            const response = await axiosSecure.get(`/managers/schedules?startDate=${format(currentWeekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`);
            return response.data.schedules;
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

    const handleGenerateWeek = async () => {
        toast.promise(
            async () => {
                await axiosSecure.post('/managers/schedules/generate', {
                    startDate: format(currentWeekStart, 'yyyy-MM-dd'),
                    endDate: format(weekEnd, 'yyyy-MM-dd')
                });
                refetch();
            },
            {
                loading: 'Schedule generation in progress',
                success: 'Schedule generated successfully',
                error: 'Schedule generation failed',
            }
        )
    }

const handleUpdateSchedule = async (scheduleId, updateData) => {
    try {
        await axiosSecure.put(`/managers/schedules/${scheduleId}`, updateData);
        refetch();
    } catch (error) {
        console.error('Error updating schedule:', error);
    }
};

return (
    // Card view
    <div className='p-4 flex flex-col gap-4'>
        {/* Week Navigation */}
        <div className='flex justify-between'>
            <div className='flex items-center gap-2'>
                <button onClick={handlePreviousWeek} className='btn btn-sm'>
                    ← Previous Week
                </button>
                <div className='text-center'>
                    <p className='font-semibold'>
                        {format(currentWeekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                    </p>
                </div>
                <button onClick={handleNextWeek} className='btn btn-sm'>
                    Next Week →
                </button>
            </div>
            <button onClick={handleGenerateWeek} className='btn btn-primary font-bold'>
                Generate Schedules
            </button>
        </div>

        {/* Loading State */}
        {isLoading && (
            <div className='loading loading-dots loading-xl'>
            </div>
        )}

        {/* Schedules Grid */}
        {schedules && schedules.length > 0 ? (
            <div className='grid grid-cols-1 gap-4'>
                {schedules.map((schedule, index) =>
                (
                    <MealCard
                        key={schedule._id || index}
                        schedule={schedule}
                        onUpdate={handleUpdateSchedule}
                    />
                ))}
            </div>
        ) : (
            !isLoading && (
                <div className='text-center py-8'>
                    <p className='text-gray-500'>No schedules found for this week</p>
                </div>
            )
        )}
    </div>
);
};

export default MealSchedule;