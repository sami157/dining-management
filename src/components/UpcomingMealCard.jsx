import { format } from 'date-fns';
import { Circle, CircleCheckBig, CircleX, LoaderCircle, MessageSquarePlus, Minus, Plus, Utensils } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { buildMealRegistrationPayload } from '../utils/mealRegistration';
import { getMealLabel } from '../utils/mealTypes';
import MealCommentModal from './MealCommentModal';

const UpcomingMealCard = ({ date, schedule = {}, dataLoading, refetch }) => {
    const axiosSecure = useAxiosSecure();
    const { loading } = useAuth();
    const [requestedMealId, setRequestedMealId] = useState(null);
    const [commentTarget, setCommentTarget] = useState(null);

    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const meals = schedule?.meals || [];
    const dateStr = format(date, 'yyyy-MM-dd');
    const mealRows = dataLoading
        ? Array.from({ length: 3 }, (_, index) => ({ mealType: `loading-${index}`, isLoading: true }))
        : meals;

    const handleMealAction = async (meal, comment = '') => {
        const mealRequestId = meal.registrationId || meal.mealType;
        setRequestedMealId(mealRequestId);

        if (meal.isRegistered && meal.registrationId) {
            toast.promise(
                axiosSecure.delete(`/users/meals/register/cancel/${meal.registrationId}`).then(() => {
                    refetch();
                    setRequestedMealId(null);
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
            setRequestedMealId(null);
            return;
        }

        toast.promise(
            axiosSecure.post(
                '/users/meals/register',
                buildMealRegistrationPayload(
                    {
                        date: dateStr,
                        mealType: meal.mealType,
                        numberOfMeals: 1
                    },
                    comment
                )
            ).then(() => {
                refetch();
                setRequestedMealId(null);
            }),
            {
                loading: 'Registering...',
                success: 'Meal booked!',
                error: 'Registration failed'
            }
        );
    };

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

    const openCommentEditor = (meal) => {
        setCommentTarget({
            registrationId: meal.registrationId,
            label: getMealLabel(meal.mealType),
            dateLabel: format(date, 'EEEE, dd MMMM yyyy'),
            initialComment: meal.comment || '',
        });
    };

    const handleSaveComment = async (comment) => {
        if (!commentTarget) return;

        const trimmedComment = comment.trim();
        setRequestedMealId(commentTarget.registrationId);
        const savePromise = axiosSecure.patch(`/users/meals/register/${commentTarget.registrationId}/comment`, {
            comment: trimmedComment
        }).then(() => {
            refetch();
            setCommentTarget(null);
        }).finally(() => {
            setRequestedMealId(null);
        });

        toast.promise(savePromise, {
            loading: 'Saving comment...',
            success: 'Comment saved',
            error: 'Failed to save comment'
        });
    };

    if (loading) return null;

    return (
        <div className={`h-full mx-auto md:w-100 bg-base-100 border ${isToday ? 'border-primary border-dashed' : 'border-base-300'} rounded-xl overflow-hidden transition-all duration-500 ease-in-out`}>
            <div className="p-4 flex flex-col h-full">
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

                <div className="grow space-y-3" aria-label={dataLoading ? 'Loading upcoming meals' : undefined}>
                    {mealRows.length > 0 ? (
                        mealRows.map((meal, index) => {
                            const isLoadingMeal = Boolean(meal.isLoading);
                            const isReg = meal.isRegistered;
                            const mealCardClass = isLoadingMeal
                                ? 'bg-base-200 border-base-300 border-dashed border'
                                : !meal.isAvailable
                                    ? 'bg-none border-dashed border-base-300 border'
                                    : isReg
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'bg-base-200 border-base-300';
                            const rowRequestId = meal.registrationId || meal.mealType;
                            const rowIsLoading = requestedMealId === rowRequestId;

                            return (
                                <div
                                    key={meal.mealType ?? index}
                                    className={`relative min-h-32 group rounded-lg transition-all duration-300 overflow-hidden ${mealCardClass}`}
                                >
                                    <div className="p-4">
                                        <div className="flex mb-4 justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="flex flex-col items-start">
                                                    <h3 className={`font-bold uppercase tracking-wide text-sm flex items-center gap-2 ${isLoadingMeal ? 'skeleton skeleton-text w-32' : ''}`}>
                                                        {isLoadingMeal ? 'Meal Type' : getMealLabel(meal.mealType)}
                                                    </h3>
                                                    <div>
                                                        {isLoadingMeal ? (
                                                            <span className="skeleton skeleton-text text-xs font-bold opacity-40 w-20">Weight</span>
                                                        ) : (
                                                            meal.weight && (
                                                                <span className="opacity-40 text-xs font-bold">
                                                                    {meal.isAvailable ? meal.weight : '0'}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isLoadingMeal ? (
                                                    <p className="skeleton skeleton-text text-sm font-semibold">Controls</p>
                                                ) : (
                                                    <>
                                                        {isReg && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openCommentEditor(meal);
                                                                    }}
                                                                    className="flex p-2 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/60 transition-colors hover:border-primary hover:text-primary"
                                                                    aria-label="Add meal comment"
                                                                >
                                                                    <MessageSquarePlus size={16} strokeWidth={2} />
                                                                </button>
                                                                <div className="flex items-center gap-1 bg-base-100 px-2 py-1 rounded-lg border border-base-300">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
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
                                                                        className="p-0.5 hover:text-primary disabled:opacity-20 transition-colors cursor-pointer"
                                                                    >
                                                                        <Plus size={12} strokeWidth={3} />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}

                                                        <button
                                                            onClick={() => handleMealAction(meal)}
                                                            disabled={(!meal.canRegister && !isReg) || rowIsLoading}
                                                            className={`transition-all active:scale-90 ${!meal.canRegister && !isReg ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        >
                                                            {rowIsLoading ? (
                                                                <LoaderCircle size={28} className="animate-spin text-primary/50" />
                                                            ) : isReg ? (
                                                                <CircleCheckBig size={28} className="text-primary fill-primary/10" />
                                                            ) : meal.isAvailable ? (
                                                                <Circle size={28} className="text-base-content/20 hover:text-primary/40 transition-colors" />
                                                            ) : (
                                                                <CircleX size={28} className="text-base-content/20 hover:text-primary/40 transition-colors" />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bangla-text p-2 text-sm rounded-lg font-medium text-center leading-relaxed">
                                            {isLoadingMeal ? (
                                                <p className="skeleton skeleton-text text-sm w-11/12 mx-auto">Menu</p>
                                            ) : (
                                                meal.menu || (
                                                    <span className="text-base-content/25">
                                                        {meal.isAvailable ? <p>Menu Pending</p> : <p>N/A</p>}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-20 italic space-y-2">
                            <Utensils size={32} strokeWidth={1} />
                            <p className="text-xs font-bold uppercase tracking-widest">Kitchen Closed</p>
                        </div>
                    )}
                </div>
            </div>
            <MealCommentModal
                open={Boolean(commentTarget)}
                title={commentTarget ? `${commentTarget.dateLabel} - ${commentTarget.label}` : 'Meal Comment'}
                initialComment={commentTarget?.initialComment || ''}
                saving={Boolean(commentTarget) && requestedMealId === commentTarget.registrationId}
                onClose={() => setCommentTarget(null)}
                onSave={handleSaveComment}
            />
        </div>
    );
};

export default UpcomingMealCard;
