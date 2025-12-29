import { useState } from 'react';
import { format } from 'date-fns';
import { CgUnavailable } from "react-icons/cg";
import toast from 'react-hot-toast';
import { MdRestaurantMenu } from 'react-icons/md';
import { FiEdit } from 'react-icons/fi';
import { GiMeal } from 'react-icons/gi';

const MealCard = ({ schedule, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedSchedule, setEditedSchedule] = useState({
        isHoliday: schedule.isHoliday,
        availableMeals: schedule.availableMeals
    });

    const handleMealToggle = (mealType) => {
        setEditedSchedule(prev => {
            const updatedMeals = prev.availableMeals.map(meal => {
                if (meal.mealType === mealType) {
                    return { ...meal, isAvailable: !meal.isAvailable };
                }
                return meal;
            });

            return {
                ...prev,
                availableMeals: updatedMeals
            };
        });
    };

    const handleWeightChange = (mealType, newWeight) => {
        setEditedSchedule(prev => ({
            ...prev,
            availableMeals: prev.availableMeals.map(meal =>
                meal.mealType === mealType
                    ? { ...meal, weight: parseFloat(newWeight) || 0 }
                    : meal
            )
        }));
    };

    const handleMenuChange = (mealType, newMenu) => {
        setEditedSchedule(prev => ({
            ...prev,
            availableMeals: prev.availableMeals.map(meal =>
                meal.mealType === mealType
                    ? { ...meal, menu: newMenu }
                    : meal
            )
        }));
    };

    const handleSave = () => {
        toast.promise(
            async () => {
                await onUpdate(schedule._id, editedSchedule);
                setIsEditing(false);
            },
            {
                loading: 'Processing',
                success: 'Successful',
                error: 'Operation failed',
            }
        )
    };

    const handleCancel = () => {
        setEditedSchedule({
            isHoliday: schedule.isHoliday,
            availableMeals: schedule.availableMeals
        });
        setIsEditing(false);
    };

    const displayMeals = isEditing ? editedSchedule.availableMeals : schedule.availableMeals;
    const displayHoliday = isEditing ? editedSchedule.isHoliday : schedule.isHoliday;

    return (
        <div className='flex gap-4 items-center h-45 w-11/12 md:w-8/10 mx-auto bg-base-100 rounded-xl justify-between p-4'>
            {/* Date and Day */}
            <div className='text-center flex flex-col gap-4 w-1/2'>
                <h2 className='text-2xl font-bold'>
                    {format(new Date(schedule.date), 'dd/MM/yyyy')}
                </h2>

                <div className='flex items-center justify-center gap-2'>
                    <p className='text-lg text-gray-500'>
                        {format(new Date(schedule.date), 'EEEE')}
                    </p>
                </div>
                <div>
                    {/* Edit/Save/Cancel Buttons */}
                    {isEditing ? (
                        <div className='flex justify-center gap-2'>
                            <button onClick={handleSave} className='btn btn-xs btn-primary'>
                                Save
                            </button>
                            <button onClick={handleCancel} className='btn btn-xs'>
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className='btn rounded-full'>
                            <FiEdit /> Edit
                        </button>
                    )}
                </div>
            </div>

            {/* Meals */}
            <div className='flex gap-4 w-full h-full'>
                {displayMeals?.map((meal) => (
                    <div
                        key={meal.mealType}
                        onClick={isEditing ? () => handleMealToggle(meal.mealType) : undefined}
                        className={`${meal?.isAvailable ? 'bg-primary/20' : 'bg-base-200 flex items-center justify-center'} p-3 w-full rounded-xl ${isEditing ? 'hover:bg-primary/30 cursor-pointer' : ''} duration-100 ease-in`}
                    >
                        {meal?.isAvailable ? (
                            <div className='flex flex-col justify-between h-full gap-2'>
                                <div className='rounded-md w-full font-medium'>
                                    {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                                </div>

                                {/* Menu */}
                                {isEditing ? (
                                    <div className='flex flex-col gap-2'>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            placeholder="Weight"
                                            value={meal.weight || 1}
                                            onChange={(e) => handleWeightChange(meal.mealType, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className='input input-xs input-bordered w-20'
                                        />
                                        <input
                                            type="text"
                                            placeholder="Menu"
                                            value={meal.menu || ''}
                                            onChange={(e) => handleMenuChange(meal.mealType, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className='input input-xs input-bordered w-full'
                                        />
                                    </div>

                                ) : (
                                    <div className='p-1 items-center flex flex-col gap-3 rounded-sm bg-primary/20 text-sm'>
                                        <div className='text-5xl'>
                                            <GiMeal />
                                        </div>
                                        {meal.menu || '??'}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='text-center text-5xl'><CgUnavailable /></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MealCard;