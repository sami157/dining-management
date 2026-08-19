import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Edit2, Trash2, XCircle, Info } from 'lucide-react'; // Modern icons
import { getMealLabel } from '../utils/mealTypes';

const MealCard = ({ schedule, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedSchedule, setEditedSchedule] = useState({
        isHoliday: schedule.isHoliday,
        availableMeals: schedule.availableMeals
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

    const handleDelete = async () => {
        await onDelete(schedule._id);
    };
    const handleSave = async () => {
        await onUpdate(schedule._id, editedSchedule);
        setIsEditing(false)
    };

    const handleCancel = () => {
        setEditedSchedule({
            isHoliday: schedule.isHoliday,
            availableMeals: schedule.availableMeals
        });
        setIsEditing(false);
    };

    const displayMeals = isEditing ? editedSchedule.availableMeals : schedule.availableMeals;

    return (
        <div className={`group flex h-full min-h-[560px] flex-col overflow-hidden bg-base-100 rounded-2xl border transition-all duration-200 
            ${isEditing ? 'border-primary shadow-2xl ring-1 ring-primary/20' : 'border-base-300'}`}>

            {/* Top Header: Date and Actions */}
            <div className='flex min-h-[76px] items-start justify-between p-4 border-b border-base-200 bg-base-50/30'>
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
                        onClick={isEditing ? () => handleMealToggle(meal.mealType) : undefined}
                        className={`relative flex min-h-32 flex-1 flex-col overflow-hidden rounded-xl border transition-all 
                        ${meal?.isAvailable ? 'bg-primary/5 border-primary/20' : 'bg-base-200/50 border-transparent opacity-60'} 
                        ${isEditing ? 'cursor-pointer hover:border-primary/40' : ''}`}
                    >
                        <div className='p-3'>
                            <div className='flex justify-between text-sm items-center'>
                                <span className={`font-bold uppercase tracking-widest ${meal?.isAvailable ? 'text-primary' : 'text-base-content/40'}`}>
                                    {
                                        getMealLabel(meal.mealType)
                                    }
                                </span>
                                {meal?.isAvailable && (
                                    <span className='font-black'>
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
                                                className='input input-sm input-bordered h-10 w-full focus:input-primary'
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-base-content/40 uppercase">Weight:</span>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={meal.weight || 1}
                                                    onChange={(e) => handleWeightChange(meal.mealType, e.target.value)}
                                                    className='input input-sm input-bordered h-10 w-24'
                                                />
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
        </div>
    );
};

export default MealCard;
