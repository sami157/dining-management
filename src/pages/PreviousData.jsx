import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { MonthlySummaryHistory } from '../components/ManagerDashboard/MonthlySummaryHistory';

const currency = (value) => `Tk ${Number(value || 0).toLocaleString(undefined, {
  maximumFractionDigits: 0
})}`;

const capitalizeFirstLetter = (value) => {
  if (typeof value !== 'string' || !value) return value;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

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
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

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

  const memberDetails = finalizationData?.memberDetails || [];
  const normalizedMemberSearch = memberSearchTerm.trim().toLowerCase();
  const filteredMemberDetails = memberDetails.filter((member) => {
    if (!normalizedMemberSearch) return true;

    const currentUser = (usersData || []).find(
      user => user._id?.toString() === member.userId?.toString()
    );
    const room = currentUser?.room?.toString().toLowerCase() || '';
    const building = currentUser?.building?.toLowerCase() || '';
    const buildingRoom = `${building.slice(0, 1)}-${room}`;

    return (
      member.userName?.toLowerCase().includes(normalizedMemberSearch)
      || room.includes(normalizedMemberSearch)
      || building.includes(normalizedMemberSearch)
      || buildingRoom.includes(normalizedMemberSearch)
    );
  });

  return (
    <div className='p-4 md:p-6'>
      <div className='max-w-7xl mx-auto flex flex-col gap-5'>
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
                className='select'
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
                className='select'
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
          <>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 items-start'>
              <div className='flex flex-col gap-5 min-w-0'>
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
              </div>

              <Section title='Expense Log' description='Individual expense records for audit review.'>
                <div className='divide-y divide-base-300'>
                  {expensesData?.length ? expensesData.map((expense) => (
                    <div key={expense._id} className='max-w-[96vw] flex gap-3 py-1 justify-between'>
                      <div className='space-x-2'>
                        <div className='min-w-0'>
                          <span className='text-xs text-base-content/50 w-12'>
                            {format(new Date(expense.date), 'dd MMM')}
                            <span className='text-sm ml-2 font-black text-error'>
                              {capitalizeFirstLetter(expense.category)}
                            </span>
                          </span>
                          {/* <p className='text-sm capitalize wrap-break-word'>{expense.category}</p> */}
                          {
                            expense.description
                            && <p className='text-xs text-base-content/60 wrap-break-word'>
                              {expense.description}
                            </p>
                          }
                        </div>
                      </div>
                      <span className='text-sm font-semibold text-error text-right whitespace-nowrap'>{currency(expense.amount)}</span>
                    </div>
                  )) : (
                    <p className='py-6 text-center text-sm text-base-content/50'>No expenses recorded.</p>
                  )}
                </div>
              </Section>
            </div>

            {finalizationData?.memberDetails?.length > 0 && (
              <Section
                title='Member Details'
                description='Finalized member meal cost, fees, deposits, and balances.'>
                <div className='mb-4 flex flex-col md:flex-row gap-3 items-center md:justify-between'>
                  <input
                    type='text'
                    placeholder='Search by Name/Room..'
                    className='input w-full sm:max-w-sm bg-base-200/70 border-base-200 focus:input-primary tracking-tight h-10 text-sm'
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                  />
                  <span className='text-sm font-semibold opacity-40 uppercase tracking-widest'>
                    <span className='font-black text-lg'>{filteredMemberDetails.length}</span> Members
                  </span>
                </div>
                <div className='hidden md:block max-h-[70vh] overflow-y-auto'>
                  <table className='table table-sm w-full table-fixed'>
                    <colgroup>
                      <col className='w-[22%]' />
                      <col className='w-[8%]' />
                      <col className='w-[14%]' />
                      <col className='w-[14%]' />
                      <col className='w-[14%]' />
                      <col className='w-[14%]' />
                      <col className='w-[14%]' />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className='sticky top-0 z-10 bg-base-100/20 backdrop-blur-md'>Name</th>
                        <th className='sticky top-0 z-10 bg-base-100/20 backdrop-blur-md text-center'>Meals</th>
                        <th className='sticky top-0 z-10 bg-base-100/20 backdrop-blur-md text-right'>Deposits</th>
                        <th className='sticky top-0 z-10 bg-base-100/20 backdrop-blur-md text-right'>Meal Cost</th>
                        <th className='sticky top-0 z-10 bg-base-100/20 backdrop-blur-md text-right'>Mosque Fee</th>
                        <th className='sticky top-0 z-10 bg-base-100/20 backdrop-blur-md text-right'>Prev. Balance</th>
                        <th className='sticky top-0 z-10 bg-base-100/20 backdrop-blur-md text-right'>New Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMemberDetails.length ? filteredMemberDetails.map((member) => (
                          <tr key={member.userId}>
                            <td className='font-semibold wrap-break-word whitespace-normal'>{member.userName}</td>
                            <td className='text-center wrap-break-word'>{member.totalMeals}</td>
                            <td className='text-right text-success wrap-break-word'>{currency(member.totalDeposits)}</td>
                            <td className='text-right text-error wrap-break-word'>{currency(member.mealCost)}</td>
                            <td className='text-right text-error wrap-break-word'>{currency(member.mosqueFee)}</td>
                            <td className={`text-right wrap-break-word ${member.previousBalance >= 0 ? 'text-success' : 'text-error'}`}>
                              {currency(member.previousBalance)}
                            </td>
                            <td className={`text-right font-bold wrap-break-word ${member.newBalance >= 0 ? 'text-success' : 'text-error'}`}>
                              {currency(member.newBalance)}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={7} className='py-8 text-center text-sm text-base-content/50'>No members found.</td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden'>
                  {filteredMemberDetails.length ? filteredMemberDetails.map((member) => (
                      <article key={member.userId} className='rounded-xl bg-base-200 p-3'>
                        <div className='flex items-start justify-between mb-2 gap-3'>
                          <p className='text-lg font-bold wrap-break-word min-w-0'>{member.userName}</p>
                        </div>
                        <dl className='grid grid-cols-3 gap-x-6 gap-y-2 text-sm'>
                          <div>
                            <dt className='text-base-content/50'>Meals</dt>
                            <dd className='font-medium'>{member.totalMeals}</dd>
                          </div>
                          <div>
                            <dt className='text-base-content/50'>Deposits</dt>
                            <dd className='font-medium text-success'>{currency(member.totalDeposits)}</dd>
                          </div>
                          <div>
                            <dt className='text-base-content/50'>Meal Cost</dt>
                            <dd className='font-medium text-error'>{currency(member.mealCost)}</dd>
                          </div>
                          <div>
                            <dt className='text-base-content/50'>Mosque Fee</dt>
                            <dd className='font-medium text-error'>{currency(member.mosqueFee)}</dd>
                          </div>
                          <div>
                            <dt className='text-base-content/50'>Prev. Balance</dt>
                            <dd className={`font-medium ${member.previousBalance >= 0 ? 'text-success' : 'text-error'}`}>
                              {currency(member.previousBalance)}
                            </dd>
                          </div>
                          <div>
                            <dt className='text-base-content/50'>New Balance</dt>
                            <dd className={`font-bold ${member.newBalance >= 0 ? 'text-success' : 'text-error'}`}>
                              {currency(member.newBalance)}
                            </dd>
                          </div>
                        </dl>
                      </article>
                    )) : (
                      <p className='col-span-full py-8 text-center text-sm text-base-content/50'>No members found.</p>
                    )}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PreviousData;
