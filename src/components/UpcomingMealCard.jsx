import { format } from 'date-fns';
import { Utensils, CheckCircle2, Circle, Plus, Minus } from 'lucide-react'; // Added Plus, Minus
import toast from 'react-hot-toast';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useAuth from '../hooks/useAuth';

const UpcomingMealCard = ({ date, schedule = {}, dataLoading, refetch }) => {
    const axiosSecure = useAxiosSecure();
    const { loading } = useAuth();

    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const meals = schedule?.meals || [];
    const dateStr = format(date, 'yyyy-MM-dd');

    const handleMealAction = async (meal) => {
        if (meal.isRegistered && meal.registrationId) {
            toast.promise(
                axiosSecure.delete(`/users/meals/register/cancel/${meal.registrationId}`).then(() => refetch()),
                {
                    loading: 'Cancelling...',
                    success: 'Registration removed',
                    error: 'Failed to cancel'
                }
            );
            return;
        }

        if (!meal.canRegister) {
            toast.error('Registration deadline passed', { icon: '🚫' });
            return;
        }

        toast.promise(
            axiosSecure.post('/users/meals/register', {
                date: dateStr,
                mealType: meal.mealType,
                numberOfMeals: 1 // Default to 1
            }).then(() => refetch()),
            {
                loading: 'Registering...',
                success: 'Meal booked!',
                error: 'Registration failed'
            }
        );
    };

    // New handler for quantity updates
    const handleUpdateQty = async (registrationId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;

        toast.promise(
            axiosSecure.patch(`/users/meals/register/${registrationId}`, {
                numberOfMeals: newQty
            }).then(() => refetch()),
            {
                loading: 'Updating quantity...',
                success: `Updated to ${newQty}`,
                error: 'Failed to update'
            }
        );
    };

    if (loading) return null;

    return (
        <div className={`h-full w-[94vw] md:w-100 bg-base-100 border ${isToday ? 'border-primary' : 'border-base-300'} rounded-2xl overflow-hidden transition-all duration-500 ease-in-out`}>
            <div className="p-6 flex flex-col h-full">

                {/* Card Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className={`text-2xl font-black tracking-tighter italic uppercase ${isToday ? 'text-primary' : ''}`}>
                                {format(date, 'EEEE')}
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                {format(date, 'dd MMMM yyyy')}
                            </p>
                        </div>
                        {isToday && (
                            <span className="badge badge-primary font-black text-[9px] tracking-widest rounded-full px-3 py-3 border-none">
                                TODAY
                            </span>
                        )}
                    </div>
                </div>

                {/* Meals List */}
                <div className="grow space-y-6">
                    {
                        dataLoading
                            ? <div className='space-y-6'>
                                <div className='skeleton w-88 h-32'></div>
                                <div className='skeleton w-88 h-32'></div>
                                <div className='skeleton w-88 h-32'></div>
                            </div>
                            : meals.length > 0 
                            ? 
                            (
                                meals.map((meal) => {
                                    const isReg = meal.isRegistered;

                                    return (
                                        <div
                                            key={meal.mealType}
                                            className={`relative min-h-32 group rounded-xl border transition-all duration-300 overflow-hidden ${isReg ? 'bg-primary/5 border-primary/30' : 'bg-base-200/50 border-base-300'
                                                }`}
                                        >
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl ${isReg ? 'bg-primary text-white' : 'bg-base-100 border border-base-300'}`}>
                                                            <Utensils size={16} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                                {meal.mealType}
                                                                {meal.weight && <span className="opacity-40 text-[9px] font-bold">({meal.weight})</span>}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    {/* Action Area: Qty Controls + Toggle */}
                                                    {/* Action Area: Qty Controls + Toggle */}
                                                    <div className="flex items-center gap-3">
                                                        {isReg && (
                                                            <div className="flex items-center gap-1 bg-base-100 p-1 rounded-lg border border-base-300 shadow-sm">
                                                                <button
                                                                    type="button" // Explicitly set type to prevent form issues
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // Prevent triggering parent clicks
                                                                        handleUpdateQty(meal.registrationId, meal.numberOfMeals, -1);
                                                                    }}
                                                                    // CHANGE: Allow clicking even if canRegister is false, 
                                                                    // handle the "deadline" logic inside the function or 
                                                                    // ensure your state allows editing registered meals
                                                                    disabled={meal.numberOfMeals <= 1}
                                                                    className="p-0.5 hover:text-primary disabled:opacity-20 transition-colors cursor-pointer"
                                                                >
                                                                    <Minus size={12} strokeWidth={3} />
                                                                </button>

                                                                <span className="text-[10px] font-black min-w-3 text-center text-primary">
                                                                    {meal.numberOfMeals || 1}
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleUpdateQty(meal.registrationId, meal.numberOfMeals, 1);
                                                                    }}
                                                                    // CHANGE: Removed the !meal.canRegister restriction
                                                                    className="p-0.5 hover:text-primary disabled:opacity-20 transition-colors cursor-pointer"
                                                                >
                                                                    <Plus size={12} strokeWidth={3} />
                                                                </button>
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => handleMealAction(meal)}
                                                            disabled={!meal.canRegister && !isReg}
                                                            className={`transition-all active:scale-90 ${!meal.canRegister && !isReg ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                                                                }`}
                                                        >
                                                            {isReg ? (
                                                                <CheckCircle2 size={28} className="text-primary fill-primary/10" />
                                                            ) : (
                                                                <Circle size={28} className="text-base-content/20 hover:text-primary/40 transition-colors" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Menu Description */}
                                                <div className={`p-3 rounded-xl text-[11px] font-medium leading-relaxed ${isReg ? 'bg-white/50 border border-primary/10 text-primary text-center' : 'bg-base-100 border border-base-300 opacity-70 text-center'
                                                    }`}>
                                                    {meal.menu || "Menu Pending"}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )
                            : (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-20 italic space-y-2">
                                        <Utensils size={32} strokeWidth={1} />
                                        <p className="text-xs font-bold uppercase tracking-widest">Kitchen Closed</p>
                                    </div>
                                )
                    }
                </div>
            </div>
        </div >
    );
};

export default UpcomingMealCard;