import { useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { IoIosAddCircle } from "react-icons/io";
import { format } from 'date-fns';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';

const MonthlyExpense = ({ expensesData, expensesByCategory, monthFinalized, refetchExpenses }) => {
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

    // Update openExpenseModal
    const openExpenseModal = (existingExpense = null) => {
        if (existingExpense) {
            setEditingExpense(existingExpense);
            setExpenseData({
                date: format(new Date(existingExpense.date), 'yyyy-MM-dd'),
                category: existingExpense.category,
                amount: existingExpense.amount,
                description: existingExpense.description
            });
        } else {
            setEditingExpense(null);
            setExpenseData({
                date: format(new Date(), 'yyyy-MM-dd'),
                category: 'Bazar',
                amount: '',
                description: ''
            });
        }
        setShowExpenseModal(true);
    };

    // Handle expense submission
    const handleExpenseSubmit = async () => {
        if (!expenseData.amount || expenseData.amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (editingExpense) {
            // Update existing expense
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
            )

        } else {
            // Add new expense
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
            )
        }
    };

    const showDeletePopup = (expenseId) => {
        toast.custom((t) => (
            <div className='flex flex-col gap-4 bg-base-100 drop-shadow-2xl p-4 rounded-2xl'>
                <p className='text-center'>Delete this expense?</p>
                <div className='flex justify-between gap-2 items-center'>
                    <button className='btn btn-sm btn-ghost' onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                    <button className='btn btn-sm text-error-content btn-error' onClick={
                        async () => {
                            toast.dismiss(t.id)
                            await handleDeleteExpense(expenseId);
                        }
                    }>
                        Delete
                    </button>
                </div>
            </div>
        ), {
            duration: 6000
        },
            {
                style: {
                    padding: '0px',
                },
            }
        );
    }

    // Delete expense
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
        )

    };

    return (
        <div>
            {/* Expense Logging */}
            <div className='card bg-base-200'>
                <div className='card-body'>
                    <div className='flex flex-col gap-4 mb-3'>
                        <div className='space-y-4'>
                            <h3 className='card-title'>Expenses by Category</h3>
                            <div className='grid grid-cols-2 gap-2'>
                                {Object.entries(expensesByCategory).map(([category, amount]) => (
                                    <div key={category} className='flex justify-between p-2 bg-base-100 rounded-lg'>
                                        <span className='capitalize'>{category}</span>
                                        <span className='font-medium'>৳{amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <h2 className='card-title'>Expense Log</h2>
                            <button
                                onClick={() => openExpenseModal()} disabled={monthFinalized}
                                className='rounded-full font-semibold text-primary-content flex gap-2 bg-primary cursor-pointer items-center px-2 py-2 disabled:cursor-not-allowed disabled:bg-primary/10 disabled:text-primary-content/50'
                            >
                                <div className='flex items-center gap-1'>
                                    <IoIosAddCircle className='text-2xl' />
                                    <p>Expense</p>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='table table-xs'>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expensesData?.map((expense) => (
                                    <tr key={expense._id}>
                                        <td>{format(new Date(expense.date), 'dd MMM')}</td>
                                        <td className='capitalize'>{expense.category}</td>
                                        <td className='font-medium'>৳{expense.amount}</td>
                                        <td className='text-xs'>{expense.description || '-'}</td>
                                        <td>
                                            <div className='flex gap-1'>
                                                <button
                                                    onClick={() => openExpenseModal(expense)}
                                                    className='btn btn-xs btn-ghost'
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => showDeletePopup(expense._id)}
                                                    className='btn btn-xs btn-ghost text-error'
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className="modal modal-open">
                    <div className="modal-box w-[94vw] mx-auto">
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
                                <label className='label'>Amount (৳)</label>
                                <input
                                    type="number"
                                    value={expenseData.amount}
                                    onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
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
                    </div>
                    <div className="modal-backdrop" onClick={() => setShowExpenseModal(false)}></div>
                </div>
            )}
        </div>
    )
}

export default MonthlyExpense
