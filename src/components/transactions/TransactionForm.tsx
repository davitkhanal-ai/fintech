import React, { useState, useEffect } from 'react';
import { Account, TransactionType } from '../../types';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface TransactionFormProps {
  accounts: Account[];
  onSubmit: (data: {
    accountId: number;
    type: TransactionType;
    amount: string;
    description: string;
    transferToAccountId?: number;
  }) => void;
  isLoading: boolean;
  error: string | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  accounts,
  onSubmit,
  isLoading,
  error,
}) => {
  const [accountId, setAccountId] = useState<number>(0);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferToAccountId, setTransferToAccountId] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);

  // Set default account if accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && accountId === 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!accountId) {
      setFormError('Please select an account');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }

    if (type === 'transfer' && (!transferToAccountId || transferToAccountId === accountId)) {
      setFormError('Please select a different destination account');
      return;
    }

    onSubmit({
      accountId,
      type,
      amount,
      description,
      transferToAccountId: type === 'transfer' ? transferToAccountId : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Transaction</h2>
      
      {(error || formError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError || error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex space-x-2 mb-6">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-3 px-4 rounded-md border ${
              type === 'income'
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } transition-colors duration-200 flex items-center justify-center`}
          >
            <ArrowUpRight className="h-5 w-5 mr-2" />
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 px-4 rounded-md border ${
              type === 'expense'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } transition-colors duration-200 flex items-center justify-center`}
          >
            <ArrowDownRight className="h-5 w-5 mr-2" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`flex-1 py-3 px-4 rounded-md border ${
              type === 'transfer'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } transition-colors duration-200 flex items-center justify-center`}
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Transfer
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'transfer' ? 'From Account' : 'Account'}
            </label>
            <select
              id="account"
              value={accountId}
              onChange={(e) => setAccountId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isLoading || accounts.length === 0}
            >
              {accounts.length === 0 && (
                <option value="">No accounts available</option>
              )}
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(account.balance)})
                </option>
              ))}
            </select>
          </div>
          
          {type === 'transfer' && (
            <div>
              <label htmlFor="transferToAccount" className="block text-sm font-medium text-gray-700 mb-1">
                To Account
              </label>
              <select
                id="transferToAccount"
                value={transferToAccountId}
                onChange={(e) => setTransferToAccountId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={isLoading || accounts.length <= 1}
              >
                <option value="">Select destination account</option>
                {accounts
                  .filter((account) => account.id !== accountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="What's this transaction for?"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 ${
            isLoading ? 'cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Processing...' : 'Create Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;