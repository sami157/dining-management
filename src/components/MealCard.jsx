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
        <div className='flex flex-col md:flex-row gap-2 justify-between bg-base-100 rounded-xl p-3 w-full'>

            {/* Date and Day */}
            <div className='flex flex-col items-center md:items-start justify-center mx-auto gap-2 w-full md:w-2/7 text-center md:text-left'>
                <div>
                    <h2 className='text-lg font-bold'>
                        {format(new Date(schedule.date), 'dd/MM/yyyy')}
                    </h2>
                    <p className='text-base-content/50 text-sm sm:text-base'>
                        {format(new Date(schedule.date), 'EEEE')}
                    </p>
                </div>

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
                    <button onClick={() => setIsEditing(true)} className='btn btn-sm btn-ghost flex items-center gap-1'>
                        <FiEdit /> Edit
                    </button>
                )}
            </div>

            {/* Meals */}
            <div className='flex justify-end gap-3 w-full'>
                {displayMeals?.map((meal) => (
                    <div
                        key={meal.mealType}
                        onClick={isEditing ? () => handleMealToggle(meal.mealType) : undefined}
                        className={`flex flex-col justify-between p-3 rounded-lg w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33%-1rem)] 
                        ${meal?.isAvailable ? 'bg-primary/20' : 'bg-base-200 flex items-center justify-center'} 
                        ${isEditing ? 'hover:bg-primary/30 cursor-pointer' : ''} duration-100 ease-in`}
                    >
                        {meal?.isAvailable ? (
                            <div className='flex flex-col gap-1 h-full'>
                                <div className='flex justify-between items-center'>
                                    <div className='font-medium'>
                                        {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                                    </div>
                                    <p className='px-2 text-xs sm:text-sm font-bold rounded bg-primary text-primary-content'>
                                        {meal?.weight}
                                    </p>
                                </div>

                                {/* Menu */}
                                {isEditing ? (
                                    <div className='flex flex-col gap-2 mt-2'>
                                        <input
                                            type="text"
                                            placeholder="Menu"
                                            value={meal.menu || ''}
                                            onChange={(e) => handleMenuChange(meal.mealType, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className='input input-xs sm:input-sm w-full input-bordered'
                                        />
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
                                    </div>
                                ) : (
                                    <div className='flex flex-col items-center justify-center mt-2 text-sm'>
                                        <span className={`text-center ${meal.menu ? 'text-primary-content font-italic' : 'text-primary-content/50'}`}>{meal.menu || 'Menu not specified'}</span>
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
