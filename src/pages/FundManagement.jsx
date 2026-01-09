import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const FundManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [currentMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Deposit modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNotes, setDepositNotes] = useState('');
  const [editingDeposit, setEditingDeposit] = useState(null);

  // Expense modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseData, setExpenseData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'shopping',
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

  // Get user balance
  const getUserBalance = (userId) => {
    const balance = balancesData?.find(b => b.userId === userId);
    return balance?.balance || 0;
  };

  // Open deposit modal
  const openDepositModal = (user, existingDeposit = null) => {
    setSelectedUser(user);
    if (existingDeposit) {
      setEditingDeposit(existingDeposit);
      setDepositAmount(existingDeposit.amount);
      setDepositNotes(existingDeposit.notes);
    } else {
      setEditingDeposit(null);
      setDepositAmount('');
      setDepositNotes('');
    }
    setShowDepositModal(true);
  };

  // Handle deposit submission
  const handleDepositSubmit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (editingDeposit) {
        // Update existing deposit
        await axiosSecure.put(`/finance/deposits/${editingDeposit._id}`, {
          amount: parseFloat(depositAmount),
          notes: depositNotes
        });
        toast.success('Deposit updated successfully');
      } else {
        // Add new deposit
        await axiosSecure.post('/finance/deposits/add', {
          userId: selectedUser._id.toString(),
          amount: parseFloat(depositAmount),
          month: currentMonth,
          notes: depositNotes
        });
        toast.success('Deposit added successfully');
      }

      setShowDepositModal(false);
      refetchDeposits();
      queryClient.invalidateQueries(['allBalances']);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save deposit');
    }
  };

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
        category: 'shopping',
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

  return (
    <div className='p-4 max-w-4/5 mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Fund Management - {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}</h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left: User List with Deposits */}
        <div>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>Members & Balances</h2>
          </div>

          <div className='overflow-x-auto'>
            <table className='table table-sm'>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Balance</th>
                  <th>Deposits (This Month)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.map((user) => {
                  const userDeposits = depositsData?.filter(d => d.userId === user._id.toString()) || [];
                  const monthlyDeposits = userDeposits.reduce((sum, d) => sum + d.amount, 0);

                  return (
                    <tr key={user._id}>
                      <td>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{user.name}</span>
                          <span className='text-xs text-gray-500'>{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`font-bold ${getUserBalance(user._id) < 0 ? 'text-error' : 'text-success'}`}>
                          ৳{getUserBalance(user._id).toFixed(2)}
                        </span>
                      </td>
                      <td>৳{monthlyDeposits.toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => openDepositModal(user)}
                          className='btn btn-xs btn-primary'
                        >
                          Add Deposit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recent Deposits */}
          <div className='mt-6'>
            <h3 className='text-lg font-semibold mb-3'>Recent Deposits</h3>
            <div className='overflow-x-auto'>
              <table className='table table-xs'>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Member</th>
                    <th>Amount</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {depositsData?.slice(0, 10).map((deposit) => (
                    <tr key={deposit._id}>
                      <td>{format(new Date(deposit.depositDate), 'dd MMM')}</td>
                      <td>{deposit.userName}</td>
                      <td className='font-medium'>৳{deposit.amount.toFixed(2)}</td>
                      <td className='text-xs'>{deposit.notes || '-'}</td>
                      <td>
                        <div className='flex gap-1'>
                          <button
                            onClick={() => {
                              const user = usersData?.find(u => u._id.toString() === deposit.userId);
                              if (user) openDepositModal(user, deposit);
                            }}
                            className='btn btn-xs btn-ghost'
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteDeposit(deposit._id)}
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

        {/* Right: Expenses */}
        <div className='flex flex-col gap-4'>
          {/* Expense Summary */}
          <div className='card bg-base-200'>
            <div className='card-body'>
              <h2 className='card-title'>Monthly Summary</h2>
              <div className='stats rounded-lg bg-base-100 stats-vertical shadow'>
                <div className='stat'>
                  <div className='stat-title'>Total Deposits</div>
                  <div className='text-2xl text-success'>
                    ৳{(depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0).toFixed(2)}
                  </div>
                </div>

                <div className='stat'>
                  <div className='stat-title'>Total Expenses</div>
                  <div className='text-2xl text-error'>
                    ৳{totalExpenses.toFixed(2)}
                  </div>
                </div>

                <div className='stat'>
                  <div className='stat-title'>Net Balance</div>
                  <div className={`text-2xl font-bold ${(depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0) - totalExpenses >= 0
                      ? 'text-success'
                      : 'text-error'
                    }`}>
                    ৳{((depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0) - totalExpenses).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className='mt-4'>
                <h3 className='font-semibold mb-2'>Expenses by Category:</h3>
                <div className='grid grid-cols-2 gap-2'>
                  {Object.entries(expensesByCategory).map(([category, amount]) => (
                    <div key={category} className='flex justify-between p-2 bg-base-100 rounded'>
                      <span className='capitalize'>{category}</span>
                      <span className='font-medium'>৳{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Expense Logging */}
          <div className='card bg-base-200'>
            <div className='card-body'>
              <div className='flex justify-between items-center mb-3'>
                <h2 className='card-title'>Expense Log</h2>
                <button
                  onClick={() => openExpenseModal()}
                  className='btn btn-sm btn-primary'
                >
                  Add Expense
                </button>
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

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingDeposit ? 'Edit Deposit' : 'Add Deposit'} - {selectedUser?.name}
            </h3>

            <div className='flex flex-col gap-3'>
              <div>
                <label className='label'>Amount (৳)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className='input input-bordered w-full'
                  placeholder='Enter amount'
                />
              </div>

              <div>
                <label className='label'>Notes (Optional)</label>
                <textarea
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className='textarea textarea-bordered w-full'
                  placeholder='Add notes'
                />
              </div>
            </div>

            <div className="modal-action">
              <button onClick={handleDepositSubmit} className='btn btn-primary'>
                {editingDeposit ? 'Update' : 'Add'} Deposit
              </button>
              <button onClick={() => setShowDepositModal(false)} className='btn'>
                Cancel
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDepositModal(false)}></div>
        </div>
      )}

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