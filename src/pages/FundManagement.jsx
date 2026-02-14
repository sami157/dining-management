import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { IoIosAddCircle } from "react-icons/io";
import MemberInfoTable from '../components/ManagerDashboard/MemberInfoTable';
import MonthlySummary from '../components/ManagerDashboard/MonthlySummary';

const FundManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [currentMonth] = useState(format(new Date(), 'yyyy-MM'));

  const [monthFinalized, setMonthFinalized] = useState(false);

  // Expense modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseData, setExpenseData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    amount: '',
    description: ''
  });
  const [editingExpense, setEditingExpense] = useState(null);

  // Fetch all users
  const { data: usersData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await axiosSecure.get('/users');
      return response.data.users;
    },
  });

  // Fetch all balances
  const { data: balancesData } = useQuery({
    queryKey: ['allBalances'],
    queryFn: async () => {
      const response = await axiosSecure.get('/finance/balances');
      return response.data.balances;
    },
  });

  // Fetch Finalization Data for Current Month
  const { data: finalizationData } = useQuery({
    queryKey: ['finalization'],
    queryFn: async () => {
      const response = await axiosSecure.get(`/finance/finalization/${currentMonth}`);
      return response.data.finalization;
    },
  });

  finalizationData && finalizationData.isFinalized !== undefined && setMonthFinalized(finalizationData.isFinalized);

  // Fetch deposits for current month
  const { data: depositsData, refetch: refetchDeposits } = useQuery({
    queryKey: ['deposits', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/finance/deposits?month=${currentMonth}`);
      return response.data.deposits;
    },
  });

  // Update expense query to remove userId filter
  const { data: expensesData, refetch: refetchExpenses } = useQuery({
    queryKey: ['expenses', currentMonth],
    queryFn: async () => {
      const [year, month] = currentMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;

      const response = await axiosSecure.get(`/finance/expenses?startDate=${startDate}&endDate=${endDate}`);
      return response.data.expenses;
    },
  });


  // Delete deposit
  const handleDeleteDeposit = async (depositId) => {
    if (!confirm('Are you sure you want to delete this deposit?')) return;

    try {
      await axiosSecure.delete(`/finance/deposits/${depositId}`);
      toast.success('Deposit deleted successfully');
      refetchDeposits();
      queryClient.invalidateQueries(['allBalances']);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete deposit');
    }
  };

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

    try {
      if (editingExpense) {
        // Update existing expense
        await axiosSecure.put(`/finance/expenses/${editingExpense._id}`, expenseData);
        toast.success('Expense updated successfully');
      } else {
        // Add new expense
        await axiosSecure.post('/finance/expenses/add', {
          ...expenseData,
          amount: parseFloat(expenseData.amount)
        });
        toast.success('Expense added successfully');
      }

      setShowExpenseModal(false);
      refetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save expense');
    }
  };

  // Delete expense
  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await axiosSecure.delete(`/finance/expenses/${expenseId}`);
      toast.success('Expense deleted successfully');
      refetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete expense');
    }
  };

  // Calculate expense summary
  const totalExpenses = expensesData?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const expensesByCategory = expensesData?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {}) || {};

  const finalizeMonth = async () => {
    toast.promise(
      async () => {
        await axiosSecure.post('/finance/finalize', { month: currentMonth });
        await refetchExpenses();
        await refetchDeposits();
      },
      {
        loading: 'Finalizing month...',
        success: 'Month finalized successfully',
        error: 'Failed to finalize month'
      }
    );
  }

  return (
    <div className='p-4 w-11/12 mx-auto'>
      <h1 className='text-2xl text-center font-bold mb-6'>Fund Management - {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}</h1>
      {/* Monthly Summary */}
      <div className='flex flex-col gap-4'>
        <MonthlySummary totalExpenses={totalExpenses} monthFinalized={monthFinalized} finalizeMonth={finalizeMonth} />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <MemberInfoTable usersData={usersData} balancesData={balancesData} depositsData={depositsData} monthFinalized={monthFinalized} refetchDeposits={refetchDeposits} handleDeleteDeposit={handleDeleteDeposit} />


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
                        <span className='font-medium'>৳{amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='flex justify-between'>
                  <h2 className='card-title'>Expense Log</h2>
                  <button
                    onClick={() => openExpenseModal()}
                    className='px-3 py-2 rounded-xl bg-primary cursor-pointer'
                  >
                    <div className='flex text-primary-content font-semibold items-center'>
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
                        <td className='font-medium'>৳{expense.amount.toFixed(2)}</td>
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
                              onClick={() => handleDeleteExpense(expense._id)}
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
        </div>
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal modal-open">
          <div className="modal-box">
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
  );
};

export default FundManagement;