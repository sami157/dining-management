import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addMonths, format, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useAxiosSecure from '../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import MemberInfoTable from '../components/ManagerDashboard/MemberInfoTable';
import MonthlySummary from '../components/ManagerDashboard/MonthlySummary';
import MonthlyExpense from '../components/ManagerDashboard/MonthlyExpense';

const FundManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const currentCalendarMonth = format(new Date(), 'yyyy-MM');
  const [isFinalizationSubmitting, setIsFinalizationSubmitting] = useState(false);

  const shiftMonth = (shift) => {
    setCurrentMonth((previousMonth) => {
      const previousDate = new Date(`${previousMonth}-01`);
      const nextDate = shift === 'previous'
        ? subMonths(previousDate, 1)
        : addMonths(previousDate, 1);

      return format(nextDate, 'yyyy-MM');
    });
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
  const isCurrentMonth = currentMonth === currentCalendarMonth;

  const { data: mealRateData, isLoading: mealRateLoading, isFetching: mealRateFetching } = useQuery({
    queryKey: ['runningMealRate', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/stats/meal-rate?month=${currentMonth}&date=${format(new Date(), 'yyyy-MM-dd')}`);
      return response.data;
    },
    enabled: isCurrentMonth && !finalizationLoading && !monthFinalized,
  });

  const runningMealRate = isCurrentMonth
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

  const refreshFinanceMonthData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['finalization', currentMonth] }),
      queryClient.invalidateQueries({ queryKey: ['runningMealRate', currentMonth] }),
      queryClient.invalidateQueries({ queryKey: ['deposits', currentMonth] }),
      queryClient.invalidateQueries({ queryKey: ['expenses', currentMonth] }),
      queryClient.invalidateQueries({ queryKey: ['allBalances'] }),
    ]);
  };

  const finalizeMonth = async () => {
    toast.promise(
      async () => {
        setIsFinalizationSubmitting(true);
        await axiosSecure.post('/finance/finalize', { month: currentMonth });
        await refreshFinanceMonthData();
      },
      {
        loading: 'Finalizing month...',
        success: 'Month finalized successfully',
        error: 'Failed to finalize month'
      }
    ).finally(() => setIsFinalizationSubmitting(false));
  };

  const undoFinalization = async () => {
    toast.promise(
      async () => {
        setIsFinalizationSubmitting(true);
        await axiosSecure.delete(`/finance/finalization/${currentMonth}`);
        await refreshFinanceMonthData();
      },
      {
        loading: 'Undoing finalization...',
        success: 'Month finalization undone successfully',
        error: 'Failed to undo finalization',
      }
    ).finally(() => setIsFinalizationSubmitting(false));
  };

  const mealRateCardLoading = isCurrentMonth && !monthFinalized && (finalizationLoading || mealRateLoading);
  const mealRateCardRefreshing = mealRateFetching && !mealRateCardLoading;
  const summaryLoading = depositsLoading || expensesLoading || usersLoading || finalizationLoading;
  const summaryRefreshing = depositsFetching || expensesFetching || usersFetching || finalizationFetching;
  const memberTableLoading = usersLoading || balancesLoading || depositsLoading || finalizationLoading;
  const memberTableRefreshing = usersFetching || balancesFetching || depositsFetching || finalizationFetching;
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

          <div className='flex items-center justify-between border border-base-300/70 p-2 rounded-lg max-w-md mx-auto w-full lg:w-72'>
            <button
              onClick={() => shiftMonth('previous')}
              className='p-1.5 cursor-pointer hover:bg-base-200 rounded-full transition-all active:scale-95'
              aria-label='Previous month'
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className='text-sm md:text-base font-bold uppercase px-6'>
              {format(new Date(`${currentMonth}-01`), 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => shiftMonth('next')}
              className='p-1.5 cursor-pointer hover:bg-base-200 rounded-full transition-all active:scale-95'
              aria-label='Next month'
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* {(summaryRefreshing || memberTableRefreshing || expenseRefreshing) && !summaryLoading && !memberTableLoading && !expenseLoading && (
          <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-base-content/50'>
            <span className='loading loading-spinner loading-xs text-primary'></span>
            Updating
          </div>
        )} */}

        <div className='grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-5 items-start'>
          <div className='flex flex-col gap-5'>
            <MonthlySummary totalExpenses={totalExpenses} depositsData={depositsData} monthFinalized={monthFinalized} finalizeMonth={finalizeMonth} undoFinalization={undoFinalization} canManageFinalization={isCurrentMonth} finalizationActionLoading={isFinalizationSubmitting} totalFixedDeposit={amount} mealRate={runningMealRate} isLoading={summaryLoading} isRefreshing={summaryRefreshing} mealRateLoading={mealRateCardLoading} mealRateRefreshing={mealRateCardRefreshing} finalizationData={finalizationData} finalizedByName={finalizedByName} mosqueFeeSum={mosqueFeeSum} />
            <MonthlyExpense expensesData={expensesData} expensesByCategory={expensesByCategory} monthFinalized={monthFinalized} refetchExpenses={refetchExpenses} isLoading={expenseLoading} isRefreshing={expenseRefreshing} />
          </div>
          <MemberInfoTable usersData={usersData} balancesData={balancesData} depositsData={depositsData} finalizationData={finalizationData} monthFinalized={monthFinalized} refetchDeposits={refetchDeposits} refetchBalances={refetchBalances} currentMonth={currentMonth} isLoading={memberTableLoading} isRefreshing={memberTableRefreshing} depositsLoading={depositsLoading} />
        </div>
      </div>
    </div>
  );
};

export default FundManagement;
