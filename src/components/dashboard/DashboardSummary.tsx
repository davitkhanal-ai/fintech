import React from 'react';
import { DashboardData } from '../../types';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface DashboardSummaryProps {
  data: DashboardData;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ data }) => {
  // Calculate this month's income and expenses
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
  const currentYear = currentDate.getFullYear();
  
  const thisMonthSummary = data.monthly_summary.filter(
    summary => summary.month === currentMonth && summary.year === currentYear
  );
  
  const totalIncome = thisMonthSummary.find(s => s.type === 'income')?.total || 0;
  const totalExpenses = thisMonthSummary.find(s => s.type === 'expense')?.total || 0;
  
  // Get previous month's data for comparison
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  
  const prevMonthSummary = data.monthly_summary.filter(
    summary => summary.month === prevMonth && summary.year === prevYear
  );
  
  const prevTotalIncome = prevMonthSummary.find(s => s.type === 'income')?.total || 0;
  const prevTotalExpenses = prevMonthSummary.find(s => s.type === 'expense')?.total || 0;
  
  // Calculate percentage changes
  const incomeChange = prevTotalIncome ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100 : 0;
  const expenseChange = prevTotalExpenses ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100 : 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Balance</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(data.total_balance)}</p>
          </div>
          <div className="bg-teal-100 p-3 rounded-full">
            <RefreshCw className="h-6 w-6 text-teal-600" />
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-2">Across {data.accounts.length} accounts</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Monthly Income</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <ArrowUpRight className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="flex items-center mt-2">
          <span className={`text-sm font-medium ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {incomeChange.toFixed(1)}%
          </span>
          <span className="text-gray-500 text-sm ml-1">from last month</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Monthly Expenses</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <ArrowDownRight className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div className="flex items-center mt-2">
          <span className={`text-sm font-medium ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {expenseChange.toFixed(1)}%
          </span>
          <span className="text-gray-500 text-sm ml-1">from last month</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;