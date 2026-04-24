import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import MemberInfoTable from '../components/ManagerDashboard/MemberInfoTable';
import MonthlySummary from '../components/ManagerDashboard/MonthlySummary';
import MonthlyExpense from '../components/ManagerDashboard/MonthlyExpense';

const FundManagement = () => {

  const axiosSecure = useAxiosSecure();
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Extract year and month from currentMonth
  const [selectedYear, setSelectedYear] = useState(currentMonth.split('-')[0]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.split('-')[1]);

  // Generate year options (e.g., current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Month options
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Update currentMonth when year or month changes
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentMonth(`${year}-${selectedMonth}`);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setCurrentMonth(`${selectedYear}-${month}`);
  };


  // Fetch all users
  const { data: usersData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await axiosSecure.get('/users');
      return response.data.users;
    },
  });

  const amount = usersData?.reduce(
    (sum, user) => sum + (Number(user.fixedDeposit) || 0),
    0
  ) || 0;


  // Fetch all balances
  const { data: balancesData, refetch: refetchBalances } = useQuery({
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
  const { data: mealRateData } = useQuery({
    queryKey: ['runningMealRate', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/stats/meal-rate?month=${currentMonth}&date=${format(new Date(), 'yyyy-MM-dd')}`);
      return response.data;
    },
    enabled: !monthFinalized, // no need to fetch if already finalized
  });

  const runningMealRate = currentMonth === format(new Date(), 'yyyy-MM') ?
  finalizationData?.isFinalized ?
  finalizationData?.mealRate?.toFixed(2) || '0.00' :
  mealRateData?.mealRate?.toFixed(2) || '0.00' : '0.00';

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
    <div className='p-4 w-99/100 mx-auto'>
      {/* Month Picker */}
      <div className='flex justify-center gap-4 mb-6'>
        <div>
          <label className='label'>
            <span className='label-text'>Year</span>
          </label>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className='select select-bordered'
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className='label'>
            <span className='label-text'>Month</span>
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className='select select-bordered'
          >
            {monthOptions.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      </div>
      <h1 className='text-2xl text-center font-bold mb-6'>Fund Management - {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}</h1>
      {/* Monthly Summary */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='flex flex-col gap-4'>
          <MonthlySummary totalExpenses={totalExpenses} depositsData={depositsData} monthFinalized={monthFinalized} finalizeMonth={finalizeMonth} totalFixedDeposit={amount} mealRate={runningMealRate} />
          <MonthlyExpense expensesData={expensesData} expensesByCategory={expensesByCategory} monthFinalized={monthFinalized} refetchExpenses={refetchExpenses} />
        </div>
        <div className='grid grid-cols-1 gap-8'>
          <MemberInfoTable usersData={usersData} balancesData={balancesData} depositsData={depositsData} monthFinalized={monthFinalized} refetchDeposits={refetchDeposits} refetchBalances={refetchBalances} currentMonth={currentMonth} />
        </div>
      </div>
    </div>
  );
};

export default FundManagement;