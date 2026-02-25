import React, { useState, useMemo } from 'react'
import useAxiosSecure from '../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import { format } from 'date-fns';
import Loading from './Loading';
import { UserSearch, UserCheck, Utensils, Sunrise, Sunset, Moon } from 'lucide-react';

export const MealSheet = () => {
    const axiosSecure = useAxiosSecure()
    const { loading } = useAuth()
    const [searchTerm, setSearchTerm] = useState('');
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // 1. Fetch all users
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['allUsers'],
        enabled: !loading,
        queryFn: async () => {
            const response = await axiosSecure.get('/users');
            return response.data.users;
        },
    });

    // 2. Fetch today's registrations
    const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
        queryKey: ['todayRegistrations'],
        enabled: !loading,
        queryFn: async () => {
            const response = await axiosSecure.get(`/managers/registrations?startDate=${todayStr}&endDate=${todayStr}`);
            return response.data.registrations;
        },
    });

    // 3. Calculate Totals for the Brackets
    const mealTotals = useMemo(() => {
        if (!registrationsData) return { morning: 0, evening: 0, night: 0 };
        return registrationsData.reduce((acc, reg) => {
            const qty = reg.numberOfMeals || 1;
            if (reg.mealType === 'morning') acc.morning += qty;
            if (reg.mealType === 'evening') acc.evening += qty;
            if (reg.mealType === 'night') acc.night += qty;
            return acc;
        }, { morning: 0, evening: 0, night: 0 });
    }, [registrationsData]);

    // 4. Filtering Logic
    const filteredUsers = usersData?.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.room?.toString().includes(searchTerm)
    );

    const getRegistration = (userId, mealType) => {
        if (!registrationsData) return null;
        return registrationsData.find(
            reg => (reg.userId?._id?.toString() || reg.userId?.toString()) === userId.toString() && reg.mealType === mealType
        );
    };

    // 5. Refined Meal indicator Component
    const MealBox = ({ userId, mealType }) => {
        const reg = getRegistration(userId, mealType);
        return (
            <div
                className={`w-7 h-7 rounded-md transition-all duration-300 border flex items-center justify-center font-bold text-lg ${reg
                    ? 'bg-primary border-primary text-white'
                    : 'bg-base-200/50 border-base-300 text-transparent'
                    }`}
                title={mealType}
            >
                {reg && (reg.numberOfMeals > 1 ? `${reg.numberOfMeals}` : null)}
            </div>
        );
    };

    return (
        <div className='flex flex-col m-2 rounded-lg overflow-hidden p-2 sm:p-4 transition-all duration-300 border border-base-300'>
            <div>
                {/* Header */}
                <div className='p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
                    <div>
                        <h1 className='text-xl font-black italic flex items-center gap-2 uppercase tracking-tighter'>
                            <Utensils className="text-primary" size={22} />
                            Daily Meal Sheet
                        </h1>
                        <p className='text-[10px] text-base-content/40 font-black uppercase tracking-widest'>
                            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className='w-full lg:w-64'>
                        <input
                            type="text"
                            placeholder="Search by Name/Room.."
                            className='input input-bordered w-full focus:input-primary font-semibold h-10 text-sm'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {
                    (usersLoading || registrationsLoading) ? (
                        // Loading Skeleton
                        <div className="skeleton space-y-4 p-4 bg-base-200/40 mx-auto w-[92vw] md:w-95 lg:w-135">
                            <div className='skeleton bg-base-300/50 w-full h-20 mb-4 rounded-lg'></div>
                            <div className='skeleton bg-base-300 w-full h-15 rounded-lg'></div>
                            <div className='skeleton bg-base-300 w-full h-15 rounded-lg'></div>
                            <div className='skeleton bg-base-300 w-full h-15 rounded-lg'></div>
                            <div className='skeleton bg-base-300 w-full h-15 rounded-lg'></div>
                            <div className='skeleton bg-base-300 w-full h-15 rounded-lg'></div>
                            <div className='skeleton bg-base-300 w-full h-15 rounded-lg'></div>
                            <div className='skeleton bg-base-300 w-full h-15 rounded-lg'></div>
                            <div className='skeleton bg-base-300 w-full h-15 rounded-lg'></div>
                            <div className='skeleton bg-base-300 w-full h-10 rounded-lg'></div>
                            <div className='skeleton bg-base-300 w-full h-15 rounded-lg'></div>
                        </div>
                    ) : (
                        // Table and Footer
                        <div>
                            <div className='overflow-x-auto h-100 md:h-screen grow border border-base-300'>
                                <table className='table p-2 w-full table-sm sm:table-md'>
                                    <thead className='rounded top-0'>
                                        <tr className='text-base-content/70'>
                                            <th className='text-center font-black uppercase'>Room</th>
                                            <th className='font-black uppercase'>Member</th>
                                            <th className='text-center py-4'>
                                                <div className='flex  gap-8 justify-center items-center'>
                                                    {/* M Column Header */}
                                                    <div className="flex flex-col justify-center items-center">
                                                        <span>M</span>
                                                        <span className=" font-bold text-lg rounded-md">{mealTotals.morning}</span>
                                                    </div>
                                                    {/* E Column Header */}
                                                    <div className="flex flex-col justify-center items-center">
                                                        <span>E</span>
                                                        <span className=" font-bold text-lg">{mealTotals.evening}</span>
                                                    </div>
                                                    {/* N Column Header */}
                                                    <div className="flex flex-col justify-center items-center">
                                                        <span>N</span>
                                                        <span className=" font-bold text-lg">{mealTotals.night}</span>
                                                    </div>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-sm'>
                                        {filteredUsers?.length > 0 ? (
                                            filteredUsers.map(user => (
                                                <tr key={user._id} className='group'>
                                                    <td className='text-center'>
                                                        <span className='bg-base-300/40 px-2 py-0.1 rounded text-xs font-black font-mono transition-colors'>
                                                            {user.room || '??'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className='font-bold text-base-content/80 transition-colors'>
                                                            {user.name}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex gap-4 justify-center py-1'>
                                                            <MealBox userId={user._id} mealType='morning' />
                                                            <MealBox userId={user._id} mealType='evening' />
                                                            <MealBox userId={user._id} mealType='night' />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className='text-center py-20'>
                                                    <div className='flex flex-col items-center opacity-10'>
                                                        <UserSearch size={64} />
                                                        <p className='mt-2 font-black uppercase tracking-[0.2em]'>No results</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                                <div className='p-3 flex justify-between items-center bg-base-200/70 border border-base-200 rounded-lg'>
                                    <div className='flex gap-4'>
                                        <div className='flex items-center gap-1.5 text-xs font-black opacity-50 uppercase'>
                                            <div className='w-2 h-2 rounded-full bg-primary'></div> Registered
                                        </div>
                                        <div className='flex items-center gap-1.5 text-xs font-black opacity-50 uppercase'>
                                            <div className='w-2 h-2 rounded-full bg-base-300'></div> Off
                                        </div>
                                    </div>
                                    <span className='text-sm font-semibold opacity-40 uppercase tracking-widest'>
                                        <span className='font-black text-lg'>{filteredUsers?.length || 0}</span> Members
                                    </span>
                                </div>
                        </div>

                    )
                }
            </div>
        </div>
    )
}