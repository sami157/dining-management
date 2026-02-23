import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import { MdAdminPanelSettings } from "react-icons/md";
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';

// ─── User Edit Modal ────────────────────────────────────────────────────────

const UserEditModal = ({ user, onClose, onSave }) => {
  const [role, setRole] = useState(user.role);
  const [fixedDeposit, setFixedDeposit] = useState(user.fixedDeposit ?? 1000);
  const [mosqueFee, setMosqueFee] = useState(user.mosqueFee ?? 300);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ userId: user._id, role, fixedDeposit: Number(fixedDeposit), mosqueFee: Number(mosqueFee), originalRole: user.role });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-md">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>

        <h3 className="font-bold text-lg mb-1">Edit User</h3>
        <p className="text-sm text-gray-500 mb-4">{user.name} — Room {user.room}</p>

        <div className="flex flex-col gap-4">
          {/* Role */}
          <div className="form-control">
            <label className="label"><span className="label-text font-semibold">Role</span></label>
            <select
              className="select select-bordered w-full"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Fixed Deposit */}
          <div className="form-control">
            <label className="label"><span className="label-text font-semibold">Fixed Deposit (৳)</span></label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={fixedDeposit}
              min={0}
              onChange={e => setFixedDeposit(e.target.value)}
            />
          </div>

          {/* Mosque Fee */}
          <div className="form-control">
            <label className="label"><span className="label-text font-semibold">Mosque Fee (৳)</span></label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={mosqueFee}
              min={0}
              onChange={e => setMosqueFee(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-sm" /> : 'Save Changes'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}><button>close</button></form>
    </dialog>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────

const MemberManagement = () => {
  const axiosSecure = useAxiosSecure();
  const { loading } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const [editingUser, setEditingUser] = useState(null);

  const { data: usersData, isLoading: usersLoading, refetch: userRefetch } = useQuery({
    queryKey: ['allUsers'],
    enabled: !loading,
    queryFn: async () => {
      const response = await axiosSecure.get('/users');
      return response.data.users;
    },
  });

  const { data: registrationsData, isLoading: registrationsLoading, refetch } = useQuery({
    queryKey: ['weekRegistrations', currentWeekStart],
    enabled: !loading,
    queryFn: async () => {
      const response = await axiosSecure.get(`/managers/registrations?startDate=${format(currentWeekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`);
      return response.data.registrations;
    },
  });

  const { data: schedulesData } = useQuery({
    queryKey: ['weekSchedules', currentWeekStart],
    enabled: !loading,
    queryFn: async () => {
      const response = await axiosSecure.get(`/managers/schedules?startDate=${format(currentWeekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`);
      return response.data.schedules;
    },
  });

  const handlePreviousWeek = () => setCurrentWeekStart(prev => addDays(prev, -7));
  const handleNextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7));
  const handleThisWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const isRegistered = (userId, date, mealType) => {
    if (!registrationsData) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return registrationsData.some(reg =>
      reg.userId.toString() === userId.toString() &&
      format(new Date(reg.date), 'yyyy-MM-dd') === dateStr &&
      reg.mealType === mealType
    );
  };

  const getRegistrationId = (userId, date, mealType) => {
    if (!registrationsData) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    const registration = registrationsData.find(reg =>
      (reg.userId?.toString() || reg.userId) === (userId?.toString() || userId) &&
      format(new Date(reg.date), 'yyyy-MM-dd') === dateStr &&
      reg.mealType === mealType
    );
    return registration?._id;
  };

  // ── Save handler for modal ──────────────────────────────────────────────
  const handleSaveUser = async ({ userId, role, fixedDeposit, mosqueFee, originalRole }) => {
    const promises = [];

    if (role !== originalRole) {
      promises.push(axiosSecure.put(`users/role/${userId}`, { role }));
    }
    promises.push(axiosSecure.put(`users/fixedDeposit/${userId}`, { fixedDeposit }));
    promises.push(axiosSecure.put(`users/mosqueFee/${userId}`, { mosqueFee }));

    await toast.promise(
      Promise.all(promises).then(() => userRefetch()),
      { loading: 'Saving...', success: 'User updated successfully', error: 'Failed to update user' }
    );
  };

  const isMealAvailable = (date, mealType) => {
    if (!schedulesData) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = schedulesData.find(s => format(new Date(s.date), 'yyyy-MM-dd') === dateStr);
    return schedule?.availableMeals?.find(m => m.mealType === mealType)?.isAvailable || false;
  };

  const handleMealToggle = async (userId, date, mealType) => {
    const registered = isRegistered(userId, date, mealType);
    const available = isMealAvailable(date, mealType);

    if (!available) return toast.error('This meal is not available');

    if (registered) {
      const registrationId = getRegistrationId(userId, date, mealType);
      if (!registrationId) return;
      toast.promise(
        async () => {
          await axiosSecure.delete(`/users/meals/register/cancel/${registrationId}`).then(() => refetch())
          await refetch();
        },
        { loading: 'Cancelling...', success: 'Registration cancelled', error: 'Failed to cancel' }
      );
    } else {
      const dateStr = format(date, 'yyyy-MM-dd');
      toast.promise(
        async () => {
          await axiosSecure.post('/users/meals/register', { userId, date: dateStr, mealType })
          await refetch();
        },
        { loading: 'Registering...', success: 'Meal registered', error: 'Failed to register' }
      );
    }
  };

  const MealBox = ({ userId, date, mealType }) => {
    const registered = isRegistered(userId, date, mealType);
    const available = isMealAvailable(date, mealType);

    let bgColor = 'bg-base-300';
    let cursorClass = '';
    if (available) {
      if (registered) { bgColor = 'bg-primary/80'; cursorClass = 'cursor-pointer hover:bg-primary'; }
      else { bgColor = 'bg-base-200'; cursorClass = 'cursor-pointer hover:bg-base-100'; }
    } else {
      bgColor = 'bg-none'; cursorClass = 'cursor-not-allowed';
    }

    return (
      <div
        className={`w-5 h-5 sm:w-6 sm:h-6 rounded ${bgColor} ${cursorClass} transition-colors`}
        onClick={() => available && handleMealToggle(userId, date, mealType)}
        title={registered ? 'Registered (Click to cancel)' : available ? 'Click to register' : 'Not available'}
      />
    );
  };

  if (usersLoading || registrationsLoading) return <Loading />;

  return (
    <div className='p-2 w-full mx-auto'>
      {/* Modal */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {/* Week Navigation */}
      <div className='flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2'>
        <div className='flex gap-2 flex-wrap'>
          <button onClick={handlePreviousWeek} className='btn btn-sm'>← Previous</button>
          <button onClick={handleThisWeek} className='btn btn-sm btn-outline'>This Week</button>
          <button onClick={handleNextWeek} className='btn btn-sm'>Next →</button>
        </div>
        <h2 className='text-lg sm:text-xl font-bold'>{format(currentWeekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}</h2>
      </div>

      {/* Legend */}
      <div className='flex gap-4 mb-4 text-xs sm:text-sm flex-wrap'>
        <div className='flex items-center gap-2'><div className='w-3 h-3 sm:w-4 sm:h-4 rounded bg-base-200' />Not registered</div>
        <div className='flex items-center gap-2'><div className='w-3 h-3 sm:w-4 sm:h-4 rounded bg-primary/80' />Registered</div>
        <div className='flex items-center gap-2'><div className='w-3 h-3 sm:w-4 sm:h-4 rounded bg-base-300' />Unavailable</div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='table table-pin-rows w-full'>
          <thead>
            <tr>
              <th className='bg-base-300 text-center'></th>
              <th className='bg-base-300'>User</th>
              <th className='bg-base-300 text-center'>
                <div><p>Fixed</p><p>Deposit</p></div>
              </th>
              <th className='bg-base-300 text-center'>
                <div><p>Mosque</p><p>Fee</p></div>
              </th>
              {weekDates.map((date, idx) => (
                <th key={idx} className='bg-base-300 text-center'>
                  <div className='flex flex-col items-center'>
                    <span className='font-bold text-xs sm:text-sm'>{format(date, 'EEE')}</span>
                    <span className='text-[8px] sm:text-xs'>{format(date, 'dd MMM')}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersData?.map(user => (
              <tr key={user._id} className='hover'>
                <td className={`mx-auto text-xl transition-colors duration-300 ease-in-out cursor-pointer ${user.role !== 'member' ? 'text-base-content' : 'text-base-content/40'}`}>
                  <MdAdminPanelSettings onClick={() => setEditingUser(user)} />
                </td>
                <td className='font-semibold'>
                  <div className='flex flex-col text-xs sm:text-sm'>
                    <span>{user.name}</span>
                    <span className='text-gray-500'>{user.room}</span>
                  </div>
                </td>
                <td><p className='text-center'>{user.fixedDeposit ?? 0}</p></td>
                <td><p className='text-center'>{user.mosqueFee ?? 0}</p></td>
                {weekDates.map((date, idx) => (
                  <td key={idx}>
                    <div className='flex gap-1 justify-center'>
                      <div className='flex flex-col items-center gap-1'>
                        <MealBox userId={user._id} date={date} mealType='morning' />
                        <span className='text-[7px] sm:text-[8px]'>M</span>
                      </div>
                      <div className='flex flex-col items-center gap-1'>
                        <MealBox userId={user._id} date={date} mealType='evening' />
                        <span className='text-[7px] sm:text-[8px]'>E</span>
                      </div>
                      <div className='flex flex-col items-center gap-1'>
                        <MealBox userId={user._id} date={date} mealType='night' />
                        <span className='text-[7px] sm:text-[8px]'>N</span>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!usersData || usersData.length === 0) && !loading && (
        <div className='text-center py-8 text-gray-500'>No users found</div>
      )}
    </div>
  );
};

export default MemberManagement;