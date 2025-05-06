import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api';
import { DashboardData } from '../types';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import AccountsList from '../components/dashboard/AccountsList';
import RecentTransactions from '../components/dashboard/RecentTransactions';

const Dashboard: React.FC = () => {
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
        <p className="text-gray-500">No dashboard data available.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <DashboardSummary data={dashboardData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountsList accounts={dashboardData.accounts} showActions={false} />
        <RecentTransactions transactions={dashboardData.recent_transactions} />
      </div>
    </div>
  );
};

export default Dashboard;