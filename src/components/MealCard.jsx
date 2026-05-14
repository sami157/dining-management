import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Edit2, Trash2, X, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMealLabel } from '../utils/mealTypes';
import { DINING_IDS, diningLabels, getDiningIndicatorClass, getDiningLabel, isOfficeDining, normalizeDiningId } from '../utils/dining';

const normalizeMeals = (meals = []) => meals.map(meal => ({
    ...meal,
    diningId: normalizeDiningId(meal.diningId),
    allowAlt: Boolean(meal.allowAlt),
}));

const MealCard = ({ schedule, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedSchedule, setEditedSchedule] = useState({
        isHoliday: schedule.isHoliday,
        availableMeals: normalizeMeals(schedule.availableMeals),
    });

    const displayMeals = normalizeMeals(schedule.availableMeals);

    const handleStartEditing = () => {
        setEditedSchedule({
            isHoliday: schedule.isHoliday,
            availableMeals: normalizeMeals(schedule.availableMeals),
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedSchedule({
            isHoliday: schedule.isHoliday,
            availableMeals: normalizeMeals(schedule.availableMeals),
        });
        setIsEditing(false);
    };

    const handleSave = async () => {
        await onUpdate(schedule._id, editedSchedule);
        setIsEditing(false);
    };

    const updateMeal = (mealType, patch) => {
        setEditedSchedule(prev => ({
            ...prev,
            availableMeals: prev.availableMeals.map(meal =>
                meal.mealType === mealType ? { ...meal, ...patch } : meal
            ),
        }));
    };

    const handleDelete = () => {
        toast.custom((t) => (
            <div className="flex w-80 max-w-[92vw] flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xl">
                <div>
                    <p className="text-sm font-black uppercase tracking-wide text-error">Delete schedule?</p>
                    <p className="mt-1 text-xs text-base-content/60">
                        {format(new Date(schedule.date), 'EEEE, MMM dd, yyyy')}
                    </p>
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-error text-error-content"
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await onDelete(schedule._id);
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 8000 });
    };

    const renderMealSummary = (meal) => {
        const isOfficeMeal = isOfficeDining(meal.diningId);
        const mealTone = meal.isAvailable
            ? isOfficeMeal
                ? 'bg-office-soft border-office-soft'
                : 'bg-primary/5 border-primary/20'
            : isOfficeMeal
                ? 'bg-office-soft border-office-soft opacity-60'
                : 'bg-base-200/50 border-transparent opacity-60';

        return (
            <div key={meal.mealType} className={`relative overflow-hidden rounded-xl border transition-all ${mealTone}`}>
                <div className="p-3">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-xs font-bold uppercase tracking-widest ${meal.isAvailable ? isOfficeMeal ? 'text-office-content' : 'text-primary' : 'text-base-content/40'}`}>
                                {getMealLabel(meal.mealType)}
                            </span>
                            {isOfficeMeal && (
                                <span className={`border px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getDiningIndicatorClass(meal.diningId)}`}>
                                    {getDiningLabel(meal.diningId)}
                                </span>
                            )}
                        </div>
                        {meal.isAvailable && (
                            <span className={`px-2 py-0.5 rounded-md bg-primary text-primary-content text-sm font-bold ${isOfficeMeal ? 'bg-office text-white border-office' : 'badge-primary'}`}>
                                {meal.weight}
                            </span>
                        )}
                    </div>

                    {meal.isAvailable ? (
                        <div className="space-y-2 mt-2">
                            <p className={`text-sm text-center bangla-text leading-snug ${isOfficeMeal ? 'text-office-content' : 'text-base-content/80'}`}>
                                {meal.menu || <span className="text-base-content/30 italic">Menu pending</span>}
                            </p>
                            {meal.allowAlt && (
                                <div className="text-center">
                                    <span className="badge badge-xs badge-outline font-black uppercase tracking-widest">
                                        Alt Allowed
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 py-1">
                            <XCircle size={14} className="text-base-content/30" />
                            <span className="text-xs font-medium text-base-content/40 italic">Unavailable</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={`group flex flex-col bg-base-100 rounded-2xl border transition-all duration-200 ${isEditing ? 'border-primary ring-1 ring-primary/20' : 'border-base-300'}`}>
                <div className="flex items-start justify-between p-4 border-b border-base-200 bg-base-50/30">
                    <div>
                        <div className="flex gap-2">
                            <h2 className="font-bold text-base md:text-lg">
                                {format(new Date(schedule.date), 'MMM dd, yyyy')}
                            </h2>
                            <button
                                disabled={isEditing}
                                onClick={handleDelete}
                                className="text-error cursor-pointer rounded-full disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <p className="text-xs font-medium uppercase tracking-wider text-base-content/50">
                            {format(new Date(schedule.date), 'EEEE')}
                        </p>
                    </div>

                    <button
                        disabled={isEditing}
                        onClick={handleStartEditing}
                        className="hover:bg-base-300 border border-base-200 cursor-pointer p-2 rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    {displayMeals?.map(renderMealSummary)}
                </div>
            </div>

            {isEditing && (
                <div className="modal modal-open">
                    <div className="modal-box w-[94vw] max-w-xl p-0 overflow-hidden border border-base-300">
                        <div className="flex items-start justify-between gap-4 border-b border-base-300 bg-base-200/60 p-5">
                            <div>
                                <h3 className="text-lg font-black uppercase italic tracking-tight">Edit Schedule</h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-base-content/50">
                                    {format(new Date(schedule.date), 'EEEE, MMM dd, yyyy')}
                                </p>
                            </div>
                            <button onClick={handleCancel} className="btn btn-sm btn-ghost btn-circle">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
                            {editedSchedule.availableMeals?.map((meal) => {
                                const isOfficeMeal = isOfficeDining(meal.diningId);

                                return (
                                    <div
                                        key={meal.mealType}
                                        className={`rounded-xl border p-4 space-y-3 ${isOfficeMeal ? 'bg-office-soft border-office-soft' : 'bg-base-100 border-base-300'}`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`text-sm font-black uppercase tracking-widest ${isOfficeMeal ? 'text-office-content' : 'text-primary'}`}>
                                                    {getMealLabel(meal.mealType)}
                                                </span>
                                                {isOfficeMeal && (
                                                    <span className={`border px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getDiningIndicatorClass(meal.diningId)}`}>
                                                        {getDiningLabel(meal.diningId)}
                                                    </span>
                                                )}
                                            </div>
                                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-base-content/50">
                                                Available
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-sm toggle-primary"
                                                    checked={Boolean(meal.isAvailable)}
                                                    onChange={() => updateMeal(meal.mealType, { isAvailable: !meal.isAvailable })}
                                                />
                                            </label>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Menu details..."
                                            value={meal.menu || ''}
                                            onChange={(event) => updateMeal(meal.mealType, { menu: event.target.value })}
                                            className="input input-sm input-bordered w-full focus:input-primary"
                                            disabled={!meal.isAvailable}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <label className="form-control">
                                                <span className="label-text text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-1">Weight</span>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    value={meal.weight || 1}
                                                    onChange={(event) => updateMeal(meal.mealType, { weight: parseFloat(event.target.value) || 0 })}
                                                    className="input input-sm input-bordered"
                                                    disabled={!meal.isAvailable}
                                                />
                                            </label>

                                            <label className="form-control">
                                                <span className="label-text text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-1">Location</span>
                                                <select
                                                    value={normalizeDiningId(meal.diningId)}
                                                    onChange={(event) => updateMeal(meal.mealType, { diningId: normalizeDiningId(event.target.value) })}
                                                    className="select select-sm select-bordered focus:select-primary"
                                                    disabled={!meal.isAvailable}
                                                >
                                                    {Object.values(DINING_IDS).map(diningId => (
                                                        <option key={diningId} value={diningId}>
                                                            {diningLabels[diningId]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>

                                        <label className="flex items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-100/70 px-3 py-2">
                                            <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-widest">Allow Alternative</span>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-sm toggle-primary"
                                                checked={Boolean(meal.allowAlt)}
                                                onChange={(event) => updateMeal(meal.mealType, { allowAlt: event.target.checked })}
                                                disabled={!meal.isAvailable}
                                            />
                                        </label>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-base-300 bg-base-100 p-4">
                            <button onClick={handleCancel} className="btn btn-ghost">
                                Cancel
                            </button>
                            <button onClick={handleSave} className="btn btn-primary">
                                <Check size={18} />
                                Save
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40" onClick={handleCancel}></div>
                </div>
            )}
        </>
    );
};

export default MealCard;
