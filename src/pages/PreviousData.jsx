import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { MonthlySummaryHistory } from '../components/ManagerDashboard/MonthlySummaryHistory';

const currency = (value) => `Tk ${Number(value || 0).toLocaleString(undefined, {
  maximumFractionDigits: 0
})}`;

const Section = ({ title, description, children }) => (
  <section className='rounded-lg border border-base-300 px-4 py-3'>
    <div className='pb-3'>
      <h2 className='text-sm font-bold tracking-tight'>{title}</h2>
      {description && (
        <p className='text-xs text-base-content/50 mt-0.5'>{description}</p>
      )}
    </div>
    {children}
  </section>
);

const PreviousData = () => {
  const axiosSecure = useAxiosSecure();
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

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

  const { data: finalizationData } = useQuery({
    queryKey: ['finalization', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/finance/finalization/${currentMonth}`);
      return response.data.finalization;
    },
  });

  const monthFinalized = finalizationData?.isFinalized || false;

  const { data: depositsData } = useQuery({
    queryKey: ['deposits', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/finance/deposits?month=${currentMonth}`);
      return response.data.deposits;
    },
  });

  const { data: expensesData } = useQuery({
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

  const { data: usersData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await axiosSecure.get('/users');
      return response.data.users;
    },
  });

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

  return (
    <div className='p-4 md:p-6'>
      <div className='max-w-6xl mx-auto flex flex-col gap-5'>
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Previous Data</h1>
            <p className='text-sm text-base-content/50'>Review finalized monthly finance history and member balances.</p>
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

        {!monthFinalized ? (
          <div className='rounded-lg border border-dashed border-base-300 px-4 py-10 text-center'>
            <p className='text-sm font-semibold'>No finalized data found for {format(new Date(`${currentMonth}-01`), 'MMMM yyyy')}</p>
            <p className='text-xs text-base-content/50 mt-1'>Previous data is available after management finalizes a month.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-5 items-start'>
            <div className='flex flex-col gap-5'>
              <MonthlySummaryHistory
                totalExpenses={totalExpenses}
                depositsData={depositsData}
                finalizationData={finalizationData}
                finalizedByName={finalizedByName}
              />

              <Section title='Expenses by Category' description='Category totals for this finalized month.'>
                <div className='divide-y divide-base-300'>
                  {Object.entries(expensesByCategory).length ? Object.entries(expensesByCategory).map(([category, amount]) => (
                    <div key={category} className='flex items-center justify-between gap-4 py-3'>
                      <span className='text-sm capitalize text-base-content/60'>{category}</span>
                      <span className='text-sm font-semibold text-error'>{currency(amount)}</span>
                    </div>
                  )) : (
                    <p className='py-3 text-sm text-base-content/50'>No expenses recorded.</p>
                  )}
                </div>
              </Section>

              <Section title='Expense Log' description='Individual expense records for audit review.'>
                <div className='overflow-x-auto'>
                  <table className='table table-sm'>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th className='text-right'>Amount</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesData?.length ? expensesData.map((expense) => (
                        <tr key={expense._id}>
                          <td>{format(new Date(expense.date), 'dd MMM')}</td>
                          <td className='capitalize'>{expense.category}</td>
                          <td className='text-right font-medium text-error'>{currency(expense.amount)}</td>
                          <td className='text-xs text-base-content/70'>{expense.description || '-'}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className='text-center text-base-content/50 py-6'>No expenses recorded</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Section>
            </div>

            {finalizationData?.memberDetails?.length > 0 && (
              <Section title='Member Details' description='Finalized member meal cost, fees, deposits, and balances.'>
                <div className='overflow-x-auto'>
                  <table className='table table-sm'>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th className='text-center'>Meals</th>
                        <th className='text-right'>Deposits</th>
                        <th className='text-right'>Meal Cost</th>
                        <th className='text-right'>Mosque Fee</th>
                        <th className='text-right'>Prev. Balance</th>
                        <th className='text-right'>New Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finalizationData.memberDetails.map((member) => (
                        <tr key={member.userId}>
                          <td className='font-semibold whitespace-nowrap'>{member.userName}</td>
                          <td className='text-center'>{member.totalMeals}</td>
                          <td className='text-right text-success'>{currency(member.totalDeposits)}</td>
                          <td className='text-right text-error'>{currency(member.mealCost)}</td>
                          <td className='text-right text-error'>{currency(member.mosqueFee)}</td>
                          <td className={`text-right ${member.previousBalance >= 0 ? 'text-success' : 'text-error'}`}>
                            {currency(member.previousBalance)}
                          </td>
                          <td className={`text-right font-bold ${member.newBalance >= 0 ? 'text-success' : 'text-error'}`}>
                            {currency(member.newBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousData;
