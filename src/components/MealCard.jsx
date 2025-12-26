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
        <div className='flex gap-4 items-center h-45 w-11/12 md:w-8/10 mx-auto bg-base-100 rounded-xl justify-between p-4'>
            {/* Date and Day */}
            <div className='text-center flex flex-col gap-4 w-1/2'>
                <h2 className='text-2xl font-bold'>
                    {format(new Date(schedule.date), 'dd/MM/yyyy')}
                </h2>

                <p className='text-lg text-gray-500'>
                    {format(new Date(schedule.date), 'EEEE')}
                </p>
            </div>

            {/* Meals */}
            <div className='flex gap-4 w-full h-full'>
                {displayMeals?.map((meal, idx) => (
                    <div key={idx} className='bg-base-200 p-3 w-full rounded-xl hover:bg-base-200/50 duration-100 ease-in cursor-pointer'>
                            {/* Meal Type with Checkbox */}
                            <div className='flex gap-2'>
                                <div className='cursor-default rounded-md w-full'>
                                    {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                                </div>
                            </div>
                        </div>
                ))}
            </div>
        </div>
    );
};

export default MealCard;