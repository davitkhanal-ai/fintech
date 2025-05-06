import React from 'react';
import { Transaction } from '../../types';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpRight className="h-5 w-5 text-green-500" />;
      case 'expense':
        return <ArrowDownRight className="h-5 w-5 text-red-500" />;
      case 'transfer':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
        <Link 
          to="/transactions" 
          className="text-sm text-teal-600 hover:text-teal-700 transition duration-200"
        >
          View All
        </Link>
      </div>
      
      {transactions.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No recent transactions.</p>
          <Link 
            to="/transactions/new" 
            className="inline-flex items-center mt-2 text-teal-600 hover:text-teal-700"
          >
            Create your first transaction
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="p-4 hover:bg-gray-50 transition duration-150">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {transaction.description || 
                      (transaction.type === 'transfer' 
                        ? `Transfer to ${transaction.transfer_to_account_name}` 
                        : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1))}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {transaction.account_name} • {formatDate(transaction.created_at)}
                  </p>
                </div>
                
                <div className="ml-4">
                  <span 
                    className={`text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 
                      transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                    }`}
                  >
                    {transaction.type === 'expense' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentTransactions;