import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import { MdAdminPanelSettings } from "react-icons/md";
import { Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';

// ─── User Edit Modal ────────────────────────────────────────────────────────
// ─── User Edit Modal (Mobile Optimized) ──────────────────────────────────────
const UserEditModal = ({ user, onClose, onSave }) => {
  const [role, setRole] = useState(user.role);
  const [fixedDeposit, setFixedDeposit] = useState(user.fixedDeposit ?? 1000);
  const [mosqueFee, setMosqueFee] = useState(user.mosqueFee ?? 300);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        userId: user._id,
        role,
        fixedDeposit: Number(fixedDeposit),
        mosqueFee: Number(mosqueFee),
        originalRole: user.role
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    // Added modal-bottom for mobile (slides up) and sm:modal-middle for desktop
    <dialog open className="modal modal-open">
      <div className="modal-box relative w-full max-w-md mx-auto border-t sm:border border-base-300 rounded-xl p-6">
        {/* Close button - larger touch target for mobile */}
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
          onClick={onClose}
        >✕</button>

        <h3 className="font-black text-xl mb-1 text-primary italic uppercase tracking-tight">
          Edit Member
        </h3>
        <p className="text-[10px] font-bold opacity-50 mb-6 uppercase tracking-widest">
          {user.name} — Room {user.room}
        </p>

        <div className="flex flex-col gap-5">
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-black uppercase text-[10px] opacity-70">Role</span>
            </label>
            <select
              className="select select-bordered w-full font-bold focus:outline-primary transition-all"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-black uppercase text-[10px] opacity-70">Fixed Deposit (৳)</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full font-bold focus:outline-primary"
              value={fixedDeposit}
              min={0}
              onChange={e => setFixedDeposit(e.target.value)}
            />
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-black uppercase text-[10px] opacity-70">Mosque Fee (৳)</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full font-bold focus:outline-primary"
              value={mosqueFee}
              min={0}
              onChange={e => setMosqueFee(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-action mt-8 flex flex-col-reverse sm:flex-row gap-2">
          <button
            className="btn btn-ghost w-full sm:w-auto font-bold uppercase"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary w-full sm:flex-1 font-black shadow-lg shadow-primary/20"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <span className="loading loading-spinner loading-sm" /> : 'SAVE UPDATES'}
          </button>
        </div>
      </div>
      {/* Backdrop for mobile tapping to close */}
      <form method="dialog" className="modal-backdrop bg-black/40" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
};

// Main Component 
const MemberManagement = () => {
  const axiosSecure = useAxiosSecure();
  const { loading } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const [requested, setRequested] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editingCell, setEditingCell] = useState(null);

  // Queries
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

  // ── Save handler for the User Modal ──────────────────────────────────────
  const handleSaveUser = async ({ userId, role, fixedDeposit, mosqueFee, originalRole }) => {
    const promises = [];
    if (role !== originalRole) promises.push(axiosSecure.put(`users/role/${userId}`, { role }));
    promises.push(axiosSecure.put(`users/fixedDeposit/${userId}`, { fixedDeposit }));
    promises.push(axiosSecure.put(`users/mosqueFee/${userId}`, { mosqueFee }));

    await toast.promise(
      Promise.all(promises).then(() => userRefetch()),
      { loading: 'Saving...', success: 'User updated successfully', error: 'Failed to update user' }
    );
  };

  // Helper functions
  const getRegistration = (userId, date, mealType) => {
    if (!registrationsData) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return registrationsData.find(reg =>
      (reg.userId?._id?.toString() || reg.userId?.toString()) === userId.toString() &&
      format(new Date(reg.date), 'yyyy-MM-dd') === dateStr &&
      reg.mealType === mealType
    );
  };

  const isMealAvailable = (date, mealType) => {
    if (!schedulesData) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = schedulesData.find(s => format(new Date(s.date), 'yyyy-MM-dd') === dateStr);
    return schedule?.availableMeals?.find(m => m.mealType === mealType)?.isAvailable || false;
  };

  const handleMealToggle = async (userId, date, mealType) => {
    setRequested(true)
    const reg = getRegistration(userId, date, mealType);
    const available = isMealAvailable(date, mealType);
    if (!available) return toast.error('Meal not available');

    if (reg) {
      toast.promise(
        axiosSecure.delete(`/users/meals/register/cancel/${reg._id}`).then(() => {
          refetch()
          setRequested(false)
        }),
        { loading: 'Cancelling...', success: 'Cancelled', error: 'Error' }
      );
    } else {
      toast.promise(
        axiosSecure.post('/users/meals/register', { userId, date: format(date, 'yyyy-MM-dd'), mealType, numberOfMeals: 1 }).then(() => {
          refetch()
          setRequested(false)
        }),
        { loading: 'Registering...', success: 'Registered', error: 'Error' }
      );
    }
  };

  const handleUpdateQty = async (registrationId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    toast.promise(
      axiosSecure.patch(`/users/meals/register/${registrationId}`, { numberOfMeals: newQty }).then(() => refetch()),
      { loading: 'Updating...', success: `Set to ${newQty}`, error: 'Error' }
    );
  };

  if (usersLoading || registrationsLoading) return <Loading />;

  return (
    <div className='p-4 md:w-full w-[99vw] mx-auto'>
      {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}

      <div className='flex flex-col md:flex-row justify-between items-center mb-8 gap-4'>
        <div className='flex items-center gap-2 bg-base-200 p-1 rounded-xl'>
          <button onClick={() => setCurrentWeekStart(prev => addDays(prev, -7))} className='p-2 hover:bg-base-300 rounded-lg transition-all'><ChevronLeft size={20} /></button>
          <span className='px-4 font-bold text-sm uppercase tracking-wide'>{format(currentWeekStart, 'dd MMM')} - {format(weekEnd, 'dd MMM')}</span>
          <button onClick={() => setCurrentWeekStart(prev => addDays(prev, 7))} className='p-2 hover:bg-base-300 rounded-lg transition-all'><ChevronRight size={20} /></button>
        </div>
        <h1 className='text-2xl font-black italic tracking-tight flex items-center gap-2'>
          <MdAdminPanelSettings className='text-primary' /> MEMBER MANAGEMENT
        </h1>
      </div>

      <div className='w-full overflow-x-auto rounded-lg bg-base-300'>
        <table className='table w-full'>
          <thead>
            <tr className='bg-base-300'>
              <th className='w-16 text-center'>Edit</th>
              <th>Member Details</th>
              {weekDates.map((date, idx) => (
                <th key={idx} className='text-center border-l border-base-300/50'>
                  <div className='flex flex-col'>
                    <span className='text-sm font-black'>{format(date, 'EEE')}</span>
                    <span className='text-sm opacity-50'>{format(date, 'dd MMM')}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersData?.map(user => (
              <tr key={user._id} className='hover:bg-base-200/40'>
                <td className='text-center'>
                  <button onClick={() => setEditingUser(user)} className='btn btn-ghost btn-sm btn-circle text-xl text-base-content/30 hover:text-primary'>
                    <MdAdminPanelSettings />
                  </button>
                </td>
                <td>
                  <div className='flex flex-col'>
                    <span className='font-bold text-sm'>{user.name}</span>
                    <span className='text-[10px] uppercase tracking-widest opacity-50'>{user.building.slice(0,1)}-{user.room}</span>
                    <span className='text-[10px] uppercase tracking-widest opacity-50'>Fixed Deposit: {user.fixedDeposit}</span>
                    <span className='text-[10px] uppercase tracking-widest opacity-50'>Mosque Fee: {user.mosqueFee}</span>
                  </div>
                </td>
                {weekDates.map((date, idx) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isEditingThis = editingCell?.userId === user._id && editingCell?.dateStr === dateStr;

                  return (
                    <td key={idx} className='border-l border-base-300/20'>
                      <div className='flex items-center justify-center gap-3'>
                        <div className='flex gap-1.5'>
                          {['morning', 'evening', 'night'].map(type => {
                            const reg = getRegistration(user._id, date, type);
                            const available = isMealAvailable(date, type);
                            const canEditQty = isEditingThis && reg;

                            return (
                              <div key={type} className='flex flex-col items-center gap-1'>
                                <div className='relative flex flex-col items-center'>
                                  {canEditQty && (
                                    <>
                                      <button onClick={() => handleUpdateQty(reg._id, reg.numberOfMeals || 1, 1)} className="absolute -top-4 z-10 w-4 h-4 flex items-center justify-center bg-primary text-white rounded-full shadow-md hover:scale-110 transition-transform"><Plus size={8} strokeWidth={4} /></button>
                                      <button onClick={() => handleUpdateQty(reg._id, reg.numberOfMeals || 1, -1)} disabled={(reg.numberOfMeals || 1) <= 1} className="absolute -bottom-4 z-10 w-4 h-4 flex items-center justify-center bg-base-100 border-2 border-primary text-primary rounded-full shadow-md hover:scale-110 transition-transform disabled:opacity-0"><Minus size={8} strokeWidth={4} /></button>
                                    </>
                                  )}
                                  <button
                                    disabled={requested}
                                    onClick={() => !isEditingThis && available && handleMealToggle(user._id, date, type)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-sm font-bold transition-all
                                                                            ${reg ? 'bg-primary text-white' : available ? 'bg-base-200 text-base-content/20' : 'bg-transparent text-transparent'} 
                                                                            ${available && !isEditingThis ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
                                                                            ${canEditQty ? 'scale-90 opacity-90' : ''}`}
                                  >
                                    {reg && (reg.numberOfMeals > 1 ? `x${reg.numberOfMeals}` : null)}
                                  </button>
                                </div>
                                <span className={`text-[7px] font-black opacity-30 ${canEditQty ? 'mt-3' : ''}`}>{type[0].toUpperCase()}</span>
                              </div>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => setEditingCell(isEditingThis ? null : { userId: user._id, dateStr })}
                          className={`w-6 h-6 flex items-center justify-center rounded-full transition-all border
                                                        ${isEditingThis ? 'bg-primary border-primary text-white rotate-45' : 'bg-base-100 border-base-300 text-base-content/20 hover:border-primary hover:text-primary'}`}
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberManagement;