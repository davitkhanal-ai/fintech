import { Account, DashboardData, Transaction } from '../types';

const API_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Something went wrong');
  }
  return response.json();
};

// Auth API
export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(response);
  },

  login: async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },
};

// Accounts API
export const accountsAPI = {
  getAccounts: async (token: string): Promise<Account[]> => {
    const response = await fetch(`${API_URL}/accounts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await handleResponse(response);
    return data.accounts;
  },

  createAccount: async (token: string, name: string, balance: number) => {
    const response = await fetch(`${API_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, balance }),
    });
    return handleResponse(response);
  },

  updateAccount: async (token: string, accountId: number, name: string) => {
    const response = await fetch(`${API_URL}/accounts/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    return handleResponse(response);
  },

  deleteAccount: async (token: string, accountId: number) => {
    const response = await fetch(`${API_URL}/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// Transactions API
export const transactionsAPI = {
  getTransactions: async (
    token: string,
    accountId?: number
  ): Promise<Transaction[]> => {
    const url = accountId
      ? `${API_URL}/transactions?account_id=${accountId}`
      : `${API_URL}/transactions`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await handleResponse(response);
    return data.transactions;
  },

  createTransaction: async (
    token: string,
    accountId: number,
    type: string,
    amount: number,
    description: string,
    transferToAccountId?: number
  ) => {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        account_id: accountId,
        type,
        amount,
        description,
        transfer_to_account_id: transferToAccountId,
      }),
    });
    return handleResponse(response);
  },

  deleteTransaction: async (token: string, transactionId: number) => {
    const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: async (token: string): Promise<DashboardData> => {
    const response = await fetch(`${API_URL}/dashboard`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};
