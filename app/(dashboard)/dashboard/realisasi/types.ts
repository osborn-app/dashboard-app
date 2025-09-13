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
  debit_account_id: string;
  credit_account_id: string;
  description: string;
  is_active: boolean;
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
