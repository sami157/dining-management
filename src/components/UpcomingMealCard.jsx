import { format } from 'date-fns';
import { Utensils, CircleCheckBig, Circle, CircleX, Plus, Minus } from 'lucide-react'; // Added Plus, Minus
import toast from 'react-hot-toast';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';
import { getMealLabel } from '../utils/mealTypes';

const MealRowSkeleton = () => (
    <div className="relative min-h-32 rounded-lg border border-base-300 bg-base-200/70 overflow-hidden">
        <div className="p-4">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <div className="skeleton h-11 w-11 rounded-full bg-base-300" />
                    <div className="flex flex-col gap-2">
                        <div className="skeleton h-4 w-24 bg-base-300" />
                        <div className="skeleton h-3 w-10 bg-base-300" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="skeleton h-8 w-16 rounded-lg bg-base-300" />
                    <div className="skeleton h-7 w-7 rounded-full bg-base-300" />
                </div>
            </div>

            <div className="rounded-lg border border-base-300 bg-base-100 p-3 space-y-2">
                <div className="skeleton h-3 w-11/12 mx-auto bg-base-300" />
                <div className="skeleton h-3 w-7/12 mx-auto bg-base-300" />
            </div>
        </div>
    </div>
);

const MealsSkeleton = () => (
    <div className="grow space-y-5" aria-label="Loading upcoming meals">
        {Array.from({ length: 3 }).map((_, index) => (
            <MealRowSkeleton key={index} />
        ))}
    </div>
);

const UpcomingMealCard = ({ date, schedule = {}, dataLoading, refetch }) => {
    const axiosSecure = useAxiosSecure();
    const { loading } = useAuth();
    const [requested, setRequested] = useState(false)

    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const meals = schedule?.meals || [];
    const dateStr = format(date, 'yyyy-MM-dd');

    const handleMealAction = async (meal) => {
        setRequested(true)
        if (meal.isRegistered && meal.registrationId) {
            toast.promise(
                axiosSecure.delete(`/users/meals/register/cancel/${meal.registrationId}`).then(() => {
                    refetch()
                    setRequested(false)
                }),
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
            setRequested(false)
            return;
        }

        toast.promise(
            axiosSecure.post('/users/meals/register', {
                date: dateStr,
                mealType: meal.mealType,
                numberOfMeals: 1 // Default to 1
            }).then(() => {
                refetch()
                setRequested(false)
            }),
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
        <div className={`h-full mx-auto md:w-100 bg-base-100 border ${isToday ? 'border-primary border-dashed' : 'border-base-300'} rounded-xl overflow-hidden transition-all duration-500 ease-in-out`}>
            <div className="p-5 flex flex-col h-full">

                {/* Card Header */}
                <div className="mb-4">
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
                            <span className="text-sm px-2 py-1 rounded-md bg-primary text-primary-content font-bold">
                                Today
                            </span>
                        )}
                    </div>
                </div>

                {/* Meals List */}
                {dataLoading ? (
                    <MealsSkeleton />
                ) : (
                <div className="grow space-y-5">
                    {
                        meals.length > 0
                                ?
                                (
                                    meals.map((meal) => {
                                        const isReg = meal.isRegistered;

                                        return (
                                            <div
                                                key={meal.mealType}
                                                className={`relative min-h-32 group rounded-lg transition-all duration-300 overflow-hidden ${!meal.isAvailable ? 'bg-none border-dashed border-base-300 border' : isReg ? 'bg-primary/10 border-primary/30' : 'bg-base-200 border-base-300'
                                                    }`}
                                            >
                                                <div className="p-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-3 rounded-full ${isReg ? 'bg-primary text-white' : 'bg-base-100 border border-base-300'}`}>
                                                                {
                                                                    meal.isAvailable ?
                                                                        <Utensils size={18} /> :
                                                                        <CircleX size={18} />
                                                                }
                                                            </div>
                                                            <div className='flex flex-col items-start'>
                                                                <h3 className="font-bold uppercase tracking-wide text-sm flex items-center gap-2">
                                                                    {getMealLabel(meal.mealType)}
                                                                </h3>
                                                                <div>
                                                                    {meal.weight && <span className="opacity-40 text-xs font-bold">{
                                                                        meal.isAvailable ? meal.weight : 'Not available'
                                                                    }</span>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Area: Qty Controls + Toggle */}
                                                        <div className="flex items-center gap-3">
                                                            {isReg && (
                                                                <div className="flex items-center gap-1 bg-base-100 px-2 py-1 rounded-lg border border-base-300">
                                                                    <button
                                                                        type="button" // Explicitly set type to prevent form issues
                                                                        onClick={(e) => {
                                                                            e.stopPropagation(); // Prevent triggering parent clicks
                                                                            handleUpdateQty(meal.registrationId, meal.numberOfMeals, -1);
                                                                        }}

                                                                        disabled={meal.numberOfMeals <= 1}
                                                                        className="p-0.5 hover:text-primary disabled:opacity-20 transition-colors cursor-pointer"
                                                                    >
                                                                        <Minus size={12} strokeWidth={3} />
                                                                    </button>

                                                                    <span className="font-black min-w-3 text-center text-primary">
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
                                                                disabled={!meal.canRegister && !isReg || requested}
                                                                className={`transition-all active:scale-90 ${!meal.canRegister && !isReg ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                                                                    }`}
                                                            >
                                                                {isReg ? (
                                                                    <CircleCheckBig size={28} className="text-primary fill-primary/10" />
                                                                ) :
                                                                    meal.isAvailable ?
                                                                        (
                                                                            <Circle size={28} className="text-base-content/20 hover:text-primary/40 transition-colors" />
                                                                        ) : (
                                                                            <CircleX size={28} className="text-base-content/20 hover:text-primary/40 transition-colors" />
                                                                        )
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Menu Description */}
                                                    <div className={`p-3 bangla-text text-sm rounded-lg font-medium text-center leading-relaxed ${isReg ? 'bg-base-100/60 text-base-content border border-primary/30' : 'bg-base-100 border text-base-content border-base-300 opacity-70'
                                                        }`}>
                                                        {
                                                            meal.menu || <span className="text-base-content/25 italic">
                                                                {
                                                                    meal.isAvailable ?
                                                                        <p>মেন্যু পেন্ডিং</p> :
                                                                        <p>X</p>
                                                                }
                                                            </span>
                                                        }
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
                )}
            </div>
        </div >
    );
};

export default UpcomingMealCard;
