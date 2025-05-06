// User types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Account types
export interface Account {
  id: number;
  name: string;
  balance: number;
  created_at: string;
}

// Transaction types
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: number;
  account_id: number;
  type: TransactionType;
  amount: number;
  description: string;
  transfer_to_account_id: number | null;
  created_at: string;
  account_name: string;
  transfer_to_account_name?: string;
}

// Dashboard types
export interface MonthlySummary {
  month: number;
  year: number;
  type: 'income' | 'expense';
  total: number;
}

export interface DashboardData {
  accounts: Account[];
  total_balance: number;
  recent_transactions: Transaction[];
  monthly_summary: MonthlySummary[];
}