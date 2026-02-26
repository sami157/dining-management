import React, { useState, useMemo } from 'react'
import useAxiosSecure from '../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import { addDays, format } from 'date-fns';
import Loading from './Loading';
import { UserSearch, ArrowRightLeft, Utensils } from 'lucide-react';

export const MealSheet = () => {
    const axiosSecure = useAxiosSecure()
    const { loading } = useAuth()
    const [searchTerm, setSearchTerm] = useState('');
    const [tomorrow, setTomorrow] = useState(false)
    const [day, setDay] = useState(new Date());
    const todayStr = format(day, 'yyyy-MM-dd');

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
    const { data: registrationsData, isLoading: registrationsLoading, refetch: refetchRegistrations } = useQuery({
        queryKey: ['todayRegistrations',todayStr],
        enabled: !loading,
        queryFn: async () => {
            const response = await axiosSecure.get(`/managers/registrations?startDate=${todayStr}&endDate=${todayStr}`);
            return response.data.registrations;
        },
    });

    const handleTomorrowToggle = () => {
        if (tomorrow) {
            setDay(new Date());
            setTomorrow(false);
        } else {
            setDay(addDays(new Date(), 1));
            setTomorrow(true);
        }
        refetchRegistrations();
    }

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
        <div className='flex flex-col rounded-lg overflow-auto sm:p-4 transition-all duration-300 border border-base-300'>
            <div>
                {/* Header */}
                <div className='p-2 flex flex-col lg:flex-row justify-center lg:items-center gap-6'>
                    <div className='flex justify-between gap-4'>
                        <div className='flex gap-2 items-center'>
                            <Utensils className="text-primary" size={40} />
                            <div className='text-xl min-w-60 font-black italic flex flex-col uppercase tracking-tighter'>
                                Daily Meal Sheet
                                <p className='text-xs text-base-content/40 font-black uppercase transition-all tracking-widest'>
                                    {format(day, 'EEEE, MMMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                        <ArrowRightLeft onClick={handleTomorrowToggle} className='text-primary hover:scale-105 cursor-pointer px-2 py-1 bg-base-200/50 rounded-lg' size={40} />
                    </div>

                    {/* Search Input */}
                    <div className='w-full lg:w-64'>
                        <input
                            type="text"
                            placeholder="Search by Name/Room.."
                            className='input w-full input-bordered focus:input-primary font-semibold h-10 text-sm'
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
                            <div className='space-y-2'>
                                <div className='overflow-x-auto h-95 md:h-screen grow border border-base-300 mask-b-from-95% mask-b-to-100%'>
                                <table className='table p-2 w-full table-sm sm:table-md'>
                                    <thead className='rounded top-0'>
                                        <tr className='text-base-content/70'>
                                            <th className='text-center font-black uppercase'>Room</th>
                                            <th className='font-black uppercase'>Member</th>
                                            <th className='text-center py-4'>
                                                <div className='flex  gap-8 justify-center items-center'>
                                                    {/* M Column Header */}
                                                    <div className="flex flex-col font-black justify-center items-center">
                                                        <span>M</span>
                                                        <span className=" font-bold text-lg rounded-md">{mealTotals.morning}</span>
                                                    </div>
                                                    {/* E Column Header */}
                                                    <div className="flex flex-col font-black justify-center items-center">
                                                        <span>E</span>
                                                        <span className=" font-bold text-lg">{mealTotals.evening}</span>
                                                    </div>
                                                    {/* N Column Header */}
                                                    <div className="flex flex-col font-black justify-center items-center">
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
                                                        <span className='rounded text-xs font-semibold text-center'>
                                                            {
                                                                `${user.building.slice(0, 1).toUpperCase()}-${user.room}`
                                                            }
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
                            <div className='px-2 py-2 mx-3 flex justify-between items-center bg-base-200/70 border border-base-200 rounded-lg'>
                                <div className='flex gap-8'>
                                    <div className='flex items-center gap-1.5 text-xs font-black uppercase'>
                                        <div className='w-2 h-2 rounded-full bg-primary'></div><span className='opacity-50'>Registered</span>
                                    </div>
                                    <div className='flex items-center gap-1.5 text-xs font-black uppercase'>
                                        <div className='w-2 h-2 rounded-full bg-base-300'></div><span className='opacity-50'>Off</span>
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