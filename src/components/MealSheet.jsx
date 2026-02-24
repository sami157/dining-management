import React, { useState } from 'react'
import useAxiosSecure from '../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import { format } from 'date-fns';
import Loading from './Loading';
import { UserSearch , UserCheck } from 'lucide-react'; // Modern icons

export const MealSheet = () => {
    const axiosSecure = useAxiosSecure()
    const { loading } = useAuth()
    const [searchTerm, setSearchTerm] = useState('');
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

    // Filtered users based on search
    const filteredUsers = usersData?.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.room?.toString().includes(searchTerm)
    );

    const isRegistered = (userId, mealType) => {
        if (!registrationsData) return false;
        return registrationsData.some(
            reg => reg.userId.toString() === userId.toString() && reg.mealType === mealType
        );
    };

    // Refined Meal indicator
    const MealBox = ({ userId, mealType }) => {
        const registered = isRegistered(userId, mealType);
        return (
            <div 
                className={`w-5 h-5 rounded-sm transition-all duration-300 border ${
                    registered 
                    ? 'bg-primary border-primary shadow-sm shadow-primary/30' 
                    : 'bg-base-300/30 border-base-300'
                }`} 
                title={mealType}
            />
        );
    };

    if (usersLoading || registrationsLoading) return <Loading />;

    return (
        <div className='flex flex-col h-full m-2 bg-base-100 rounded-xl overflow-hidden p-4 transition-all duration-300'>
            
            {/* Header & Search */}
            <div className='p-4 md:p-6 bg-base-200/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div>
                    <h1 className='text-xl font-bold flex items-center gap-2'>
                        <UserCheck className="text-primary" size={20} />
                        Daily Meal Sheet
                    </h1>
                    <p className='text-xs text-base-content/50 font-medium uppercase tracking-wider'>
                        {format(new Date(), 'EEEE, MMMM dd')}
                    </p>
                </div>

                <div className='w-full sm:w-64'>
                    <input 
                        type="text" 
                        placeholder="Search name or room..." 
                        className='input input-sm input-bordered w-full bg-base-100 focus:input-primary transition-all'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Legend - Helps user understand the boxes */}
            <div className='px-4 py-2 bg-base-300/40 flex gap-4 text-[10px] font-bold uppercase rounded-lg tracking-tighter text-base-content/60'>
                <div className='flex items-center gap-1.5'>
                    <div className='w-3 h-3 rounded bg-primary'></div> Registered
                </div>
                <div className='flex items-center gap-1.5'>
                    <div className='w-3 h-3 rounded bg-base-300'></div> Off
                </div>
                <div className='ml-auto hidden xs:block'>
                    M: Morning | E: Evening | N: Night
                </div>
            </div>

            {/* Table Area */}
            <div className='overflow-x-auto overflow-y-auto grow max-h-[70vh]'>
                <table className='table w-full'>
                    <thead className='sticky top-0 z-10'>
                        <tr className='bg-base-100'>
                            <th className='w-20 text-center font-bold'>Room</th>
                            <th>Name</th>
                            <th className='text-center'>
                                <div className='flex gap-5 justify-center'>
                                    <span className='w-5'>M</span>
                                    <span className='w-5'>E</span>
                                    <span className='w-5'>N</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className='text-sm'>
                        {filteredUsers?.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user._id} className='hover:bg-primary/5 transition-colors'>
                                    <td className='text-center font-mono font-medium text-base-content/60'>
                                        #{user.room || 'N/A'}
                                    </td>
                                    <td>
                                        <div className='font-semibold'>{user.name}</div>
                                    </td>
                                    <td>
                                        <div className='flex gap-5 justify-center py-1'>
                                            <MealBox userId={user._id} mealType='morning' />
                                            <MealBox userId={user._id} mealType='evening' />
                                            <MealBox userId={user._id} mealType='night' />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className='text-center py-10 text-base-content/40 italic'>
                                    No records found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary Footer */}
            {/* <div className='p-3 bg-base-200/50 text-center'>
                <p className='text-[10px] font-medium text-base-content/40 uppercase'>
                    Total Members: {usersData?.length || 0} | Showing: {filteredUsers?.length || 0}
                </p>
            </div> */}
        </div>
    )
}