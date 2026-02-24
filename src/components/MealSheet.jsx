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
                className={`w-7 h-7 rounded-md transition-all duration-300 border flex items-center justify-center text-[10px] font-black ${reg
                        ? 'bg-primary border-primary text-white'
                        : 'bg-base-200/50 border-base-300 text-transparent'
                    }`}
                title={mealType}
            >
                {reg && (reg.numberOfMeals > 1 ? `x${reg.numberOfMeals}` : null)}
            </div>
        );
    };

    if (usersLoading || registrationsLoading) return <Loading />;

    return (
        <div className='flex flex-col h-full m-2 rounded-2xl overflow-hidden p-2 sm:p-4 transition-all duration-300 border border-base-300'>

            {/* Header Section */}
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
                <div className='w-full lg:w-64 relative'>
                    <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search name/room..."
                        className='input input-bordered w-full pl-10 focus:input-primary transition-all font-bold h-10 text-sm'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className='overflow-x-auto grow rounded-xl border border-base-300'>
                <table className='table w-full table-sm sm:table-md'>
                    <thead className='sticky top-0 z-20'>
                        <tr className='text-base-content'>
                            <th className='w-20 text-center font-black uppercase text-[10px] tracking-widest'>Room</th>
                            <th className='font-black uppercase text-[10px] tracking-widest'>Member Name</th>
                            <th className='text-center py-4'>
                                <div className='flex  gap-6 justify-center items-center'>
                                    {/* M Column Header */}
                                        <div className="flex items-center">
                                            <span>M</span>
                                            <span className=" font-bold px-1.5 rounded-md">({mealTotals.morning})</span>
                                        </div>
                                    {/* E Column Header */}
                                        <div className="flex items-center">
                                            <span>E</span>
                                            <span className=" font-bold px-1.5 rounded-md">({mealTotals.evening})</span>
                                        </div>
                                    {/* N Column Header */}
                                        <div className="flex items-center">
                                            <span>N</span>
                                            <span className=" font-bold px-1.5 rounded-md">({mealTotals.night})</span>
                                        </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className='text-sm'>
                        {filteredUsers?.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user._id} className='hover:bg-primary/5 transition-colors group'>
                                    <td className='text-center'>
                                        <span className='bg-base-300/40 px-2 py-0.5 rounded text-[10px] font-black font-mono group-hover:bg-primary/20 group-hover:text-primary transition-colors'>
                                            {user.room || '??'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className='font-bold text-base-content/80 group-hover:text-primary transition-colors'>
                                            {user.name}
                                        </div>
                                    </td>
                                    <td>
                                        <div className='flex gap-8 justify-center py-1'>
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

            {/* Simple Footer Legend */}
            <div className='p-3 flex justify-between items-center bg-base-200/30 rounded-b-xl border-t border-base-300'>
                <div className='flex gap-4'>
                    <div className='flex items-center gap-1.5 text-[9px] font-black opacity-50 uppercase'>
                        <div className='w-2 h-2 rounded-full bg-primary'></div> Registered
                    </div>
                    <div className='flex items-center gap-1.5 text-[9px] font-black opacity-50 uppercase'>
                        <div className='w-2 h-2 rounded-full bg-base-300'></div> Off
                    </div>
                </div>
                <span className='text-[9px] font-black opacity-30 uppercase tracking-widest'>
                    Displaying {filteredUsers?.length || 0} Members
                </span>
            </div>
        </div>
    )
}