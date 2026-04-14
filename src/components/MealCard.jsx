import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Dot, Info, PencilLine, Trash2, X, XCircle } from 'lucide-react';

import { getMealLabel } from '../utils/mealTypes';
import { Input } from './ui/input';

const MealCard = ({ schedule, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedSchedule, setEditedSchedule] = useState({
        isHoliday: schedule.isHoliday,
        availableMeals: schedule.availableMeals,
    });

    const handleMealToggle = (mealType) => {
        setEditedSchedule((prev) => ({
            ...prev,
            availableMeals: prev.availableMeals.map((meal) =>
                meal.mealType === mealType ? { ...meal, isAvailable: !meal.isAvailable } : meal
            ),
        }));
    };

    const handleWeightChange = (mealType, newWeight) => {
        setEditedSchedule((prev) => ({
            ...prev,
            availableMeals: prev.availableMeals.map((meal) =>
                meal.mealType === mealType ? { ...meal, weight: parseFloat(newWeight) || 0 } : meal
            ),
        }));
    };

    const handleMenuChange = (mealType, newMenu) => {
        setEditedSchedule((prev) => ({
            ...prev,
            availableMeals: prev.availableMeals.map((meal) =>
                meal.mealType === mealType ? { ...meal, menu: newMenu } : meal
            ),
        }));
    };

    const handleDelete = async () => {
        await onDelete(schedule._id);
    };

    const handleSave = async () => {
        await onUpdate(schedule._id, editedSchedule);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedSchedule({
            isHoliday: schedule.isHoliday,
            availableMeals: schedule.availableMeals,
        });
        setIsEditing(false);
    };

    const displayMeals = isEditing ? editedSchedule.availableMeals : schedule.availableMeals;

    return (
        <article
            className={`group relative overflow-hidden rounded-[1.75rem] border bg-card text-card-foreground shadow-lg shadow-black/5 transition-all duration-300 ${isEditing
                ? 'border-primary/40 ring-1 ring-primary/20 shadow-2xl shadow-primary/10'
                : 'border-border/70 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10'
                }`}
        >
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent" />

            <header className="relative flex items-start justify-between gap-4 border-b border-border/70 px-5 pb-4 pt-5">
                <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-primary">
                        <Dot size={14} className="-mx-1" />
                        {schedule.isHoliday ? 'Holiday Schedule' : 'Meal Schedule'}
                    </div>

                    <h2 className="text-base font-black tracking-tight md:text-lg">
                        {format(new Date(schedule.date), 'MMM dd, yyyy')}
                    </h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                        {format(new Date(schedule.date), 'EEEE')}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        disabled={isEditing}
                        onClick={handleDelete}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Delete schedule"
                    >
                        <Trash2 size={16} />
                    </button>

                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                aria-label="Cancel changes"
                            >
                                <X size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                            >
                                <Check size={18} />
                                Save
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                            <PencilLine size={16} />
                            Edit
                        </button>
                    )}
                </div>
            </header>

            <div className="relative space-y-3 px-5 py-5">
                {displayMeals?.map((meal) => (
                    <section
                        key={meal.mealType}
                        onClick={isEditing ? () => handleMealToggle(meal.mealType) : undefined}
                        className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${meal?.isAvailable
                            ? 'border-primary/20 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent'
                            : 'border-border/60 bg-muted/55'
                            } ${isEditing ? 'cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10' : ''}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${meal?.isAvailable
                                        ? 'bg-primary/12 text-primary'
                                        : 'bg-background text-muted-foreground'
                                        }`}
                                >
                                    {getMealLabel(meal.mealType)}
                                </span>

                                <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                    {meal?.isAvailable ? 'Available for booking' : 'Unavailable'}
                                </p>
                            </div>

                            {meal?.isAvailable ? (
                                <div className="shrink-0 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-sm font-semibold text-primary">
                                    {meal?.weight} kg
                                </div>
                            ) : (
                                <div className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Off
                                </div>
                            )}
                        </div>

                        {meal?.isAvailable ? (
                            <div className="mt-4 space-y-3">
                                {isEditing ? (
                                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                                        <Input
                                            type="text"
                                            placeholder="Menu details..."
                                            value={meal.menu || ''}
                                            onChange={(e) => handleMenuChange(meal.mealType, e.target.value)}
                                            className="min-h-11 border border-border/70 bg-background px-3"
                                        />
                                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Weight</span>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                value={meal.weight || 1}
                                                onChange={(e) => handleWeightChange(meal.mealType, e.target.value)}
                                                className="h-9 w-24 border border-border/70 bg-muted text-center font-semibold"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="bangla-text rounded-xl border border-border/50 bg-background/70 px-3 py-3 text-center text-sm leading-snug text-foreground/80">
                                        {meal.menu || <span className="italic text-muted-foreground">Menu pending</span>}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/50 px-3 py-3 text-muted-foreground">
                                <XCircle size={14} />
                                <span className="text-sm italic">No meal will be served for this slot</span>
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {isEditing && (
                <footer className="flex items-center gap-1.5 border-t border-border/70 px-5 pb-4 pt-3 text-primary/70">
                    <Info size={12} />
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
                        Click a meal row to toggle availability
                    </span>
                </footer>
            )}
        </article>
    );
};

export default MealCard;
