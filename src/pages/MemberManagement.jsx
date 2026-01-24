import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import { MdAdminPanelSettings } from "react-icons/md";
import useAuth from '../hooks/useAuth';

const MemberManagement = () => {
  const axiosSecure = useAxiosSecure();
  const { loading } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });

  // Generate array of 7 days for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Fetch all users
  const { data: usersData, isLoading: usersLoading, refetch: userRefetch } = useQuery({
    queryKey: ['allUsers'],
    enabled: !loading,
    queryFn: async () => {
      const response = await axiosSecure.get('/users');
      return response.data.users;
    },
  });

  // Fetch all registrations for the week
  const { data: registrationsData, isLoading: registrationsLoading, refetch } = useQuery({
    queryKey: ['weekRegistrations', currentWeekStart],
    enabled: !loading,
    queryFn: async () => {
      const response = await axiosSecure.get(`/managers/registrations?startDate=${format(currentWeekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`);
      return response.data.registrations;
    },
  });

  // Fetch meal schedules for the week
  const { data: schedulesData } = useQuery({
    queryKey: ['weekSchedules', currentWeekStart],
    enabled: !loading,
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

  // Helper to check if user has registered for specific meal
  const isRegistered = (userId, date, mealType) => {
    if (!registrationsData) return false;

    const dateStr = format(date, 'yyyy-MM-dd');
    return registrationsData.some(reg =>
      reg.userId.toString() === userId.toString() &&
      format(new Date(reg.date), 'yyyy-MM-dd') === dateStr &&
      reg.mealType === mealType
    );
  };

  // Helper to get registration ID
  const getRegistrationId = (userId, date, mealType) => {
    if (!registrationsData) return null;

    const dateStr = format(date, 'yyyy-MM-dd');
    const registration = registrationsData.find(reg => {
      const regUserId = typeof reg.userId === 'object' ? reg.userId.toString() : reg.userId;
      const targetUserId = typeof userId === 'object' ? userId.toString() : userId;

      return regUserId === targetUserId &&
        format(new Date(reg.date), 'yyyy-MM-dd') === dateStr &&
        reg.mealType === mealType;
    });
    return registration?._id;
  };

  const handleRoleSwitch = (userId, role) => {
    let newRole = ''
    role === 'member'
      ? newRole = 'admin'
      : newRole = 'member'
    toast.promise(
      async () => {
        await axiosSecure.put(`users/role/${userId}`, { role: newRole })
        userRefetch()
      }
      ,
      {
        loading: 'Procesing...',
        success: 'Role updated sucessfully',
        error: 'Operation failed'
      }
    );
  };

  // Helper to check if meal is available on that date
  const isMealAvailable = (date, mealType) => {
    if (!schedulesData) return false;

    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = schedulesData.find(s =>
      format(new Date(s.date), 'yyyy-MM-dd') === dateStr
    );

    if (!schedule) return false;

    const meal = schedule.availableMeals.find(m => m.mealType === mealType);
    return meal?.isAvailable || false;
  };

  // Handle meal toggle (register/cancel)
  const handleMealToggle = async (userId, date, mealType) => {
    const registered = isRegistered(userId, date, mealType);
    const available = isMealAvailable(date, mealType);

    if (!available) {
      toast.error('This meal is not available');
      return;
    }

    if (registered) {
      // Cancel registration
      const registrationId = getRegistrationId(userId, date, mealType);
      if (!registrationId) return;

      toast.promise(
        axiosSecure.delete(`/users/meals/register/cancel/${registrationId}`)
          .then(() => refetch()),
        {
          loading: 'Cancelling...',
          success: 'Registration cancelled',
          error: 'Failed to cancel'
        }
      );
    } else {
      // Register meal
      const dateStr = format(date, 'yyyy-MM-dd');
      toast.promise(
        axiosSecure.post('/users/meals/register', {
          userId,
          date: dateStr,
          mealType
        }).then(() => refetch()),
        {
          loading: 'Registering...',
          success: 'Meal registered',
          error: 'Failed to register'
        }
      );
    }
  };

  // Meal Box Component
  const MealBox = ({ userId, date, mealType }) => {
    const registered = isRegistered(userId, date, mealType);
    const available = isMealAvailable(date, mealType);

    let bgColor = 'bg-base-300'; // Unavailable
    let cursorClass = '';

    if (available) {
      if (registered) {
        bgColor = 'bg-primary/80';
        cursorClass = 'cursor-pointer hover:bg-primary';
      } else {
        bgColor = 'bg-base-200';
        cursorClass = 'cursor-pointer hover:bg-base-100';
      }
    }

    return (
      <div
        className={`w-6 h-6 rounded ${bgColor} ${cursorClass} transition-colors`}
        onClick={() => available && handleMealToggle(userId, date, mealType)}
        title={registered ? 'Registered (Click to cancel)' : available ? 'Click to register' : 'Not available'}
      />
    );
  };

  if (usersLoading || registrationsLoading) {
    return (
      <div className='flex justify-center p-8'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    );
  }

  return (
    <div className='p-4 w-4/5 mx-auto'>
      {/* Week Navigation */}
      <div className='flex justify-between items-center mb-6'>
        <div className='flex gap-2'>
          <button onClick={handlePreviousWeek} className='btn btn-sm'>
            ← Previous
          </button>
          <button onClick={handleThisWeek} className='btn btn-sm btn-outline'>
            This Week
          </button>
          <button onClick={handleNextWeek} className='btn btn-sm'>
            Next →
          </button>
        </div>

        <h2 className='text-xl font-bold'>
          {format(currentWeekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
        </h2>
      </div>

      {/* Legend */}
      <div className='flex gap-4 mb-4 text-sm'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-base-200' />
          <span>Not registered</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-primary/80' />
          <span>Registered</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-base-300' />
          <span>Unavailable</span>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='table table-xs table-pin-rows'>
          <thead>
            <tr>
              <th className='bg-base-300 justify-center'></th>
              <th className='bg-base-300'>User</th>
              {weekDates.map((date, idx) => (
                <th key={idx} className='bg-base-300 text-center'>
                  <div className='flex flex-col'>
                    <span className='font-bold'>{format(date, 'EEE')}</span>
                    <span className='text-xs'>{format(date, 'dd MMM')}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersData?.map((user) => (
              <tr key={user._id} className='hover'>
                <td className={`${user.role === 'member' ? 'text-base-content/10' : 'text-base-content'} mx-auto text-2xl transition-colors duration-300 ease-in-out cursor-pointer`}><MdAdminPanelSettings onClick={() => handleRoleSwitch(user._id, user.role)} /></td>
                <td className='font-semibold'>
                  <div className='flex flex-col'>
                    <span>{user.name}</span>
                    <span className='text-xs text-gray-500'>{user.email}</span>
                  </div>
                </td>
                {weekDates.map((date, idx) => (
                  <td key={idx}>
                    <div className='flex gap-1 justify-center'>
                      <div className='flex flex-col items-center gap-1'>
                        <MealBox userId={user._id} date={date} mealType='morning' />
                        <span className='text-[8px]'>M</span>
                      </div>
                      <div className='flex flex-col items-center gap-1'>
                        <MealBox userId={user._id} date={date} mealType='evening' />
                        <span className='text-[8px]'>E</span>
                      </div>
                      <div className='flex flex-col items-center gap-1'>
                        <MealBox userId={user._id} date={date} mealType='night' />
                        <span className='text-[8px]'>N</span>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {
      loading ||
      (!usersData || usersData.length === 0) && (
        <div className='text-center py-8 text-gray-500'>
          No users found
        </div>
      )}
    </div>
  );
};

export default MemberManagement;