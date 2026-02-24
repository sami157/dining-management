import React, { useState } from 'react';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import MealCard from '../components/MealCard';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';
import { ChevronLeft, ChevronRight, Calendar, PlusCircle } from 'lucide-react'; // Optional: icon library

const MealSchedule = () => {
    const axiosSecure = useAxiosSecure();
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
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
                loading: 'Generating schedules...',
                success: 'Schedule ready!',
                error: 'Failed to generate.',
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
                loading: 'Updating...',
                success: 'Updated!',
                error: 'Update failed.',
            }
        )
    };

    return (
        <div className='max-w-6xl mx-auto p-4 md:p-6 lg:p-8 transition-all duration-300'>
            
            {/* Header Section */}
            <header className='flex flex-col gap-6 mb-8'>
                <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight text-base-content'>Meal Schedule</h1>
                        <p className='text-sm text-base-content/60'>Manage and review weekly meal plans</p>
                    </div>
                    
                    <button 
                        onClick={handleGenerateWeek} 
                        className='btn btn-primary btn-md shadow-sm normal-case'
                    >
                        <PlusCircle size={18} className="mr-2" />
                        Generate Week
                    </button>
                </div>

                {/* Navigation Card */}
                <div className='bg-base-200/50 rounded-2xl p-2 flex items-center justify-between border border-base-300'>
                    <button onClick={handlePreviousWeek} className='btn btn-ghost btn-circle sm:btn-md'>
                        <ChevronLeft size={20} />
                    </button>
                    
                    <div className='flex items-center gap-2 px-2'>
                        <Calendar size={16} className="text-primary hidden xs:block" />
                        <span className='font-medium text-sm md:text-base whitespace-nowrap'>
                            {format(currentWeekStart, 'MMM dd')} — {format(weekEnd, 'MMM dd, yyyy')}
                        </span>
                    </div>

                    <button onClick={handleNextWeek} className='btn btn-ghost btn-circle sm:btn-md'>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main className='relative min-h-100'>
                {isLoading ? (
                    <div className='absolute inset-0 flex items-center justify-center bg-base-100/50 z-10 rounded-xl'>
                        <Loading />
                    </div>
                ) : schedules && schedules.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                        {schedules.map((schedule, index) => (
                            <div key={schedule._id || index} className="group">
                                <MealCard
                                    schedule={schedule}
                                    onUpdate={handleUpdateSchedule}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center py-20 border-2 border-dashed border-base-300 rounded-3xl'>
                        <div className='bg-base-200 p-4 rounded-full mb-4'>
                            <Calendar size={32} className="opacity-20" />
                        </div>
                        <p className='text-base-content/50 font-medium'>No schedules found for this period</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MealSchedule;