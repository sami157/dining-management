import React, { useState } from 'react';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import MealCard from '../components/MealCard';
import toast from 'react-hot-toast';

const MealSchedule = () => {
    const axiosSecure = useAxiosSecure();
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 })); // Sunday
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });

    const { data: schedules, isLoading, refetch } = useQuery({
        queryKey: ['schedules', currentWeekStart],
        queryFn: async () => {
            const response = await axiosSecure.get(`/managers/schedules?startDate=${format(currentWeekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`);
            return response.data.schedules;
        },
    });

    const handlePreviousWeek = () => setCurrentWeekStart(prev => addDays(prev, -7));
    const handleNextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7));
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
        toast.promise(
            async () => {
                await axiosSecure.put(`/managers/schedules/${scheduleId}`, updateData);
                await refetch();
            },
            {
                loading: 'Schedule update in progress',
                success: 'Schedule updated successfully',
                error: 'Schedule update failed',
            }
        )
    };

    return (
        <div className='p-4 flex flex-col gap-4 mx-auto max-w-7xl'>

            {/* Week Navigation */}
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div className='flex flex-col sm:flex-row items-center gap-2 justify-center md:justify-start'>
                    <button onClick={handlePreviousWeek} className='btn btn-sm'>
                        ← Previous Week
                    </button>
                    <div className='text-center'>
                        <p className='font-semibold text-sm sm:text-base'>
                            {format(currentWeekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                        </p>
                    </div>
                    <button onClick={handleNextWeek} className='btn btn-sm'>
                        Next Week →
                    </button>
                </div>
                <button onClick={handleGenerateWeek} className='btn btn-primary btn-sm font-bold w-full sm:w-auto'>
                    Generate Schedules
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className='loading loading-dots loading-xl mx-auto my-4'></div>
            )}

            {/* Schedules Grid */}
            {schedules && schedules.length > 0 ? (
                <div className='grid grid-cols-1 gap-4'>
                    {schedules.map((schedule, index) => (
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
