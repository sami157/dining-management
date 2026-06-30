import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addMonths, format, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Edit2, MessageSquareText } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useAxiosSecure from '../hooks/useAxiosSecure';
import MealCommentModal from '../components/MealCommentModal';
import { getMealLabel } from '../utils/mealTypes';

const UserComments = () => {
    const axiosSecure = useAxiosSecure();
    const { loading } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [editingRow, setEditingRow] = useState(null);
    const monthString = format(currentMonth, 'yyyy-MM');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['userMealComments', monthString],
        enabled: !loading,
        queryFn: async () => {
            const response = await axiosSecure.get(`/users/meals/available?month=${monthString}`);
            return response.data;
        }
    });

    const rows = useMemo(() => {
        return (data?.schedules || []).flatMap((schedule) => {
            const dateLabel = format(new Date(schedule.date), 'yyyy-MM-dd');

            return (schedule.meals || [])
                .filter((meal) => meal.isRegistered && meal.registrationId && meal.comment?.trim())
                .map((meal) => ({
                    id: `${dateLabel}-${meal.mealType}`,
                    date: dateLabel,
                    mealType: meal.mealType,
                    registrationId: meal.registrationId,
                    description: meal.comment.trim(),
                }));
        });
    }, [data]);

    const openEdit = (row) => {
        setEditingRow(row);
    };

    const handleSave = async (comment) => {
        if (!editingRow) return;

        const savePromise = axiosSecure.patch(`/users/meals/register/${editingRow.registrationId}/comment`, {
            comment: comment.trim(),
        }).then(() => {
            refetch();
            setEditingRow(null);
        });

        toast.promise(savePromise, {
            loading: 'Saving comment...',
            success: 'Comment updated',
            error: 'Failed to save comment',
        });
    };

    return (
        <div className="p-4 md:p-6">
            <div className="max-w-5xl mx-auto flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Comments</h1>
                        <p className="text-sm text-base-content/50">Registered meal comments for the selected month.</p>
                    </div>
                    <div className="flex items-center justify-between border border-base-300/70 p-2 rounded-lg max-w-md mx-auto w-full sm:w-72">
                        <button
                            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                            className="p-1.5 cursor-pointer hover:bg-base-200 rounded-full transition-all active:scale-95"
                            aria-label="Previous month"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-sm md:text-base font-bold uppercase px-6">{format(currentMonth, 'MMMM yyyy')}</h2>
                        <button
                            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                            className="p-1.5 cursor-pointer hover:bg-base-200 rounded-full transition-all active:scale-95"
                            aria-label="Next month"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra table-sm">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Meal Type</th>
                                    <th>Description</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-40">
                                                <MessageSquareText size={40} />
                                                <p className="text-sm font-semibold skeleton skeleton-text uppercase tracking-widest">Loading Comments...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : rows.length ? rows.map((row) => (
                                    <tr key={row.id}>
                                        <td>{format(new Date(row.date), 'dd MMM yyyy')}</td>
                                        <td>{getMealLabel(row.mealType)}</td>
                                        <td className="max-w-xl whitespace-normal break-words">{row.description}</td>
                                        <td className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(row)}
                                                className="btn btn-ghost btn-sm whitespace-nowrap"
                                            >
                                                <Edit2 size={14} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-40">
                                                <MessageSquareText size={40} />
                                                <p className="text-sm font-semibold uppercase tracking-widest">No comments found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <MealCommentModal
                open={Boolean(editingRow)}
                title={editingRow ? `${format(new Date(editingRow.date), 'EEEE, dd MMMM yyyy')} - ${getMealLabel(editingRow.mealType)}` : 'Meal Comment'}
                initialComment={editingRow?.description || ''}
                saving={false}
                onClose={() => setEditingRow(null)}
                onSave={handleSave}
            />
        </div>
    );
};

export default UserComments;
