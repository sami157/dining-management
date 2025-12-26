import { useState } from 'react';
import { format } from 'date-fns';

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
                meal.mealType === mealType
                    ? { ...meal, isAvailable: !meal.isAvailable }
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

    const handleHolidayToggle = () => {
        setEditedSchedule(prev => ({
            ...prev,
            isHoliday: !prev.isHoliday
        }));
    };

    const handleSave = async () => {
        await onUpdate(schedule._id, editedSchedule);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset to original values
        setEditedSchedule({
            isHoliday: schedule.isHoliday,
            availableMeals: schedule.availableMeals
        });
        setIsEditing(false);
    };

    const displayMeals = isEditing ? editedSchedule.availableMeals : schedule.availableMeals;
    const displayHoliday = isEditing ? editedSchedule.isHoliday : schedule.isHoliday;

    return (
        <div className='card bg-base-100 max-w-6xl'>
            <div className='flex items-center justify-between p-8'>
                {/* Date Header */}
                <div className='flex flex-col items-center justify-center gap-4'>
                    <h2 className='text-2xl font-bold'>
                        {format(new Date(schedule.date), 'dd/MM/yyyy')}
                    </h2>

                    <p className='text-lg text-gray-500'>
                        {format(new Date(schedule.date), 'EEEE')}
                    </p>
                </div>

                {/* Holiday Toggle */}
                {/* <div className='flex items-center gap-2 mt-2'>
                    {isEditing ? (
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input
                                type="checkbox"
                                checked={displayHoliday}
                                onChange={handleHolidayToggle}
                                className='checkbox checkbox-secondary'
                            />
                            <span>Mark as Holiday</span>
                        </label>
                    ) : (
                        displayHoliday && <div className='badge badge-secondary'>Holiday</div>
                    )}
                </div> */}

                {/* Meals Section */}
                <div className=''>
                    <div className='flex items-center justify-between gap-3'>
                        {displayMeals?.map((meal, idx) => (
                            <div key={idx} className='h-auto bg-base-200 p-3 rounded-lg'>
                                {/* Meal Type with Checkbox */}
                                <div className='flex items-center gap-2 mb-2'>
                                    {isEditing ? (
                                        <label className='flex items-center gap-2 cursor-pointer'>
                                            <input
                                                type="checkbox"
                                                checked={meal.isAvailable}
                                                onChange={() => handleMealToggle(meal.mealType)}
                                                className='checkbox checkbox-primary'
                                            />
                                            <span className='font-medium'>
                                                {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                                            </span>
                                        </label>
                                    ) : (
                                        <div className='bg-base-100 p-1 rounded-md'>
                                            {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                                            {!meal.isAvailable && ' (Unavailable)'}
                                        </div>
                                    )}
                                </div>

                                {/* Menu Input/Display */}
                                {meal.isAvailable && (
                                    <div className='ml-6'>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                placeholder="Enter menu (optional)"
                                                value={meal.menu || ''}
                                                onChange={(e) => handleMenuChange(meal.mealType, e.target.value)}
                                                className='input input-sm input-bordered w-full'
                                            />
                                        ) : (
                                            <p className='text-sm text-gray-600'>
                                                {meal.menu ? `Menu: ${meal.menu}` : 'No menu specified'}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='card-actions justify-end mt-4'>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className='btn btn-sm btn-primary'>
                                Save
                            </button>
                            <button onClick={handleCancel} className='btn btn-sm btn-ghost'>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className='btn btn-sm btn-outline'>
                            Edit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MealCard;