import React, { useState } from 'react';
import { Transaction } from '../../types';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Trash2, Calendar, Filter } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (transactionId: number) => void;
  showFilters?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  onDelete,
  showFilters = true
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (typeFilter !== 'all' && transaction.type !== typeFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description?.toLowerCase().includes(query) ||
        transaction.account_name.toLowerCase().includes(query) ||
        (transaction.transfer_to_account_name && 
          transaction.transfer_to_account_name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h2>
        
        {showFilters && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-2 text-xs font-medium rounded-md ${
                    typeFilter === 'all'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter('income')}
                  className={`px-3 py-2 text-xs font-medium rounded-md ${
                    typeFilter === 'income'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setTypeFilter('expense')}
                  className={`px-3 py-2 text-xs font-medium rounded-md ${
                    typeFilter === 'expense'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setTypeFilter('transfer')}
                  className={`px-3 py-2 text-xs font-medium rounded-md ${
                    typeFilter === 'transfer'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Transfers
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {filteredTransactions.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No transactions found.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
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
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
                    <span>{transaction.account_name}</span>
                    <span className="hidden sm:inline mx-1">•</span>
                    <span>{formatDate(transaction.created_at)}</span>
                  </div>
                </div>
                
                <div className="ml-4 flex items-center">
                  <span 
                    className={`text-sm font-semibold mr-4 ${
                      transaction.type === 'income' ? 'text-green-600' : 
                      transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                    }`}
                  >
                    {transaction.type === 'expense' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                  </span>
                  
                  {onDelete && (
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition duration-200"
                      title="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;