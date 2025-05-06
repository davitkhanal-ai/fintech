import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api';
import { DashboardData, MonthlySummary } from '../types';
import { BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Reports: React.FC = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardAPI.getDashboardData(token);
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get month name
  const getMonthName = (month: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        Error: {error}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No report data available.</p>
      </div>
    );
  }

  // Group monthly data for display
  const groupedMonthlyData: { [key: string]: { income: number; expense: number } } = {};
  
  dashboardData.monthly_summary.forEach((summary) => {
    const key = `${summary.year}-${summary.month}`;
    
    if (!groupedMonthlyData[key]) {
      groupedMonthlyData[key] = { income: 0, expense: 0 };
    }
    
    if (summary.type === 'income') {
      groupedMonthlyData[key].income = summary.total;
    } else if (summary.type === 'expense') {
      groupedMonthlyData[key].expense = summary.total;
    }
  });
  
  // Sort by date
  const sortedMonthlyData = Object.keys(groupedMonthlyData)
    .sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      
      if (yearA !== yearB) {
        return yearB - yearA; // Most recent year first
      }
      return monthB - monthA; // Most recent month first
    })
    .map(key => {
      const [year, month] = key.split('-').map(Number);
      return {
        key,
        year,
        month,
        monthName: getMonthName(month),
        ...groupedMonthlyData[key]
      };
    });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Financial Reports</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-teal-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Monthly Summary</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Income
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedMonthlyData.map((item) => (
                  <tr key={item.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.monthName} {item.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(item.income)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {formatCurrency(item.expense)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={item.income - item.expense >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(item.income - item.expense)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-teal-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Accounts Breakdown</h2>
          </div>
          
          <div className="space-y-4">
            {dashboardData.accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-md font-medium text-gray-800">{account.name}</h3>
                  <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                    <div
                      className={`h-2 rounded-full ${account.balance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{
                        width: `${Math.min(
                          Math.abs(account.balance) / (dashboardData.total_balance > 0 ? dashboardData.total_balance : 1) * 100,
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4">
                  <span className={`text-lg font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-teal-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Income vs. Expenses</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center mb-2">
              <ArrowUpRight className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-md font-medium text-gray-800">Total Income</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(
                dashboardData.monthly_summary
                  .filter(s => s.type === 'income')
                  .reduce((sum, item) => sum + item.total, 0)
              )}
            </p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="flex items-center mb-2">
              <ArrowDownRight className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-md font-medium text-gray-800">Total Expenses</h3>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(
                dashboardData.monthly_summary
                  .filter(s => s.type === 'expense')
                  .reduce((sum, item) => sum + item.total, 0)
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;