import { useState } from 'react';
import { format } from 'date-fns';
import { CgUnavailable } from "react-icons/cg";
import toast from 'react-hot-toast';
import { FiEdit } from 'react-icons/fi';
import { GiMeal } from 'react-icons/gi';

const MealCard = ({ schedule, onUpdate }) => {
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

    const handleSave = () => {
        toast.promise(
            async () => {
                await onUpdate(schedule._id, editedSchedule);
                setIsEditing(false);
            },
            { loading: 'Processing', success: 'Successful', error: 'Operation failed' }
        );
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
        <div className='flex flex-col md:flex-row gap-2 bg-base-100 rounded-xl p-4 w-full'>
            
            {/* Date and Day */}
            <div className='flex flex-col items-center md:items-start gap-4 w-full md:w-1/3 text-center md:text-left'>
                <h2 className='text-xl sm:text-2xl font-bold'>
                    {format(new Date(schedule.date), 'dd/MM/yyyy')}
                </h2>
                <p className='text-gray-500 text-sm sm:text-base'>
                    {format(new Date(schedule.date), 'EEEE')}
                </p>

                {/* Edit/Save/Cancel Buttons */}
                {isEditing ? (
                    <div className='flex gap-2 justify-center md:justify-start'>
                        <button onClick={handleSave} className='btn btn-xs btn-primary'>
                            Save
                        </button>
                        <button onClick={handleCancel} className='btn btn-xs'>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className='btn btn-sm flex items-center gap-1'>
                        <FiEdit /> Edit
                    </button>
                )}
            </div>

            {/* Meals */}
            <div className='flex flex-wrap gap-4 w-full md:w-2/3'>
                {displayMeals?.map((meal) => (
                    <div
                        key={meal.mealType}
                        onClick={isEditing ? () => handleMealToggle(meal.mealType) : undefined}
                        className={`flex flex-col justify-between p-3 rounded-xl w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33%-1rem)] 
                        ${meal?.isAvailable ? 'bg-primary/20' : 'bg-base-200 flex items-center justify-center'} 
                        ${isEditing ? 'hover:bg-primary/30 cursor-pointer' : ''} duration-100 ease-in`}
                    >
                        {meal?.isAvailable ? (
                            <div className='flex flex-col gap-2 h-full'>
                                <div className='flex justify-between items-center'>
                                    <div className='font-medium'>
                                        {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                                    </div>
                                    <p className='px-2 py-1 text-xs sm:text-sm font-bold rounded bg-primary text-primary-content'>
                                        {meal?.weight}
                                    </p>
                                </div>

                                {/* Menu */}
                                {isEditing ? (
                                    <div className='flex flex-col gap-2 mt-2'>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            placeholder="Weight"
                                            value={meal.weight || 1}
                                            onChange={(e) => handleWeightChange(meal.mealType, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className='input input-xs sm:input-sm input-bordered w-full'
                                        />
                                        <input
                                            type="text"
                                            placeholder="Menu"
                                            value={meal.menu || ''}
                                            onChange={(e) => handleMenuChange(meal.mealType, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className='input input-xs sm:input-sm input-bordered w-full'
                                        />
                                    </div>
                                ) : (
                                    <div className='flex flex-col items-center justify-center bg-primary/20 rounded p-2 mt-2 text-sm'>
                                        <GiMeal className='text-3xl sm:text-4xl' />
                                        <span>{meal.menu || '??'}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='flex justify-center items-center h-full text-4xl sm:text-5xl'>
                                <CgUnavailable />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MealCard;
