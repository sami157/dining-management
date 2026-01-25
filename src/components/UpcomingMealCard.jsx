import { format } from 'date-fns';
import { GiMeal } from 'react-icons/gi';
import { FaUserCheck } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import toast from 'react-hot-toast';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { MdRadioButtonUnchecked } from "react-icons/md";
import { IoIosCheckmarkCircle } from "react-icons/io";
import useAuth from '../hooks/useAuth';

const UpcomingMealCard = ({ date, schedule, registrations = [], refetch }) => {
  const axiosSecure = useAxiosSecure();
  const { loading } = useAuth()

  const isToday = () => {
    const today = new Date();
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  const meals = schedule?.meals || [];
  const dateStr = format(date, 'yyyy-MM-dd');

  // Count registrations per meal type for this date
  const mealCounts = registrations
    .filter(r => r.date === dateStr)
    .reduce((acc, r) => {
      acc[r.mealType] = (acc[r.mealType] || 0) + 1;
      return acc;
    }, {});

  const handleMealAction = async (meal) => {
    if (meal.isRegistered && meal.registrationId) {
      toast.promise(
        async () => {
          await axiosSecure.delete(
            `/users/meals/register/cancel/${meal.registrationId}`
          );
          refetch();
        },
        {
          loading: 'Cancelling...',
          success: 'Registration cancelled',
          error: 'Failed to cancel registration'
        }
      );
      return;
    }

    if (!meal.canRegister) {
      toast.error('Deadline has passed');
      return;
    }

    toast.promise(
      async () => {
        await axiosSecure.post('/users/meals/register', {
          date: dateStr,
          mealType: meal.mealType
        });
        refetch();
      },
      {
        loading: 'Registering...',
        success: 'Meal registered',
        error: 'Failed to register meal'
      }
    );
  };
  return (
    !loading &&
    <div className="rounded-2xl bg-base-100 transition">
      <div className="p-6 space-y-4 rounded-2xl">
            <div>
              {/* Header */}
              <div>
                {isToday() && <span className="badge badge-primary">Today</span>}
                <h2 className="text-2xl font-bold mt-1">
                  {format(date, 'EEEE')}
                </h2>
                <p className="text-sm text-gray-500">
                  {format(date, 'dd MMM yyyy')}
                </p>
              </div>

              {/* Meals */}
              <div className="space-y-4">
                {meals?.length > 0 ? meals?.map((meal) => (
                  <div
                    key={meal.mealType}
                    className={`p-4 rounded-lg space-y-3 transition
                ${meal.isRegistered
                        ? 'bg-primary/20'
                        : 'bg-base-200'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <GiMeal className="text-base-content text-4xl" />
                        <div className='flex flex-col gap-1'>
                          <h3 className="capitalize font-semibold">
                            {meal.mealType}<span className='ml-2 bg-base-100 px-3 py-1 rounded-md'>{meal.weight}</span>
                          </h3>
                          <span className="text-xs text-gray-500">
                            {/* Total Registered Count */}
                            <div className="flex items-center text-[14px] gap-2 text-gray-500">
                              <FaUsers />
                              <span>
                                {mealCounts[meal.mealType] || 0}
                              </span>
                            </div>
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      {meal.isRegistered ? (
                        <button
                          onClick={() => handleMealAction(meal)}
                          className="text-2xl text-primary hover:scale-120 transition cursor-pointer hover:text-base-content/10 active:scale-70"
                        >
                          <IoIosCheckmarkCircle />
                        </button>
                      ) : meal.isAvailable && meal.canRegister && (
                        <button
                          onClick={() => handleMealAction(meal)}
                          className="text-2xl text-base-content hover:scale-120 transition cursor-pointer hover:text-primary active:scale-70"
                        >
                          <MdRadioButtonUnchecked />
                        </button>
                      )}
                    </div>

                    {/* Menu */}
                    {meal.menu ? (
                      <div className="bg-base-100/70 rounded-md p-2 text-sm text-center">
                        {meal.menu}
                      </div>
                    ) : (
                      <p className="text-center rounded p-2 text-base-content/30 italic">
                        No menu specified
                      </p>
                    )}
                  </div>
                )) : (
                  <p className="text-center text-base-content/30">
                    No meals scheduled
                  </p>
                )}
              </div>
            </div>
      </div>
    </div>
  );
};

export default UpcomingMealCard;
