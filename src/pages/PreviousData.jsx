import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import useAxiosSecure from '../hooks/useAxiosSecure';
import MonthlySummary from '../components/ManagerDashboard/MonthlySummary';

const PreviousData = () => {
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

  // Fetch Finalization Data for Current Month
  const { data: finalizationData } = useQuery({
    queryKey: ['finalization', currentMonth],
    queryFn: async () => {
      const response = await axiosSecure.get(`/finance/finalization/${currentMonth}`);
      return response.data.finalization;
    },
  });

  const monthFinalized = finalizationData?.isFinalized || false;

  // Fetch all expenses for current month
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

  // Calculate expense summary
  const totalExpenses = expensesData?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const expensesByCategory = expensesData?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {}) || {};

  return (
    <div className='p-4 w-11/12 mx-auto'>
      <h1 className='text-2xl text-center font-bold mb-6'>Previous Monthly Data</h1>
      
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

      {/* Monthly Summary and Expenses */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div>
          <MonthlySummary 
            totalExpenses={totalExpenses} 
            monthFinalized={monthFinalized} 
            finalizeMonth={null}
          />
        </div>

        {/* Expense Data - Read Only */}
        <div className='card bg-base-200'>
          <div className='card-body'>
            <div className='space-y-4 mb-4'>
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

            <h2 className='card-title mb-3'>Expense Log</h2>
            
            <div className='overflow-x-auto'>
              <table className='table table-xs'>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesData?.map((expense) => (
                    <tr key={expense._id}>
                      <td>{format(new Date(expense.date), 'dd MMM')}</td>
                      <td className='capitalize'>{expense.category}</td>
                      <td className='font-medium'>৳{expense.amount}</td>
                      <td className='text-xs'>{expense.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviousData