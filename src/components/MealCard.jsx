import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Edit2, Trash2, XCircle, Info } from 'lucide-react'; // Modern icons
import toast from 'react-hot-toast';
import { getMealLabel } from '../utils/mealTypes';
import { DINING_IDS, diningLabels, getDiningIndicatorClass, getDiningLabel, isOfficeDining, normalizeDiningId } from '../utils/dining';

const withDiningFallback = (meals = []) => meals.map(meal => ({
    ...meal,
    diningId: normalizeDiningId(meal.diningId),
}));

const MealCard = ({ schedule, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedSchedule, setEditedSchedule] = useState({
        isHoliday: schedule.isHoliday,
        availableMeals: withDiningFallback(schedule.availableMeals)
    });

    const handleMealToggle = (mealType) => {
        setEditedSchedule(prev => ({
            ...prev,
            availableMeals: prev.availableMeals.map(meal =>
                meal.mealType === mealType ? { ...meal, isAvailable: !meal.isAvailable } : meal
            )
        }));
    };

    const handleWeightChange = (mealType, newWeight) => {
        setEditedSchedule(prev => ({
            ...prev,
            availableMeals: prev.availableMeals.map(meal =>
                meal.mealType === mealType ? { ...meal, weight: parseFloat(newWeight) || 0 } : meal
            )
        }));
    };

    const handleMenuChange = (mealType, newMenu) => {
        setEditedSchedule(prev => ({
            ...prev,
            availableMeals: prev.availableMeals.map(meal =>
                meal.mealType === mealType ? { ...meal, menu: newMenu } : meal
            )
        }));
    };

    const handleDiningChange = (mealType, diningId) => {
        setEditedSchedule(prev => ({
            ...prev,
            availableMeals: prev.availableMeals.map(meal =>
                meal.mealType === mealType ? { ...meal, diningId: normalizeDiningId(diningId) } : meal
            )
        }));
    };

    const handleDelete = () => {
        toast.custom((t) => (
            <div className='flex w-80 max-w-[92vw] flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xl'>
                <div>
                    <p className='text-sm font-black uppercase tracking-wide text-error'>Delete schedule?</p>
                    <p className='mt-1 text-xs text-base-content/60'>
                        {format(new Date(schedule.date), 'EEEE, MMM dd, yyyy')}
                    </p>
                </div>
                <div className='flex justify-end gap-2'>
                    <button
                        type='button'
                        className='btn btn-sm btn-ghost'
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                    <button
                        type='button'
                        className='btn btn-sm btn-error text-error-content'
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await onDelete(schedule._id);
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 8000 });
    };
    const handleSave = async () => {
        await onUpdate(schedule._id, editedSchedule);
        setIsEditing(false)
    };

    const handleCancel = () => {
        setEditedSchedule({
            isHoliday: schedule.isHoliday,
            availableMeals: withDiningFallback(schedule.availableMeals)
        });
        setIsEditing(false);
    };

    const handleStartEditing = () => {
        setEditedSchedule({
            isHoliday: schedule.isHoliday,
            availableMeals: withDiningFallback(schedule.availableMeals)
        });
        setIsEditing(true);
    };

    const displayMeals = isEditing ? editedSchedule.availableMeals : withDiningFallback(schedule.availableMeals);

    return (
        <div className={`group flex flex-col bg-base-100 rounded-2xl border transition-all duration-200 
            ${isEditing ? 'border-primary shadow-2xl ring-1 ring-primary/20' : 'border-base-300'}`}>

            {/* Top Header: Date and Actions */}
            <div className='flex items-start justify-between p-4 border-b border-base-200 bg-base-50/30'>
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
                            onClick={handleStartEditing}
                            className='hover:bg-base-300 border border-base-200 cursor-pointer p-2 rounded-lg'
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Meals Section */}
            <div className='p-4 space-y-3'>
                {displayMeals?.map((meal) => {
                    const isOfficeMeal = isOfficeDining(meal.diningId);
                    const mealTone = meal?.isAvailable
                        ? isOfficeMeal
                            ? 'bg-office-soft border-office-soft'
                            : 'bg-primary/5 border-primary/20'
                        : isOfficeMeal
                            ? 'bg-office-soft border-office-soft opacity-60'
                            : 'bg-base-200/50 border-transparent opacity-60';
                    const hoverTone = isEditing
                        ? isOfficeMeal ? 'cursor-pointer hover:border-office' : 'cursor-pointer hover:border-primary/40'
                        : '';

                    return (
                    <div
                        key={meal.mealType}
                        onClick={isEditing ? () => handleMealToggle(meal.mealType) : undefined}
                        className={`relative overflow-hidden rounded-xl border transition-all ${mealTone} ${hoverTone}`}
                    >
                        <div className='p-3'>
                            <div className='flex justify-between items-center mb-1'>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${meal?.isAvailable ? isOfficeMeal ? 'text-office-content' : 'text-primary' : 'text-base-content/40'}`}>
                                        {
                                            getMealLabel(meal.mealType)
                                        }
                                    </span>
                                    {isOfficeMeal && (
                                        <span className={`border px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getDiningIndicatorClass(meal.diningId)}`}>
                                            {getDiningLabel(meal.diningId)}
                                        </span>
                                    )}
                                </div>
                                {meal?.isAvailable && (
                                    <span className={`badge badge-sm font-bold ${isOfficeMeal ? 'bg-office text-white border-office' : 'badge-primary'}`}>
                                        {meal?.weight}
                                    </span>
                                )}
                            </div>

                            {meal?.isAvailable ? (
                                <div className='space-y-2 mt-2'>
                                    {isEditing ? (
                                        <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                placeholder="Menu details..."
                                                value={meal.menu || ''}
                                                onChange={(e) => handleMenuChange(meal.mealType, e.target.value)}
                                                className='input input-xs input-bordered w-full focus:input-primary'
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-base-content/40 uppercase">Weight:</span>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    value={meal.weight || 1}
                                                    onChange={(e) => handleWeightChange(meal.mealType, e.target.value)}
                                                    className='input input-xs input-bordered w-20'
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-base-content/40 uppercase">Location:</span>
                                                <select
                                                    value={normalizeDiningId(meal.diningId)}
                                                    onChange={(e) => handleDiningChange(meal.mealType, e.target.value)}
                                                    className='select select-xs select-bordered grow focus:select-primary'
                                                >
                                                    {Object.values(DINING_IDS).map(diningId => (
                                                        <option key={diningId} value={diningId}>
                                                            {diningLabels[diningId]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className={`text-sm text-center bangla-text leading-snug ${isOfficeMeal ? 'text-office-content' : 'text-base-content/80'}`}>
                                            {meal.menu || <span className="text-base-content/30 italic">মেন্যু পেন্ডিং</span>}
                                        </p>
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
                    );
                })}
            </div>

            {/* Optional: Footer hint when editing */}
            {isEditing && (
                <div className="px-4 pb-3 flex items-center gap-1.5 text-primary/60">
                    <Info size={12} />
                    <span className="text-[10px] font-medium">Click a meal card to toggle availability</span>
                </div>
            )}
        </div>
    );
};

export default MealCard;
