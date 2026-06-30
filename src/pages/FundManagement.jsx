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
  const currentCalendarMonth = format(new Date(), 'yyyy-MM');
  const [selectedYear, setSelectedYear] = useState(currentMonth.split('-')[0]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.split('-')[1]);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
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

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentMonth(`${year}-${selectedMonth}`);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setCurrentMonth(`${selectedYear}-${month}`);
  };

  const { data: usersData, isLoading: usersLoading, isFetching: usersFetching } = useQuery({
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

  const mosqueFeeSum = usersData?.reduce(
    (sum, user) => sum + (Number(user.mosqueFee) || 0),
    0
  ) || 0;

  const { data: balancesData, isLoading: balancesLoading, isFetching: balancesFetching, refetch: refetchBalances } = useQuery({
    queryKey: ['allBalances'],
    queryFn: async () => {
      const response = await axiosSecure.get('/finance/balances');
      return response.data.balances;
    },
  });

  const { data: finalizationData, isLoading: finalizationLoading, isFetching: finalizationFetching } = useQuery({
    queryKey: ['finalization', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/finance/finalization/${currentMonth}`);
      return response.data.finalization;
    },
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
  });

  const monthFinalized = finalizationData?.isFinalized || false;

  const { data: mealRateData, isLoading: mealRateLoading, isFetching: mealRateFetching } = useQuery({
    queryKey: ['runningMealRate', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/stats/meal-rate?month=${currentMonth}&date=${format(new Date(), 'yyyy-MM-dd')}`);
      return response.data;
    },
    enabled: currentMonth === currentCalendarMonth && !finalizationLoading && !monthFinalized,
  });

  const runningMealRate = currentMonth === currentCalendarMonth
    ? finalizationData?.isFinalized
      ? finalizationData?.mealRate?.toFixed(2) || '0.00'
      : mealRateData?.mealRate?.toFixed(2) || '0.00'
    : '0.00';

  const { data: depositsData, isLoading: depositsLoading, isFetching: depositsFetching, refetch: refetchDeposits } = useQuery({
    queryKey: ['deposits', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/finance/deposits?month=${currentMonth}`);
      return response.data.deposits;
    },
  });

  const { data: expensesData, isLoading: expensesLoading, isFetching: expensesFetching, refetch: refetchExpenses } = useQuery({
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

  const totalExpenses = expensesData?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const expensesByCategory = expensesData?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {}) || {};
  const finalizedById = finalizationData?.finalizedBy?._id
    || finalizationData?.finalizedBy?.id
    || finalizationData?.finalizedBy
    || finalizationData?.finalizedByUserId
    || finalizationData?.finalizedById;
  const finalizedByUser = (usersData || []).find((user) => user._id?.toString() === finalizedById?.toString());
  const finalizedByName = finalizationData?.finalizedBy?.name
    || finalizationData?.finalizedByName
    || finalizedByUser?.name
    || finalizedByUser?.email
    || finalizedById;

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
  };

  const mealRateCardLoading = currentMonth === currentCalendarMonth && !monthFinalized && (finalizationLoading || mealRateLoading);
  const mealRateCardRefreshing = mealRateFetching && !mealRateCardLoading;
  const summaryLoading = depositsLoading || expensesLoading || usersLoading || finalizationLoading;
  const summaryRefreshing = depositsFetching || expensesFetching || usersFetching || finalizationFetching;
  const memberTableLoading = usersLoading || balancesLoading || depositsLoading;
  const memberTableRefreshing = usersFetching || balancesFetching || depositsFetching;
  const expenseLoading = expensesLoading;
  const expenseRefreshing = expensesFetching;

  return (
    <div className='p-4 md:p-6'>
      <div className='max-w-7xl mx-auto flex flex-col gap-5'>
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Fund Management</h1>
            <p className='text-sm text-base-content/50'>
              Manage deposits, expenses, meal rate, and member balances for {format(new Date(`${currentMonth}-01`), 'MMMM yyyy')}.
            </p>
          </div>

          <div className='flex gap-3'>
            <div>
              <label className='label py-1'>
                <span className='label-text text-xs'>Year</span>
              </label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className='select select-bordered select-sm'
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='label py-1'>
                <span className='label-text text-xs'>Month</span>
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className='select select-bordered select-sm'
              >
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {(summaryRefreshing || memberTableRefreshing || expenseRefreshing) && !summaryLoading && !memberTableLoading && !expenseLoading && (
          <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-base-content/50'>
            <span className='loading loading-spinner loading-xs text-primary'></span>
            Updating
          </div>
        )}

        <div className='grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-5 items-start'>
          <div className='flex flex-col gap-5'>
            <MonthlySummary totalExpenses={totalExpenses} depositsData={depositsData} monthFinalized={monthFinalized} finalizeMonth={finalizeMonth} totalFixedDeposit={amount} mealRate={runningMealRate} isLoading={summaryLoading} isRefreshing={summaryRefreshing} mealRateLoading={mealRateCardLoading} mealRateRefreshing={mealRateCardRefreshing} finalizationData={finalizationData} finalizedByName={finalizedByName} mosqueFeeSum={mosqueFeeSum} />
            <MonthlyExpense expensesData={expensesData} expensesByCategory={expensesByCategory} monthFinalized={monthFinalized} refetchExpenses={refetchExpenses} isLoading={expenseLoading} isRefreshing={expenseRefreshing} />
          </div>
          <MemberInfoTable usersData={usersData} balancesData={balancesData} depositsData={depositsData} monthFinalized={monthFinalized} refetchDeposits={refetchDeposits} refetchBalances={refetchBalances} currentMonth={currentMonth} isLoading={memberTableLoading} isRefreshing={memberTableRefreshing} depositsLoading={depositsLoading} />
        </div>
      </div>
    </div>
  );
};

export default FundManagement;
