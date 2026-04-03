export const MEAL_DISPLAY = {
    morning: {
        label: 'Breakfast',
    },
    evening: {
        label: 'Lunch',
    },
    night: {
        label: 'Dinner',
    },
};

export const getMealLabel = (mealType) => {
    return MEAL_DISPLAY[mealType]?.label || mealType;
};

export const getMealShortLabel = (mealType) => {
    return getMealLabel(mealType)?.[0]?.toUpperCase() || '';
};
