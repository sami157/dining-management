import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addMonths, subMonths, lastDayOfMonth, startOfMonth, eachDayOfInterval } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import { GiMeal } from 'react-icons/gi';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';
import { UserMonthlyStats } from '../components/UserDashboard/UserMonthlyStats';
import { ChevronLeft, ChevronRight, Utensils, Wallet, Plus, Minus, PenLine } from 'lucide-react';


const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const UserDashboard = () => {
    const axiosSecure = useAxiosSecure();
    const { user, loading } = useAuth()
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const firstDate = startOfMonth(currentMonth);
    const lastDate = lastDayOfMonth(currentMonth);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const dateArray = eachDayOfInterval({
        start: firstDate,
        end: lastDate
    });

    const [editingDate, setEditingDate] = useState(null);

    const today = getToday();
    const monthString = format(currentMonth, 'yyyy-MM');

    // Queries
    const { data: finalizationData, isLoading: finalizationLoading } = useQuery({
        queryKey: ['myFinalizationData', monthString],
        enabled: !loading,
        retry: false, // stop retrying on failure (this is why the console was flooding)
        throwOnError: false, // prevent crashing the component
        queryFn: async () => {
            const response = await axiosSecure.get(`/finance/user-finalization?month=${monthString}`);
            return response.data.finalization;
        }
    });

    const { data: depositData, isLoading: depositLoading } = useQuery({
        queryKey: ['userDeposit', monthString],
        retry: false, // stop retrying on failure (this is why the console was flooding)
        throwOnError: false, // prevent crashing the component
        enabled: !loading,
        queryFn: async () => {
            const response = await axiosSecure.get(`/finance/user-deposit?month=${monthString}`);
            return response.data;
        }
    });

    const { data, refetch } = useQuery({
        queryKey: ['userMeals', monthString],
        queryFn: async () => {
            const response = await axiosSecure.get(`/users/meals/available?month=${monthString}`);
            return response.data;
        }
    });

    const { data: mealCountData, isLoading: countLoading } = useQuery({
        queryKey: ['userMealsData', user?.email, monthString],
        queryFn: async () => {
            const response = await axiosSecure.get(`/users/meals/total/${user.email}?month=${monthString}`);
            return response.data;
        }
    });

    const scheduleMap = {};
    data?.schedules?.forEach(schedule => {
        const dateKey = format(new Date(schedule.date), 'yyyy-MM-dd');
        scheduleMap[dateKey] = schedule;
    });

    const getMealStatus = (date, mealType) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const schedule = scheduleMap[dateKey];
        if (!schedule) return { available: false, registered: false, numberOfMeals: 1 };

        const meal = schedule.meals.find(m => m.mealType === mealType);
        if (!meal) return { available: false, registered: false, numberOfMeals: 1 };

        return {
            available: meal.isAvailable,
            registered: meal.isRegistered,
            menu: meal.menu || '',
            // FIX: canRegister should ONLY depend on the deadline, 
            // not whether it's already registered.
            canRegister: meal.canRegister,
            registrationId: meal.registrationId,
            weight: meal.weight,
            numberOfMeals: meal.numberOfMeals || 1
        };
    };

    // Toggle Handlers (For the grid boxes)
    const handleMealClick = async (date, mealType, status) => {
        if (!status.available) {
            toast.error('This meal is not available');
            return;
        }

        if (status.registered && status.registrationId) {
            toast.promise(
                async () => {
                    await axiosSecure.delete(`/users/meals/register/cancel/${status.registrationId}`);
                    await refetch();
                },
                {
                    loading: 'Cancelling...',
                    success: 'Cancelled',
                    error: 'Failed to cancel'
                }
            );
            return;
        }

        if (!status.canRegister) {
            toast.error('Deadline has passed');
            return;
        }

        const dateStr = format(date, 'yyyy-MM-dd');
        toast.promise(
            async () => {
                await axiosSecure.post('/users/meals/register', { date: dateStr, mealType, numberOfMeals: 1 });
                await refetch();
            },
            {
                loading: 'Registering...',
                success: 'Registered',
                error: 'Failed to register'
            }
        );
    };

    // Modal Edit Handler (For the + / - buttons)
    const handleUpdateQty = async (registrationId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;

        toast.promise(
            async () => {
                await axiosSecure.patch(`/users/meals/register/${registrationId}`, {
                    numberOfMeals: newQty
                });
                await refetch();
            },
            {
                loading: 'Updating quantity...',
                success: `Updated to ${newQty}`,
                error: 'Failed to update'
            }
        );
    };

    const MealBox = ({ status, date, mealType }) => {
        let bgColor = 'bg-base-300';
        let cursorClass = 'cursor-not-allowed';

        if (status.registered) {
            bgColor = 'bg-primary/80';
            cursorClass = 'cursor-pointer hover:bg-primary';
        } else if (status.available) {
            bgColor = 'bg-base-200';
            cursorClass = status.canRegister ? 'cursor-pointer hover:bg-base-100' : 'cursor-not-allowed';
        }

        return (
            <div
                className={`w-7 flex items-center justify-center h-7 rounded ${bgColor} ${cursorClass} transition-colors duration-250 ease-in-out text-center font-semibold`}
                onClick={() => handleMealClick(date, mealType, status)}
            >
                {status.available && (status.registered && status.numberOfMeals > 1 ? `x${status.numberOfMeals}` : null)}
            </div>
        );
    };

    const showMenu = (date) => { setSelectedDate(date); setShowModal(true); }
    const closeModal = () => { setShowModal(false); setSelectedDate(null); }

    return (
        <div className='p-4 flex flex-col gap-4 items-center'>
            {/* Header / Stats Navigation */}
            <div className="w-full flex flex-col gap-8 mb-4">
                <div className='flex items-center justify-between bg-base-200 p-2 rounded-xl max-w-md mx-auto w-full'>
                    <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} className='p-3 hover:bg-base-200 rounded-full transition-all active:scale-95'>
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className='text-sm md:text-base font-bold uppercase'>{format(currentMonth, 'MMMM yyyy')}</h2>
                    <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className='p-3 hover:bg-base-200 rounded-full transition-all active:scale-95'>
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className='grid grid-cols-2 gap-4 max-w-2xl mx-auto'>
                    <div className='relative overflow-hidden bg-base-100 border border-base-300 p-6 rounded-2xl group transition-all hover:border-primary'>
                        <div className='flex items-center gap-3 mb-2'>
                            <div className='p-2 bg-primary/10 text-primary rounded-xl'><Utensils size={16} /></div>
                            <span className=' font-black text-xs md:text-lg uppercase tracking-widest opacity-40'>Total Meals</span>
                        </div>
                        {countLoading ? <Loading /> : <div className='text-3xl text-center font-black tracking-tighter'>{mealCountData?.totalMeals}</div>}
                    </div>

                    <div className='relative overflow-hidden bg-base-100 border border-base-300 p-6 rounded-2xl group transition-all hover:border-success'>
                        <div className='flex items-center gap-3 mb-2'>
                            <div className='p-2 bg-success/10 text-success rounded-xl'><Wallet size={16} /></div>
                            <span className=' font-black uppercase text-xs md:text-lg tracking-widest opacity-40'>Your Deposit</span>
                        </div>
                        {depositLoading ? <Loading /> : <div className='text-3xl text-center font-black tracking-tighter text-success'>৳{depositData?.deposit}</div>}
                    </div>
                </div>
            </div>

            <div className={`${finalizationData ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1 w-[90vw] md:w-2/5'}`}>
                <div className={`${!finalizationData && 'hidden'}`}>
                    <UserMonthlyStats finalizationData={finalizationData} finalizationLoading={finalizationLoading} />
                </div>

                <div className='flex flex-col gap-4 items-center'>
                    <p className='text-lg font-bold'>Meal Sheet</p>
                    <div className='flex gap-8 text-sm'>
                        <div className='flex items-center gap-2'><div className='w-4 h-4 rounded bg-base-200' /><span>Not registered</span></div>
                        <div className='flex items-center gap-2'><div className='w-4 h-4 rounded bg-primary/80' /><span>Registered</span></div>
                    </div>

                    <div className="max-w-[98vw]">
                        <table className="table table-xs md:table-auto overflow-x-auto max-w-[98vw] table-pin-rows">
                            <thead>
                                <tr>
                                    <th className='bg-base-300 text-center'>Date</th>
                                    <th className='bg-base-300 text-center'>Meals</th>
                                    <th className='bg-base-300 text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dateArray.map((date, index) => {
                                    const dateStr = format(date, 'yyyy-MM-dd');
                                    const isEditing = editingDate === dateStr;

                                    return (
                                        <tr key={index} className='hover transition-colors'>
                                            <td className="py-3">
                                                <div className='flex gap-4 items-center justify-center'>
                                                    <button
                                                        onClick={() => showMenu(date)}
                                                        className={`text-2xl transition-transform active:scale-90 ${scheduleMap[dateStr] ? 'text-base-content hover:text-primary cursor-pointer' : 'opacity-20 cursor-not-allowed'}`}
                                                        disabled={!scheduleMap[dateStr]}
                                                    >
                                                        <GiMeal />
                                                    </button>
                                                    <div className='flex flex-col'>
                                                        <span className={`text-sm ${dateStr === format(today, 'yyyy-MM-dd') ? 'font-black' : 'font-medium'}`}>
                                                            {format(date, 'dd MMM')}
                                                        </span>
                                                        <span className=' uppercase tracking-wider opacity-50'>{format(date, 'EEE')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className='flex justify-center gap-6 items-center'> {/* Increased gap slightly for vertical controls */}
                                                    {['morning', 'evening', 'night'].map(type => {
                                                        const status = getMealStatus(date, type);
                                                        const canEditQty = isEditing && status.registered;

                                                        return (
                                                            <div key={type} className='flex flex-col items-center gap-1.5'>
                                                                <div className="relative flex flex-col items-center">
                                                                    {/* VERTICAL FLOATING CONTROLS */}
                                                                    {canEditQty && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleUpdateQty(status.registrationId, status.numberOfMeals, 1)}
                                                                                // FIX: Removed !status.canRegister check here so it's not disabled 
                                                                                // if the meal is already registered or available
                                                                                disabled={!status.available}
                                                                                className="absolute -top-4 z-10 w-5 h-5 flex items-center justify-center bg-primary text-white rounded-full shadow-md border border-base-100 hover:scale-110 transition-transform disabled:opacity-50"
                                                                            >
                                                                                <Plus size={10} strokeWidth={4} />
                                                                            </button>

                                                                            <button
                                                                                onClick={() => handleUpdateQty(status.registrationId, status.numberOfMeals, -1)}
                                                                                // FIX: Only disable if qty is 1 or meal isn't available
                                                                                disabled={status.numberOfMeals <= 1 || !status.available}
                                                                                className="absolute -bottom-4 z-10 w-5 h-5 flex items-center justify-center bg-base-100 border-2 border-primary text-primary rounded-full shadow-md hover:scale-110 transition-transform disabled:opacity-30"
                                                                            >
                                                                                <Minus size={10} strokeWidth={4} />
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                    {/* ORIGINAL BOX */}
                                                                    <div>
                                                                        <MealBox status={status} date={date} mealType={type}></MealBox>
                                                                    </div>
                                                                </div>

                                                                <span className={`text-[9px] font-bold opacity-40 uppercase transition-all ${canEditQty ? 'mt-3' : ''}`}>
                                                                    {type[0]}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td>
                                                {/* EDIT TRIGGER */}
                                                <div className="ml-2 pl-3 border-l border-base-300">
                                                    {scheduleMap[dateStr] && (
                                                        <button
                                                            onClick={() => setEditingDate(isEditing ? null : dateStr)}
                                                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all border-2
                                    ${isEditing
                                                                    ? 'bg-primary border-primary text-white'
                                                                    : 'bg-base-100 border-base-300 text-base-content/30 hover:border-primary hover:text-primary'
                                                                }`}
                                                        >
                                                            <PenLine size={14} strokeWidth={3} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for Menu & Quantity Editing */}
            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-[98vw] md:w-100 p-0 overflow-hidden border border-base-300 shadow-2xl">
                        {/* Modal Header */}
                        <div className="bg-primary/10 p-6 text-center border-b border-base-300">
                            <h3 className="font-black text-xl text-primary flex flex-col gap-1">
                                <span className="text-xs uppercase tracking-[0.2em] opacity-60">Meal Schedule</span>
                                {selectedDate && format(selectedDate, 'EEEE, dd MMMM yyyy')}
                            </h3>
                        </div>

                        <div className="p-6 flex flex-col gap-4 bg-base-100">
                            {['morning', 'evening', 'night'].map((mealType) => {
                                const status = getMealStatus(selectedDate, mealType);
                                if (!status.available) return null;

                                return (
                                    <div
                                        key={mealType}
                                        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${status.registered
                                            ? 'bg-primary/3 border-primary/30 shadow-md'
                                            : 'bg-base-200/50 border-base-300'
                                            }`}
                                    >
                                        <div className="p-4 flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <h4 className="font-black text-lg capitalize tracking-tight flex items-center gap-2">
                                                        {mealType}
                                                        <div className="bg-base-300 px-2 py-1 rounded-xl text-xs font-semibold opacity-70">
                                                            Weight: {status.weight}
                                                        </div>
                                                    </h4>
                                                    {!status.canRegister && !status.registered && (
                                                        <span className=" text-error font-bold uppercase mt-1">Deadline Passed</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Menu section - only show if menu exists */}
                                            {status.menu ? (
                                                <div className="bg-base-100/50 rounded-xl p-3 border border-dashed border-base-300">
                                                    <p className="text-xs italic text-center text-base-content/70">
                                                        "{status.menu}"
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-center py-1">
                                                    <p className=" text-base-content/30 uppercase font-bold tracking-widest">No Menu Set</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={closeModal}></div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;