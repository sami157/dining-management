import { format } from 'date-fns';
import { Utensils, CircleCheckBig, Circle, CircleX, Plus, Minus, Bike, Leaf, PackageX } from 'lucide-react'; // Added Plus, Minus
import toast from 'react-hot-toast';
import useAxiosSecure from '../hooks/useAxiosSecure';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';
import { getMealLabel } from '../utils/mealTypes';
import { DINING_IDS, getDiningIndicatorClass, getDiningLabel, isOfficeDining, normalizeDiningId } from '../utils/dining';
import { DELIVERY_LOCATIONS, deliveryLocationLabels, isDeliveryLocation, normalizeDeliveryLocation } from '../utils/delivery';

const MealRowSkeleton = () => (
    <div className="relative h-52 rounded-lg border border-base-300 bg-base-200/70 overflow-hidden">
        <div className="flex h-full flex-col p-4">
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

            <div className="mt-auto space-y-2 pt-2">
                <div className="skeleton h-10 w-full rounded-lg bg-base-300" />
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

const UpcomingMealCard = ({ date, schedule = {}, dataLoading, refetch, defaultDeliveryLocation }) => {
    const axiosSecure = useAxiosSecure();
    const { loading } = useAuth();
    const [requested, setRequested] = useState(false)
    const [deliveryDrafts, setDeliveryDrafts] = useState({});

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
                diningId: normalizeDiningId(meal.diningId),
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

    const handleMealCategoryChange = async (meal, mealCategory) => {
        if (!meal.registrationId || meal.mealCategory === mealCategory) return;

        toast.promise(
            axiosSecure.patch(`/users/meals/register/${meal.registrationId}`, {
                mealCategory
            }).then(() => refetch()),
            {
                loading: 'Updating meal type...',
                success: mealCategory === 'alternative' ? 'Alternative meal selected' : 'Regular meal selected',
                error: 'Failed to update meal type'
            }
        );
    };

    const handleDeliveryChange = async (meal, deliveryLocation) => {
        if (!meal.registrationId) return;

        const key = meal.registrationId;
        setDeliveryDrafts(prev => ({ ...prev, [key]: deliveryLocation }));

        if (!deliveryLocation) {
            if (!meal.deliveryRequest) return;

            toast.promise(
                axiosSecure.delete(`/users/meals/register/${meal.registrationId}/delivery`).then(() => refetch()),
                {
                    loading: 'Cancelling delivery...',
                    success: 'Delivery cancelled',
                    error: 'Failed to cancel delivery'
                }
            );
            return;
        }

        toast.promise(
            axiosSecure.put(`/users/meals/register/${meal.registrationId}/delivery`, {
                deliveryLocation: normalizeDeliveryLocation(deliveryLocation)
            }).then(() => refetch()),
            {
                loading: 'Saving delivery...',
                success: 'Delivery request saved',
                error: 'Failed to save delivery'
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
                                        const diningId = normalizeDiningId(meal.diningId);
                                        const isOfficeMeal = diningId === DINING_IDS.office;
                                        const mealCategory = meal.mealCategory || 'basic';
                                        const allowAlt = Boolean(meal.allowAlt);
                                        const deliverySelection = deliveryDrafts[meal.registrationId]
                                            ?? meal.deliveryRequest?.deliveryLocation
                                            ?? (isDeliveryLocation(defaultDeliveryLocation) ? defaultDeliveryLocation : '');
                                        const mealCardTone = !meal.isAvailable
                                            ? 'bg-none border-dashed border-base-300 border'
                                            : isReg
                                                ? isOfficeMeal
                                                    ? 'bg-office-soft border-office-soft'
                                                    : 'bg-primary/10 border-primary/30'
                                                : isOfficeMeal
                                                    ? 'bg-office-soft border-office-soft'
                                                    : 'bg-base-200 border-base-300';

                                        return (
                                            <div
                                                key={`${meal.mealType}-${diningId}`}
                                                className={`relative h-52 group rounded-lg transition-all duration-300 overflow-hidden ${mealCardTone}`}
                                            >
                                                <div className="flex h-full flex-col p-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-3 rounded-full ${isReg ? isOfficeMeal ? 'bg-office text-white' : 'bg-primary text-white' : 'bg-base-100 border border-base-300'}`}>
                                                                {
                                                                    meal.isAvailable ?
                                                                        <Utensils size={18} /> :
                                                                        <CircleX size={18} />
                                                                }
                                                            </div>
                                                            <div className='flex flex-col items-start'>
                                                                <h3 className="font-bold uppercase tracking-wide text-sm flex items-center gap-2">
                                                                    {getMealLabel(meal.mealType)}
                                                                    {isOfficeDining(diningId) && (
                                                                        <span className={`border px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getDiningIndicatorClass(diningId)}`}>
                                                                            {getDiningLabel(diningId)}
                                                                        </span>
                                                                    )}
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

                                                                    <span className={`font-black min-w-3 text-center ${isOfficeMeal ? 'text-office-content' : 'text-primary'}`}>
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
                                                                    <CircleCheckBig size={28} className={isOfficeMeal ? 'text-office' : 'text-primary fill-primary/10'} />
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
                                                    <div className="flex items-stretch justify-between gap-2">
                                                        <div className={`min-w-0 grow p-3 bangla-text text-sm rounded-lg font-medium text-center leading-relaxed ${isReg ? isOfficeMeal ? 'bg-base-100/60 text-office-content border border-office-soft' : 'bg-base-100/60 text-base-content border border-primary/30' : isOfficeMeal ? 'bg-base-100 border text-office-content border-office-soft opacity-80' : 'bg-base-100 border text-base-content border-base-300 opacity-70'
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

                                                        <button
                                                            type="button"
                                                            title={!allowAlt ? 'Alternative not available' : isReg ? mealCategory === 'alternative' ? 'Use basic meal' : 'Request alternative meal' : 'Register first to request alternative meal'}
                                                            aria-label={!allowAlt ? 'Alternative not available' : isReg ? mealCategory === 'alternative' ? 'Use basic meal' : 'Request alternative meal' : 'Register first to request alternative meal'}
                                                            disabled={!isReg || !allowAlt}
                                                            onClick={() => handleMealCategoryChange(meal, mealCategory === 'alternative' ? 'basic' : 'alternative')}
                                                            className={`flex w-10 shrink-0 items-center justify-center rounded-lg border transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 ${mealCategory === 'alternative'
                                                                ? isOfficeMeal ? 'bg-office text-white border-office' : 'bg-primary text-primary-content border-primary'
                                                                : isOfficeMeal ? 'bg-base-100/60 text-office-content border-office-soft hover:bg-office-soft' : 'bg-base-100/70 text-base-content/45 border-base-300 hover:text-base-content'
                                                                }`}
                                                        >
                                                            <Leaf size={15} />
                                                        </button>
                                                    </div>

                                                    <div className="mt-auto pt-2">
                                                        {isOfficeMeal ? (
                                                            <div className="grid grid-cols-1 gap-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Bike size={14} className={meal.deliveryRequest ? 'text-office' : 'text-base-content/35'} />
                                                                    <select
                                                                        value={deliverySelection}
                                                                        disabled={!isReg}
                                                                        onChange={(e) => handleDeliveryChange(meal, e.target.value)}
                                                                        className="select select-sm select-bordered min-w-0 grow bg-base-100 h-10 disabled:cursor-not-allowed disabled:opacity-45"
                                                                    >
                                                                        <option value="">{isReg ? 'No delivery' : 'Register for delivery'}</option>
                                                                        {Object.values(DELIVERY_LOCATIONS).map(location => (
                                                                            <option key={location} value={location}>
                                                                                {deliveryLocationLabels[location]}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {deliverySelection && !meal.deliveryRequest && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeliveryChange(meal, deliverySelection)}
                                                                            className="btn btn-xs rounded-md bg-office text-white border-office"
                                                                        >
                                                                            Request
                                                                        </button>
                                                                    )}
                                                                    {meal.deliveryRequest && (
                                                                        <button
                                                                            type="button"
                                                                            title="Cancel delivery"
                                                                            onClick={() => handleDeliveryChange(meal, '')}
                                                                            className="btn btn-xs btn-ghost text-error"
                                                                        >
                                                                            <PackageX size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-10 items-center justify-center text-center text-[10px] font-black uppercase tracking-widest text-base-content/35">
                                                                Delivery not available
                                                            </div>
                                                        )}
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
