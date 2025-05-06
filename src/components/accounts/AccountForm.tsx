import React, { useState } from 'react';

interface AccountFormProps {
  onSubmit: (data: { name: string; balance: string }) => void;
  isLoading: boolean;
  error: string | null;
  initialValues?: { name: string; balance: string };
  submitLabel?: string;
}

const AccountForm: React.FC<AccountFormProps> = ({
  onSubmit,
  isLoading,
  error,
  initialValues = { name: '', balance: '0' },
  submitLabel = 'Create Account',
}) => {
  const [name, setName] = useState(initialValues.name);
  const [balance, setBalance] = useState(initialValues.balance);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!name.trim()) {
      setFormError('Account name is required');
      return;
    }

    if (isNaN(Number(balance)) || Number(balance) < 0) {
      setFormError('Please enter a valid balance');
      return;
    }

    onSubmit({ name, balance });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{submitLabel}</h2>
      
      {(error || formError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError || error}
        </div>
      )}
      
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Account Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g., Checking Account"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
            Initial Balance
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              id="balance"
              type="number"
              min="0"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="0.00"
              disabled={isLoading || submitLabel.toLowerCase().includes('edit')}
            />
          </div>
          {submitLabel.toLowerCase().includes('edit') && (
            <p className="mt-1 text-sm text-gray-500">
              Initial balance cannot be changed after account creation.
            </p>
          )}
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
          {isLoading ? 'Processing...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default AccountForm;