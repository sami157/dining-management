import React, { useState, useMemo } from 'react'
import useAxiosSecure from '../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import { addDays, format, set, isSameDay } from 'date-fns';
import { UserSearch, Utensils } from 'lucide-react';
import GeneralInfo from './GeneralInfo';
import { getMealShortLabel } from '../utils/mealTypes';
import { Input } from './ui/input';

export const MealSheet = () => {
    const axiosSecure = useAxiosSecure()
    const { loading } = useAuth()
    const [searchTerm, setSearchTerm] = useState('');
    const getInitialDay = () => {
        const now = new Date();
        const threshold = set(now, {
            hours: 22,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
        });

        return now >= threshold ? addDays(now, 1) : now;
    };
    const [day, setDay] = useState(getInitialDay);
    const todayStr = format(day, 'yyyy-MM-dd');
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const isTodayActive = isSameDay(day, today);
    const isTomorrowActive = isSameDay(day, tomorrow);


    // 1. Fetch all users
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['allUsers'],
        enabled: !loading,
        queryFn: async () => {
            const response = await axiosSecure.get('/users');
            return response.data.users;
        },
    });

    const managers = usersData?.filter(user => user.role === 'admin' && user.name !== 'Kawsar Molla' && user.name !== 'Tanzir Ahmed Sami') || [];

    // 2. Fetch today's registrations
    const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
        queryKey: ['todayRegistrations', todayStr],
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
            reg => (reg.userId?._id?.toString() || reg.userId?.toString()) === userId?.toString() && reg?.mealType === mealType
        );
    };

    const SkeletonRow = () => {
        return (
            <tbody className='text-sm animate-pulse text-base-200/40'>
                <tr className='h-15 group'>
                    <td>
                        <span className='h-12 py-2 px-6 bg-base-200/40 rounded-lg animate-pulse'></span>
                    </td>
                    <td>
                        <span className='h-12 py-2 px-12 lg:px-20 text-left bg-base-200/40 rounded-lg animate-pulse'></span>
                    </td>
                    <td className='w-full h-15 flex gap-5 justify-center py-1 items-center'>
                        <MealBox />
                        <MealBox />
                        <MealBox />
                    </td>
                </tr>
            </tbody>
        )
    }

    // 5. Refined Meal indicator Component
    const MealBox = ({ userId, mealType }) => {
        const reg = getRegistration(userId, mealType);
        return (
            <div
                className={`w-7 h-7 rounded-md transition-all duration-500 flex items-center justify-center font-bold text-lg ${reg
                    ? 'bg-primary border-primary text-white'
                    : 'bg-muted text-transparent'
                    } ${registrationsLoading && 'animate-wiggle border border-dashed border-primary bg-background'
                    }`}
                title={mealType}
            >
                {reg && (reg.numberOfMeals > 1 ? `${reg.numberOfMeals}` : null)}
            </div>
        );
    };

    return (
        <div className='flex w-[99vw] md:w-120 flex-col rounded-lg p-2 md:p-6 transition-all duration-300'>
            <div>
                {/* Header */}
                <div className='p-2 flex flex-col justify-center gap-6'>
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                        <div className='flex min-w-0 gap-2 items-center'>
                            <Utensils className="text-primary" size={40} />
                            <div className='min-w-0 flex-1 text-xl font-black italic flex flex-col uppercase tracking-tighter'>
                                Daily Meal Sheet
                                <p className='text-xs text-base-content/40 font-black uppercase transition-all tracking-widest'>
                                    {format(day, 'EEEE, MMMM dd, yyyy')}
                                </p>
                            </div>
                        </div>

                        {/* Datepicker */}
                        <div className='flex items-center gap-2'>
                            <button
                                type='button'
                                onClick={() => setDay(today)}
                                className={`rounded-md px-3 py-2 text-left transition-all ${isTodayActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'text-base-content/70 hover:bg-base-100'
                                    }`}
                            >
                                <div className='font-semibold normal-case tracking-normal'>
                                    {format(today, 'dd MMM, EEE')}
                                </div>
                            </button>
                            <button
                                type='button'
                                onClick={() => setDay(tomorrow)}
                                className={`rounded-md px-3 py-2 text-left transition-all ${isTomorrowActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'text-base-content/70 hover:bg-base-100'
                                    }`}
                            >
                                <div className='font-semibold normal-case tracking-normal'>
                                    {format(tomorrow, 'dd MMM, EEE')}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className='w-full'>
                        <Input
                            type="text"
                            placeholder="Search by Name/Room.."
                            className='w-full rounded-md'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                {/* Table and Footer */}
                <div className='space-y-2'>
                    <div className='overflow-x-auto h-95 md:h-screen grow mask-b-from-98% mask-b-to-100%'>
                        <table className='table table-sm'>
                            <thead className='rounded top-0'>
                                <tr className='text-base-content/70'>
                                    <th className='font-black uppercase'>Room</th>
                                    <th className='font-black uppercase'>Member</th>
                                    <th className='py-2'>
                                        <div className='flex gap-6 items-center justify-center'>
                                            {/* Breakfast Column Header */}
                                            <div className="flex flex-col font-black justify-center items-center">
                                                <span>{getMealShortLabel('morning')}</span>
                                                {
                                                    registrationsLoading || usersLoading ? (
                                                        <span className="h-6 w-6 bg-base-200/40 rounded-md p-1 animate-wiggle"></span>
                                                    ) : (
                                                        <span className=" font-bold text-lg rounded-md">{mealTotals?.morning < 1 ? <span className='text-transparent'>00</span> : mealTotals?.morning}</span>
                                                    )
                                                }
                                            </div>
                                            {/* Lunch Column Header */}
                                            <div className="flex flex-col font-black justify-center items-center">
                                                <span>{getMealShortLabel('evening')}</span>
                                                {
                                                    registrationsLoading || usersLoading ? (
                                                        <span className="h-6 w-6 bg-base-200/40 rounded-md p-1 animate-wiggle"></span>
                                                    ) : (
                                                        <span className=" font-bold text-lg rounded-md">{mealTotals?.evening < 1 ? <span className='text-transparent'>0</span> : mealTotals?.evening}</span>
                                                    )
                                                }
                                            </div>
                                            {/* Dinner Column Header */}
                                            <div className="flex flex-col font-black justify-center items-center">
                                                <span>{getMealShortLabel('night')}</span>
                                                {
                                                    registrationsLoading || usersLoading ? (
                                                        <span className="h-6 w-6 bg-base-200/40 rounded-md p-1 animate-wiggle"></span>
                                                    ) : (
                                                        <span className=" font-bold text-lg rounded-md">{mealTotals?.night < 1 ? <span className='text-transparent'>0</span> : mealTotals?.night}</span>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            {
                                // Loading skeleton for user list
                                usersLoading ? (
                                    <>
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                    </>
                                ) : (
                                    <tbody className='text-sm'>
                                        {
                                            filteredUsers?.length > 0 ? (
                                                filteredUsers.map(user => (
                                                    <tr key={user._id} className='group'>
                                                        <td className='text-center'>
                                                            <span className='rounded text-xs tracking-tighter text-center'>
                                                                {
                                                                    `${user.building.slice(0, 1).toUpperCase()}-${user.room}`
                                                                }
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className='tracking-tight text-base-content/80 transition-colors'>
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
                                )
                            }
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
                    <GeneralInfo managerList={managers} isLoading={usersLoading} />
                </div>
            </div>
        </div>
    )
}
