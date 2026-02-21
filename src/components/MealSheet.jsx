import React from 'react'
import useAxiosSecure from '../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import { format } from 'date-fns';
import Loading from './Loading'; // make sure you have this component

export const MealSheet = () => {
    const axiosSecure = useAxiosSecure()
    const { loading } = useAuth()
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Fetch all users
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['allUsers'],
        enabled: !loading,
        queryFn: async () => {
            const response = await axiosSecure.get('/users');
            return response.data.users;
        },
    });

    // Fetch today's registrations
    const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
        queryKey: ['todayRegistrations'],
        enabled: !loading,
        queryFn: async () => {
            const response = await axiosSecure.get(`/managers/registrations?startDate=${todayStr}&endDate=${todayStr}`);
            return response.data.registrations;
        },
    });

    // Helper to check if a user is registered for a meal
    const isRegistered = (userId, mealType) => {
        if (!registrationsData) return false;
        return registrationsData.some(
            reg => reg.userId.toString() === userId.toString() && reg.mealType === mealType
        );
    };

    // Meal indicator box
    const MealBox = ({ userId, mealType }) => {
        const registered = isRegistered(userId, mealType);
        const bgColor = registered ? 'bg-primary/80' : 'bg-base-200';
        return (
            <div className={`w-6 h-6 sm:w-6 sm:h-6 rounded ${bgColor}`} />
        );
    };

    if (usersLoading || registrationsLoading) return <Loading />;

    return (
        <div className='overflow-y-auto max-h-screen p-4'>
            <table className='table table-pin-rows w-full'>
                <thead>
                    <tr>
                        <th className='bg-base-300 text-center'>#Room</th>
                        <th className='bg-base-300'>User</th>
                        <th className='bg-base-300 text-center'>Meals Today</th>
                    </tr>
                </thead>
                <tbody>
                    {usersData?.map(user => (
                        <tr key={user._id} className=''>
                            <td className='text-center'>{user.room}</td>
                            <td className='font-semibold'>
                                <div className='flex flex-col'>
                                    <span>{user.name}</span>
                                </div>
                            </td>
                            <td>
                                <div className='flex gap-3 justify-center'>
                                    <MealBox userId={user._id} mealType='morning' />
                                    <MealBox userId={user._id} mealType='evening' />
                                    <MealBox userId={user._id} mealType='night' />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
