import React from 'react';
import { Account } from '../../types';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AccountsListProps {
  accounts: Account[];
  onEdit?: (account: Account) => void;
  onDelete?: (accountId: number) => void;
  showActions?: boolean;
}

const AccountsList: React.FC<AccountsListProps> = ({ 
  accounts, 
  onEdit,
  onDelete,
  showActions = true
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Your Accounts</h2>
        {showActions && (
          <Link 
            to="/accounts/new" 
            className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 transition duration-200"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Account
          </Link>
        )}
      </div>
      
      {accounts.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">You don't have any accounts yet.</p>
          <Link 
            to="/accounts/new" 
            className="inline-flex items-center mt-2 text-teal-600 hover:text-teal-700"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Create your first account
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {accounts.map((account) => (
            <li key={account.id} className="p-4 hover:bg-gray-50 transition duration-150">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-md font-medium text-gray-800">{account.name}</h3>
                  <p className={`text-lg font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(account.balance)}
                  </p>
                </div>
                
                {showActions && (
                  <div className="flex space-x-2">
                    <Link 
                      to={`/accounts/${account.id}`}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition duration-200"
                    >
                      <span className="sr-only">View account</span>
                      View
                    </Link>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(account)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition duration-200"
                      >
                        <span className="sr-only">Edit account</span>
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(account.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition duration-200"
                      >
                        <span className="sr-only">Delete account</span>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AccountsList;