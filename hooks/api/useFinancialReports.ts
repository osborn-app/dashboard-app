import { useQuery } from '@tanstack/react-query';
import useAxiosAuth from "../axios/use-axios-auth";

// Types untuk Financial Reports
export interface AccountBalance {
  account_id: number;
  account_code: string;
  account_name: string;
  account_type: 'ASSETS' | 'LIABILITIES' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  debit_balance: number;
  credit_balance: number;
  running_balance: number;
}

export interface BalanceSheetData {
  assets: {
    current_assets: AccountBalance[];
    fixed_assets: AccountBalance[];
    total_assets: number;
  };
  liabilities: {
    current_liabilities: AccountBalance[];
    long_term_liabilities: AccountBalance[];
    total_liabilities: number;
  };
  equity: {
    accounts: AccountBalance[];
    total_equity: number;
  };
  total_liabilities_equity: number;
}

export interface ProfitLossData {
  revenue: {
    accounts: AccountBalance[];
    total_revenue: number;
  };
  expenses: {
    accounts: AccountBalance[];
    total_expenses: number;
  };
  net_profit: number;
}

export interface CashFlowData {
  operating_activities: AccountBalance[];
  investing_activities: AccountBalance[];
  financing_activities: AccountBalance[];
  net_cash_flow: number;
}

export interface GeneralJournalEntry {
  id: number;
  reference_number: string;
  transaction_date: string;
  description: string;
  total_amount: number;
  category_id: string;
  notes: string | null;
  is_active: boolean;
  source_type: string;
  source_id: number;
  entries: {
    id: number;
    account_id: string;
    entry_type: 'DEBIT' | 'CREDIT';
    amount: number;
    description: string;
    account: {
      id: number;
      code: string;
      name: string;
      type: string;
    };
  }[];
  category: {
    id: number;
    name: string;
    description: string;
  };
  summary: {
    total_debit: number;
    total_credit: number;
    balance: number;
  };
}

export interface GeneralJournalResponse {
  transactions: GeneralJournalEntry[];
  summary: {
    total_debit: number;
    total_credit: number;
    balance: number;
    transaction_count: number;
  };
}

// Parameters untuk Financial Reports
export interface GetBalanceSheetParams {
  asOfDate: string; // Format: YYYY-MM-DD
}

export interface GetProfitLossParams {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string;   // Format: YYYY-MM-DD
}

export interface GetCashFlowParams {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string;   // Format: YYYY-MM-DD
}

export interface GetGeneralJournalParams {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string;   // Format: YYYY-MM-DD
  limit?: number;    // Default: 1000
  q?: string;        // Search query
}

// React Query Hooks
export const useGetBalanceSheet = (params: GetBalanceSheetParams, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getBalanceSheet = async () => {
    const { data } = await axiosAuth.get('/realization/financial-reports/balance-sheet', {
      params
    });
    return data;
  };

  return useQuery({
    queryKey: ['balance-sheet', params],
    queryFn: getBalanceSheet,
    ...options,
  });
};

export const useGetProfitLoss = (params: GetProfitLossParams, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getProfitLoss = async () => {
    const { data } = await axiosAuth.get('/realization/financial-reports/profit-loss', {
      params
    });
    return data;
  };

  return useQuery({
    queryKey: ['profit-loss', params],
    queryFn: getProfitLoss,
    ...options,
  });
};

export const useGetCashFlow = (params: GetCashFlowParams, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getCashFlow = async () => {
    const { data } = await axiosAuth.get('/realization/financial-reports/cash-flow', {
      params
    });
    return data;
  };

  return useQuery({
    queryKey: ['cash-flow', params],
    queryFn: getCashFlow,
    ...options,
  });
};

export const useGetGeneralJournal = (params: GetGeneralJournalParams, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getGeneralJournal = async () => {
    const { data } = await axiosAuth.get('/realization/financial-reports/general-journal', {
      params
    });
    return data;
  };

  return useQuery({
    queryKey: ['general-journal', params],
    queryFn: getGeneralJournal,
    ...options,
  });
};
