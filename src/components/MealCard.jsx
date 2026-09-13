import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Check, UsersRound, X, Edit2, Trash2, XCircle, Gauge } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import CountUp from 'react-countup';
import { getMealLabel } from '../utils/mealTypes';

const MotionDiv = motion.div;

const MealCard = ({
    schedule,
    onUpdate,
    onDelete,
    registrationCounts,
    registrationsLoading,
    registrationsError
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const initialEditedSchedule = {
        isHoliday: schedule.isHoliday,
        availableMeals: schedule.availableMeals
    };
    const [editedSchedule, setEditedSchedule] = useState(initialEditedSchedule);
    const editedScheduleRef = useRef(initialEditedSchedule);
    const [pendingMealType, setPendingMealType] = useState(null);
    const [mealToDelete, setMealToDelete] = useState(null);

    const updateEditedSchedule = (updater) => {
        setEditedSchedule(prev => {
            const next = updater(prev);
            editedScheduleRef.current = next;
            return next;
        });
    };

    const updateMealAvailability = async (mealType, isAvailable) => {
        if (pendingMealType) return;

        const previousDraft = editedScheduleRef.current;
        const previousMeal = previousDraft.availableMeals.find(meal => meal.mealType === mealType);
        if (!previousMeal) return;

        const nextDraft = {
            ...previousDraft,
            availableMeals: previousDraft.availableMeals.map(meal => {
                if (meal.mealType !== mealType) return meal;

                return {
                    ...meal,
                    isAvailable,
                    ...(isAvailable && !meal.weight ? { weight: 1 } : {})
                };
            })
        };

        editedScheduleRef.current = nextDraft;
        setEditedSchedule(nextDraft);
        setPendingMealType(mealType);

        try {
            await onUpdate(schedule._id, nextDraft);
        } catch {
            const rollbackDraft = {
                ...editedScheduleRef.current,
                availableMeals: editedScheduleRef.current.availableMeals.map(meal =>
                    meal.mealType === mealType
                        ? { ...meal, isAvailable: previousMeal.isAvailable, weight: previousMeal.weight }
                        : meal
                )
            };
            editedScheduleRef.current = rollbackDraft;
            setEditedSchedule(rollbackDraft);
        } finally {
            setPendingMealType(null);
        }
    };

    const handleMealDelete = (mealType) => {
        if (pendingMealType) return;
        setMealToDelete(mealType);
    };

    const handleMealRestore = (mealType) => {
        if (pendingMealType) return;
        updateMealAvailability(mealType, true);
    };

    const handleConfirmMealDelete = () => {
        if (!mealToDelete || pendingMealType) return;

        const mealTypeToDelete = mealToDelete;
        setMealToDelete(null);
        updateMealAvailability(mealTypeToDelete, false);
    };

    useEffect(() => {
        if (!mealToDelete) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setMealToDelete(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [mealToDelete]);

    const handleWeightChange = (mealType, newWeight) => {
        updateEditedSchedule(prev => ({
            ...prev,
            availableMeals: prev.availableMeals.map(meal =>
                meal.mealType === mealType ? { ...meal, weight: parseFloat(newWeight) || 0 } : meal
            )
        }));
    };

    const handleMenuChange = (mealType, newMenu) => {
        updateEditedSchedule(prev => ({
            ...prev,
            availableMeals: prev.availableMeals.map(meal =>
                meal.mealType === mealType ? { ...meal, menu: newMenu } : meal
            )
        }));
    };

    const handleDelete = async () => {
        await onDelete(schedule._id);
    };
    const handleSave = async () => {
        try {
            await onUpdate(schedule._id, editedSchedule);
            setIsEditing(false);
        } catch {
            // The parent update handler already displays the request error toast.
        }
    };

    const handleCancel = () => {
        const resetSchedule = {
            isHoliday: schedule.isHoliday,
            availableMeals: schedule.availableMeals
        };
        editedScheduleRef.current = resetSchedule;
        setEditedSchedule(resetSchedule);
        setIsEditing(false);
    };

    const displayMeals = isEditing ? editedSchedule.availableMeals : schedule.availableMeals;
    const scheduleDateKey = format(new Date(schedule.date), 'yyyy-MM-dd');
    const deleteDialogId = mealToDelete
        ? `meal-delete-dialog-${schedule._id || scheduleDateKey}-${mealToDelete}`
        : null;

    return (
        <div className={`group flex h-full min-h-140 flex-col overflow-hidden bg-base-100 rounded-2xl border transition-all duration-200 
            ${isEditing ? 'border-primary shadow-2xl ring-1 ring-primary/20' : 'border-base-300'}`}>

            {/* Top Header: Date and Actions */}
            <div className='flex min-h-19 items-start justify-between p-4 border-b border-base-200 bg-base-50/30'>
                <div>
                    <div className='flex gap-2'>
                        <h2 className='font-bold text-base md:text-lg'>
                            {format(new Date(schedule.date), 'MMM dd, yyyy')}
                        </h2>
                        <button
                            disabled={isEditing}
                            onClick={handleDelete}
                            className='text-error cursor-pointer rounded-full'
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <p className='text-xs font-medium uppercase tracking-wider text-base-content/50'>
                        {format(new Date(schedule.date), 'EEEE')}
                    </p>
                </div>

                <div className='flex gap-1'>
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className='hover:bg-base-300 border border-base-200 cursor-pointer p-2 rounded-lg text-error'>
                                <X size={18} />
                            </button>
                            <button onClick={handleSave} className='hover:bg-base-300 border border-base-200 cursor-pointer p-2 rounded-lg'>
                                <Check size={18} />
                            </button>
                        </>
                    ) : (
                        <button
                            disabled={isEditing}
                            onClick={() => setIsEditing(true)}
                            className='hover:bg-base-300 border border-base-200 cursor-pointer p-2 rounded-lg'
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Meals Section */}
            <div className='flex flex-1 flex-col gap-3 overflow-hidden p-4'>
                {displayMeals?.map((meal) => (
                    <div
                        key={meal.mealType}
                        className={`relative flex min-h-32 flex-1 flex-col overflow-hidden rounded-xl border transition-all 
                        ${meal?.isAvailable ? 'bg-primary/5 border-primary/20' : 'bg-base-200/50 border-transparent opacity-60'}`}
                    >
                        <div className='p-3'>
                            <div className='flex justify-between text-sm items-center'>
                                <div className='flex min-w-0 items-center gap-2'>
                                    <span className={`font-bold uppercase tracking-widest ${meal?.isAvailable ? 'text-primary' : 'text-base-content/40'}`}>
                                        {getMealLabel(meal.mealType)}
                                    </span>
                                    {meal?.isAvailable && (
                                        <span
                                            className='inline-flex items-center gap-1 text-xs font-bold bg-base-100 px-2 py-1.5 drop-shadow-2xl rounded-lg text-base-content/60'
                                            aria-label={registrationsLoading
                                                ? 'Loading registered meal count'
                                                : registrationsError
                                                    ? 'Registration count unavailable'
                                                    : `${registrationCounts?.[`${scheduleDateKey}:${meal.mealType}`] ?? 0} registered meals`}
                                        >
                                            <UsersRound size={14} aria-hidden='true' />
                                            {registrationsLoading ? (
                                                <span className='skeleton h-3 w-4' aria-hidden='true' />
                                            ) : registrationsError ? (
                                                <span aria-label='Registration count unavailable'>-</span>
                                            ) : (
                                                <CountUp
                                                    delay={0}
                                                    duration={2}
                                                    end={registrationCounts?.[`${scheduleDateKey}:${meal.mealType}`] ?? 0}
                                                />
                                            )}
                                        </span>
                                    )}
                                </div>
                                {meal?.isAvailable && !isEditing ? (
                                    <div className='font-black flex items-center gap-1'>
                                        <Gauge size={16}></Gauge>
                                        <span>
                                            {meal?.weight}
                                        </span>

                                    </div>
                                ) : !meal?.isAvailable && isEditing ? (
                                    <button
                                        type='button'
                                        aria-label='Restore meal'
                                        title='Restore meal'
                                        disabled={pendingMealType === meal.mealType}
                                        onClick={() => handleMealRestore(meal.mealType)}
                                        className='btn btn-ghost btn-sm font-black ml-auto text-success hover:bg-success/10'
                                    >
                                        {pendingMealType === meal.mealType ? (
                                            <span className='loading loading-spinner loading-xs' />
                                        ) : (
                                            <Check size={18} />
                                        )}
                                    </button>
                                ) : null}
                            </div>

                            {meal?.isAvailable ? (
                                <div className='space-y-2 mt-2'>
                                    {isEditing ? (
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                placeholder="Menu details..."
                                                value={meal.menu || ''}
                                                onChange={(e) => handleMenuChange(meal.mealType, e.target.value)}
                                                className='input input-sm input-bordered h-10 w-full focus:input-primary'
                                            />
                                            <div className="flex w-full items-center gap-2">
                                                <span className="text-[10px] font-bold text-base-content/40 uppercase">Weight:</span>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={meal.weight || 1}
                                                    onChange={(e) => handleWeightChange(meal.mealType, e.target.value)}
                                                    className='input input-sm input-bordered h-10 w-24'
                                                />
                                                <button
                                                    type='button'
                                                    aria-label='Delete meal'
                                                    title='Delete meal'
                                                    disabled={pendingMealType === meal.mealType}
                                                    onClick={() => handleMealDelete(meal.mealType)}
                                                    className='btn btn-ghost btn-sm btn-square ml-auto text-error hover:bg-error/10'
                                                >
                                                    {pendingMealType === meal.mealType ? (
                                                        <span className='loading loading-spinner loading-xs' />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='text-center text-base-content/80 bangla-text'>
                                            {meal.menu || <span className="text-base-content/30 italic">মেন্যু পেন্ডিং</span>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className='flex items-center gap-2 py-1'>
                                    <XCircle size={14} className="text-base-content/30" />
                                    <span className='text-xs font-medium text-base-content/40 italic'>Unavailable</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {mealToDelete && (
                    <MotionDiv
                        className='fixed inset-0 z-50 flex items-center justify-center p-4'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    // transition={{ duration: 0.1, ease: 'easeOut' }}
                    >
                        <button
                            type='button'
                            aria-label='Close delete confirmation'
                            className='absolute inset-0 bg-base-content/20'
                            onClick={() => setMealToDelete(null)}
                        />
                        <MotionDiv
                            role='dialog'
                            aria-modal='true'
                            aria-labelledby={`${deleteDialogId}-title`}
                            aria-describedby={`${deleteDialogId}-description`}
                            className='relative w-80 flex flex-col gap-4 bg-base-100 drop-shadow-2xl p-4 rounded-2xl'
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30, scale: 0.98 }}
                        // transition={{ duration: 0.18, ease: 'easeOut' }}
                        >
                            <div className='space-y-2'>
                                <p id={`${deleteDialogId}-title`} className='font-bold'>
                                    Disabling this meal will also <span className='font-black text-error'>Delete all Registrations</span>
                                </p>
                                <p id={`${deleteDialogId}-description`} className='text-sm text-base-content/80'>
                                    Are you sure you want to continue?
                                </p>
                            </div>
                            <div className='flex justify-end gap-2 items-center'>
                                <button
                                    type='button'
                                    className='btn btn-sm btn-ghost'
                                    onClick={() => setMealToDelete(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-sm btn-error shadow-none text-base-100'
                                    onClick={handleConfirmMealDelete}
                                >
                                    Delete meal
                                </button>
                            </div>
                        </MotionDiv>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MealCard;
