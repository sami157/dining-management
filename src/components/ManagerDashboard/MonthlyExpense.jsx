import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { LockKeyhole, PlusCircle, TrendingDown } from 'lucide-react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';

const currency = (value) => `Tk ${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2
})}`;

const CategorySkeleton = () => (
    <div className='flex justify-between py-3 animate-pulse'>
        <div className='skeleton h-4 w-20'></div>
        <div className='skeleton h-4 w-14'></div>
    </div>
);

const ExpenseRowSkeleton = () => (
    <tr>
        <td><div className='skeleton h-3 w-12'></div></td>
        <td><div className='skeleton h-3 w-16'></div></td>
        <td><div className='skeleton h-3 w-14 ml-auto'></div></td>
        <td><div className='skeleton h-3 w-14'></div></td>
        <td><div className='skeleton h-3 w-28'></div></td>
        <td><div className='skeleton h-7 w-16 ml-auto'></div></td>
    </tr>
);

const MonthlyExpense = ({ expensesData, expensesByCategory, monthFinalized, refetchExpenses, isLoading, isRefreshing }) => {
    const axiosSecure = useAxiosSecure();
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseData, setExpenseData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: '',
        amount: 0,
        description: '',
        person: ''
    });
    const [editingExpense, setEditingExpense] = useState(null);

    const openExpenseModal = (existingExpense = null) => {
        if (existingExpense) {
            setEditingExpense(existingExpense);
            setExpenseData({
                date: format(new Date(existingExpense.date), 'yyyy-MM-dd'),
                category: existingExpense.category,
                amount: existingExpense.amount,
                description: existingExpense.description,
                person: existingExpense.person
            });
        } else {
            setEditingExpense(null);
            setExpenseData({
                date: format(new Date(), 'yyyy-MM-dd'),
                category: 'Bazar',
                amount: 0,
                description: '',
                person: ''
            });
        }
        setShowExpenseModal(true);
    };

    const handleExpenseSubmit = async () => {
        if (!expenseData.amount || expenseData.amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (editingExpense) {
            toast.promise(
                async () => {
                    await axiosSecure.put(`/finance/expenses/${editingExpense._id}`, expenseData);
                    setShowExpenseModal(false);
                    refetchExpenses();
                },
                {
                    loading: 'Updating expense',
                    success: 'Expense updated successfully',
                    error: 'Failed to update expense',
                }
            );
        } else {
            toast.promise(
                async () => {
                    await axiosSecure.post('/finance/expenses/add', {
                        ...expenseData,
                        amount: parseFloat(expenseData.amount)
                    });
                    setShowExpenseModal(false);
                    refetchExpenses();
                },
                {
                    loading: 'Adding expense',
                    success: 'Expense added successfully',
                    error: 'Failed to add expense',
                }
            );
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        toast.promise(
            async () => {
                await axiosSecure.delete(`/finance/expenses/${expenseId}`);
                await refetchExpenses();
            },
            {
                loading: 'Deleting expense',
                success: 'Expense deleted successfully',
                error: 'Failed to delete expense',
            }
        );
    };

    const showDeletePopup = (expenseId) => {
        toast.custom((t) => (
            <div className='flex flex-col gap-4 bg-base-100 drop-shadow-2xl p-4 rounded-2xl'>
                <p className='text-center'>Delete this expense?</p>
                <div className='flex justify-between gap-2 items-center'>
                    <button className='btn btn-sm btn-ghost' onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                    <button className='btn btn-sm text-error-content btn-error' onClick={async () => {
                        toast.dismiss(t.id);
                        await handleDeleteExpense(expenseId);
                    }}>
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 6000 }, { style: { padding: '0px' } });
    };

    return (
        <div className='flex flex-col gap-5'>
            <section className='rounded-lg border border-base-300 px-4 py-3'>
                <div className='pb-2'>
                    <h2 className='text-sm font-bold tracking-tight'>Expenses by Category</h2>
                    <p className='text-xs text-base-content/50 mt-0.5'>Live category totals for this month.</p>
                </div>
                <div className='divide-y divide-base-300'>
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => <CategorySkeleton key={index} />)
                    ) : Object.entries(expensesByCategory).length ? Object.entries(expensesByCategory).map(([category, amount]) => (
                        <div key={category} className='flex items-center justify-between gap-4 py-3'>
                            <div className='flex items-center gap-3 text-base-content/60'>
                                <TrendingDown size={18} />
                                <span className='text-sm capitalize'>{category}</span>
                            </div>
                            <span className='text-sm font-semibold text-error'>{currency(amount)}</span>
                        </div>
                    )) : (
                        <p className='py-3 text-sm text-base-content/50'>No expenses recorded.</p>
                    )}
                </div>
            </section>

            <section className='rounded-lg border border-base-300 px-4 py-3'>
                <div className='flex items-start justify-between gap-3 pb-3'>
                    <div>
                        <div className='flex items-center gap-3'>
                            <h2 className='text-sm font-bold tracking-tight'>Expense Log</h2>
                            {isRefreshing && !isLoading && (
                                <span className='flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-base-content/40'>
                                    <span className='loading loading-spinner loading-xs text-primary'></span>
                                    Updating
                                </span>
                            )}
                        </div>
                        <p className='text-xs text-base-content/50 mt-0.5'>Add and review individual expense records.</p>
                    </div>
                    <motion.button
                        onClick={() => openExpenseModal()}
                        disabled={monthFinalized || isLoading}
                        className='btn btn-primary btn-sm'
                    >
                        {monthFinalized ? <LockKeyhole size={16} /> : <PlusCircle size={16} />}
                        Expense
                    </motion.button>
                </div>

                <div className='overflow-x-auto'>
                    <table className='table table-sm'>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th className='text-right'>Amount</th>
                                <th>Person</th>
                                <th>Description</th>
                                <th className='text-right'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, index) => <ExpenseRowSkeleton key={index} />)
                            ) : expensesData?.length ? expensesData.map((expense) => (
                                <tr key={expense._id}>
                                    <td>{format(new Date(expense.date), 'dd MMM')}</td>
                                    <td className='capitalize'>{expense.category}</td>
                                    <td className='text-right font-medium text-error'>{currency(expense.amount)}</td>
                                    <td className='text-xs'>{expense.person || '-'}</td>
                                    <td className='text-xs'>{expense.description || '-'}</td>
                                    <td>
                                        <div className='flex justify-end gap-1'>
                                            <button onClick={() => openExpenseModal(expense)} className='btn btn-xs btn-ghost'>
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => showDeletePopup(expense._id)} className='btn btn-xs btn-ghost text-error'>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className='text-center text-base-content/50 py-6'>No expenses recorded</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <AnimatePresence>
                {showExpenseModal && (
                    <div className="modal modal-open">
                        <motion.div
                            layout
                            initial={{ filter: 'blur(20px)', y: 100 }}
                            animate={{ filter: 'none', y: 0, opacity: 1 }}
                            exit={{ filter: 'blur(20px)', y: 20, opacity: 0 }}
                            className="modal-box w-[94vw] mx-auto"
                        >
                            <h3 className="font-bold text-lg mb-4">
                                {editingExpense ? 'Edit Expense' : 'Add Expense'}
                            </h3>

                            <div className='flex flex-col gap-3'>
                                <div>
                                    <label className='label'>Date</label>
                                    <input
                                        type="date"
                                        value={expenseData.date}
                                        onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                                        className='input input-bordered w-full'
                                    />
                                </div>

                                <div>
                                    <label className='label'>Category</label>
                                    <select
                                        value={expenseData.category}
                                        onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                                        className='select select-bordered w-full'
                                    >
                                        <option value="bazar">Bazar</option>
                                        <option value="gas">Gas</option>
                                        <option value="transport">Transport</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className='label'>Amount (Tk)</label>
                                    <input
                                        type="number"
                                        value={expenseData.amount}
                                        onChange={(e) => setExpenseData({ ...expenseData, amount: parseFloat(e.target.value) })}
                                        className='input input-bordered w-full'
                                        placeholder='Enter amount'
                                    />
                                </div>

                                <div>
                                    <label className='label'>Associated Person</label>
                                    <select
                                        value={expenseData.person}
                                        onChange={(e) => setExpenseData({ ...expenseData, person: e.target.value })}
                                        className='select select-bordered w-full'
                                    >
                                        <option value="">Select Person</option>
                                        <option value="jakir">Jakir</option>
                                        <option value="sohan">Sohan</option>
                                        <option value="kawsar">Kawsar</option>
                                        <option value="sifat">Sifat</option>
                                        <option value="rashed">Rashed</option>
                                        <option value="hamid">Hamid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className='label'>Description (Optional)</label>
                                    <textarea
                                        value={expenseData.description}
                                        onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                                        className='textarea textarea-bordered w-full'
                                        placeholder='Add description'
                                    />
                                </div>
                            </div>

                            <div className="modal-action">
                                <button onClick={handleExpenseSubmit} className='btn btn-primary'>
                                    {editingExpense ? 'Update' : 'Add'} Expense
                                </button>
                                <button onClick={() => setShowExpenseModal(false)} className='btn'>
                                    Cancel
                                </button>
                            </div>
                        </motion.div>

                        <div className="modal-backdrop" onClick={() => setShowExpenseModal(false)}></div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MonthlyExpense;
