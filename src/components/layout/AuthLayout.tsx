import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wallet } from 'lucide-react';

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex flex-col justify-center p-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center">
          <Wallet className="h-12 w-12 text-white" />
          <h1 className="text-4xl font-bold text-white ml-2">FinTrack</h1>
        </div>
        <p className="text-white mt-2 text-lg">Manage your finances with ease</p>
      </div>
      
      <div className="flex justify-center">
        <Outlet />
      </div>

      <div className="mt-8 text-center text-white text-sm">
        <p>© {new Date().getFullYear()} FinTrack. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout;