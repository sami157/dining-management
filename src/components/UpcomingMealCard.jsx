import { format } from 'date-fns';
import { GiMeal } from 'react-icons/gi';
import { FiUsers } from 'react-icons/fi';
import { FaUserCheck } from "react-icons/fa";

const UpcomingMealCard = ({ date, schedule, registrations = [] }) => {
  console.log(schedule)
  // Check if date is today
  const isToday = () => {
    const today = new Date();
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  // Get available meals
  const availableMeals = schedule?.availableMeals?.filter(m => m.isAvailable) || [];

  // Count registrations per meal type
  const getRegistrationCount = (mealType) => {
    return registrations.filter(reg => 
      reg.mealType === mealType && 
      format(new Date(reg.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).length;
  };

  // Total registrations for the day
  const totalRegistrations = registrations.filter(reg => 
    format(new Date(reg.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  ).length;

  return (
    <div className={`card bg-linear-to-br from-base-100 to-base-200 shadow-xl hover:shadow-2xl transition-all duration-300`}>
      <div className='card-body'>
        {/* Header */}
        <div className='flex justify-between items-start mb-4'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              {isToday() && (
                <div className='badge badge-primary gap-1'>
                  <span className='text-xs'>●</span> Today
                </div>
              )}
            </div>
            <h2 className='text-3xl font-bold'>
              {format(date, 'EEE')}
            </h2>
            <p className='text-base text-gray-500'>
              {format(date, 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        {/* Meals */}
        <div className='space-y-3'>
          {availableMeals.length > 0 ? (
            availableMeals.map((meal, idx) => {
              const regCount = getRegistrationCount(meal.mealType);
              
              return (
                <div key={idx} className='bg-base-200 rounded-xl p-4'>
                  {/* Meal Header */}
                  <div className='flex justify-between items-center mb-3'>
                    <div className='flex items-center gap-2'>
                      <div className='bg-primary/20 p-2 rounded-lg'>
                        <GiMeal className='text-primary text-3xl' />
                      </div>
                      <div>
                        <h3 className='font-bold capitalize text-base-content'>
                          {meal.mealType}
                        </h3>
                        <div className='flex items-center gap-2 mt-0.5'>
                          <span className='text-xs px-3 py-1 rounded-md bg-base-100 font-semibold text-gray-500'>{meal.weight || 1}</span>
                        </div>
                      </div>
                    </div>
                    
                      {regCount > 0 && (
                        <div className='bg-primary flex gap-2 items-center text-primary-content px-3 py-1 rounded-lg'>
                              <FaUserCheck />
                              <span className='font-medium text-primary-content'>{regCount}</span>
                              </div>
                          )}
                  </div>
                  
                  {/* Menu */}
                  {meal.menu ? (
                    <div className='bg-base-300/50 rounded-lg p-2 mt-2'>
                      <p className='text-sm text-center text-base-content'>{meal.menu}</p>
                    </div>
                  ) : (
                    <div className='bg-base-200/30 rounded-lg p-2 mt-2 text-center'>
                      <p className='text-xs text-gray-400 italic'>No menu specified</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className='flex flex-col items-center justify-center py-12 bg-base-200/30 rounded-xl'>
              <div className='text-6xl mb-3 opacity-30'>🍽️</div>
              <p className='text-lg font-medium text-gray-400'>No Meals Scheduled</p>
              <p className='text-xs text-gray-400 mt-1'>Check back later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingMealCard;