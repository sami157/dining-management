import React from 'react';

const MealCard = ({ schedule }) => {
    const offeredMeals = schedule?.availableMeals?.filter(meal => meal.isAvailable === true)
    return (
        <div>
            {
                offeredMeals.map((m, index) => 
                    <p key={index}>{m.mealType}</p>
                )
            }
        </div>
    );
};

export default MealCard;