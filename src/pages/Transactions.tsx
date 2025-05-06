import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountsAPI, transactionsAPI } from '../api';
import { Account, Transaction } from '../types';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import { PlusCircle, X } from 'lucide-react';

const Transactions: React.FC = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch accounts and transactions in parallel
        const [accountsData, transactionsData] = await Promise.all([
          accountsAPI.getAccounts(token),
          transactionsAPI.getTransactions(token)
        ]);
        
        setAccounts(accountsData);
        setTransactions(transactionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleCreateTransaction = async (data: {
    accountId: number;
    type: 'income' | 'expense' | 'transfer';
    amount: string;
    description: string;
    transferToAccountId?: number;
  }) => {
    if (!token) return;
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      await transactionsAPI.createTransaction(
        token,
        data.accountId,
        data.type,
        Number(data.amount),
        data.description,
        data.transferToAccountId
      );
      
      // Refresh data
      const [accountsData, transactionsData] = await Promise.all([
        accountsAPI.getAccounts(token),
        transactionsAPI.getTransactions(token)
      ]);
      
      setAccounts(accountsData);
      setTransactions(transactionsData);
      
      // Close form
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!token) return;
    
    if (!window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await transactionsAPI.deleteTransaction(token, transactionId);
      
      // Refresh data
      const [accountsData, transactionsData] = await Promise.all([
        accountsAPI.getAccounts(token),
        transactionsAPI.getTransactions(token)
      ]);
      
      setAccounts(accountsData);
      setTransactions(transactionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-300"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-1" />
              New Transaction
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {showForm && (
        <div className="mb-6">
          <TransactionForm
            accounts={accounts}
            onSubmit={handleCreateTransaction}
            isLoading={isSubmitting}
            error={submitError}
          />
        </div>
      )}
      
      {isLoading && !transactions.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <TransactionList 
          transactions={transactions}
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
};

export default Transactions;