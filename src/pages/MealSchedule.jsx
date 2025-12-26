import React, { useState } from 'react';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

// react-date-picker
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { format } from 'date-fns';
import MealCard from '../components/MealCard';

const MealSchedule = () => {
    const axiosSecure = useAxiosSecure()
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [shouldFetch, setShouldFetch] = useState(false);

    const { data: schedules, isLoading, refetch } = useQuery({
        queryKey: ['schedules'],
        queryFn: async () => {
            const response = await axiosSecure.get(`/managers/schedules?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`);
            return response.data.schedules;
        },
        enabled: shouldFetch, // Only fetch when this is true
    });

    const handleGenerate = async () => {
        try {
            await axiosSecure.post('/schedules/generate', {
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd')
            });
            alert('Schedules generated!');
            refetch();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            {
                isLoading
                    ?
                    <div className='skeleton w-10 h-10'></div>
                    :
                    <div className='flex flex-col gap-4'>
                        <div className='flex gap-50'>
                            <div className='flex gap-2'>
                                <label className='label'>Start Date</label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => {
                                        setStartDate(date)
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    className="input w-full"
                                    minDate={new Date()}
                                />
                            </div>
                            <div className='flex gap-2'>
                                <label className='label'>End Date</label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => {
                                        setEndDate(date)
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    className="input w-full"
                                    minDate={new Date()}
                                />
                            </div>
                            <button onClick={() => {
                                setShouldFetch(true)
                                refetch()
                            }} className='btn btn-primary'>Get Meal List</button>
                        </div>
                        <div className='flex p-4 flex-col gap-4'>
                            {
                                schedules?.map((schedule, index) => <MealCard key={index} schedule={schedule}></MealCard>)
                            }
                        </div>
                    </div>
            }
        </div>
    );
};

export default MealSchedule;