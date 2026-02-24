import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import MemberInfoTable from '../components/ManagerDashboard/MemberInfoTable';
import MonthlySummary from '../components/ManagerDashboard/MonthlySummary';
import MonthlyExpense from '../components/ManagerDashboard/MonthlyExpense';
import Loading from '../components/Loading';

const FundManagement = () => {

  const axiosSecure = useAxiosSecure();
  const [currentMonth] = useState(format(new Date(), 'yyyy-MM'));


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
  const { data: finalizationData} = useQuery({
    queryKey: ['finalization'],
    queryFn: async () => {
      const response = await axiosSecure.get(`/finance/finalization/${currentMonth}`);
      return response.data.finalization;
    },
  });

  const monthFinalized = finalizationData?.isFinalized || false;

  //Running Meal Rate
  const { data: mealRateData, loading: mealRateLoading } = useQuery({
    queryKey: ['runningMealRate', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/finance/meal-rate?month=${currentMonth}&date=${format(new Date(), 'yyyy-MM-dd')}`);
      return response.data;
    },
    enabled: !monthFinalized, // no need to fetch if already finalized
  });


  const runningMealRate = mealRateData?.mealRate?.toFixed(2) || '0.00';

  // Fetch deposits for current month
  const { data: depositsData, refetch: refetchDeposits } = useQuery({
    queryKey: ['deposits', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/finance/deposits?month=${currentMonth}`);
      return response.data.deposits;
    },
  });

  // Fetch all expenses for current month
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
        refetchExpenses();
        refetchDeposits();
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
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='flex flex-col gap-4'>
          {
            !monthFinalized ?
            !mealRateLoading ? 
              <p className='text-center text-lg p-2 rounded-xl'>{`Meal Rate: ৳${runningMealRate}`}</p>
              : <Loading/>
              : null
          }
          <MonthlySummary totalExpenses={totalExpenses} depositsData={depositsData} monthFinalized={monthFinalized} finalizeMonth={finalizeMonth} />
          <MonthlyExpense expensesData={expensesData} expensesByCategory={expensesByCategory} monthFinalized={monthFinalized} refetchExpenses={refetchExpenses} />
        </div>
        <div className='grid grid-cols-1 gap-8'>
          <MemberInfoTable usersData={usersData} balancesData={balancesData} depositsData={depositsData} monthFinalized={monthFinalized} refetchDeposits={refetchDeposits} currentMonth={currentMonth} />
        </div>
      </div>
    </div>
  );
};

export default FundManagement;