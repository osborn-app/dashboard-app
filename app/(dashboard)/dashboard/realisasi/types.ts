export interface Account {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  type: string;
  level: number;
  is_active: boolean;
  sort_order: number;
  is_header: boolean;
  is_connected_to_bank: boolean;
  bank_name?: string | null;
  bank_account_number?: string | null;
  initial_balance: number;
  parent_id?: string | null;
  description?: string | null;
}

export interface TransactionEntry {
  id: number;
  created_at: string;
  updated_at: string;
  transaction_id: string;
  account_id: string;
  entry_type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  account: Account;
}

export interface TransactionCategory {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  debit_account_id: number;
  credit_account_id: number;
  description: string;
  is_active: boolean;
  debit_account?: Account;
  credit_account?: Account;
}

export interface FinancialTransaction {
  id: number;
  created_at: string;
  updated_at: string;
  reference_number: string;
  transaction_date: string;
  description: string;
  total_amount: number;
  category_id: string;
  notes: string;
  is_active: boolean;
  source_type: string;
  source_id: number;
  entries: TransactionEntry[];
  category: TransactionCategory;
}

export interface CreateFinancialTransactionData {
  description: string;
  transaction_date: string;
  category_id: string;
  total_amount: number;
  notes?: string;
  entries: {
    account_id: string;
    entry_type: 'DEBIT' | 'CREDIT';
    amount: number;
    description: string;
  }[];
}

export interface ReorderAccountItem {
  id: number;
  sort_order: number;
}

export interface ReorderAccountsData {
  accounts: ReorderAccountItem[];
}

export enum AccountType {
  ASSETS = 'ASSETS',
  LIABILITIES = 'LIABILITIES',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export interface CreateAccountData {
  code: string;
  name: string;
  type: AccountType;
  level?: number;
  is_header?: boolean;
  sort_order?: number;
  parent_id?: number;
  is_connected_to_bank?: boolean;
  bank_name?: string;
  bank_account_number?: string;
  initial_balance?: number;
  description?: string;
}

export interface CreateTransactionCategoryData {
  name: string;
  debit_account_id: number;
  credit_account_id: number;
  description?: string;
}