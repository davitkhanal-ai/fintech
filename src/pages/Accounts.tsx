import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountsAPI } from '../api';
import { Account } from '../types';
import AccountsList from '../components/dashboard/AccountsList';
import AccountForm from '../components/accounts/AccountForm';
import { PlusCircle, X } from 'lucide-react';

const Accounts: React.FC = () => {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await accountsAPI.getAccounts(token);
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accounts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [token]);

  const handleCreateAccount = async (data: { name: string; balance: string }) => {
    if (!token) return;
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await accountsAPI.createAccount(token, data.name, Number(data.balance));
      
      // Fetch updated accounts
      const updatedAccounts = await accountsAPI.getAccounts(token);
      setAccounts(updatedAccounts);
      
      // Close form
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAccount = async (data: { name: string; balance: string }) => {
    if (!token || !editingAccount) return;
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await accountsAPI.updateAccount(token, editingAccount.id, data.name);
      
      // Fetch updated accounts
      const updatedAccounts = await accountsAPI.getAccounts(token);
      setAccounts(updatedAccounts);
      
      // Close form and reset editing state
      setEditingAccount(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (!token) return;
    
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      await accountsAPI.deleteAccount(token, accountId);
      
      // Update local state
      setAccounts(accounts.filter(account => account.id !== accountId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Accounts</h1>
        
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingAccount(null);
          }}
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
              New Account
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
          <AccountForm
            onSubmit={handleCreateAccount}
            isLoading={isSubmitting}
            error={submitError}
          />
        </div>
      )}
      
      {editingAccount && (
        <div className="mb-6">
          <AccountForm
            onSubmit={handleUpdateAccount}
            isLoading={isSubmitting}
            error={submitError}
            initialValues={{
              name: editingAccount.name,
              balance: editingAccount.balance.toString(),
            }}
            submitLabel="Update Account"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setEditingAccount(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {isLoading && !accounts.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <AccountsList 
          accounts={accounts} 
          onEdit={handleEditAccount}
          onDelete={handleDeleteAccount}
        />
      )}
    </div>
  );
};

export default Accounts;