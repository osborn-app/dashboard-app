import client from "./apiClient";

// Accounts API
export const getAccounts = (params?: any) => {
  return client.get("/realization/accounts", { params });
};

export const getAccountById = (id: string | number) => {
  return client.get(`/realization/accounts/${id}`);
};

export const getHierarchicalAccounts = () => {
  return client.get("/realization/accounts/hierarchical");
};

export const getBankAccounts = () => {
  return client.get("/realization/accounts/bank-accounts");
};

export const getDetailAccounts = () => {
  return client.get("/realization/accounts/detail-accounts");
};

export const createAccount = (data: any) => {
  return client.post("/realization/accounts", data);
};

export const updateAccount = (id: string | number, data: any) => {
  return client.patch(`/realization/accounts/${id}`, data);
};

export const deleteAccount = (id: string | number) => {
  return client.delete(`/realization/accounts/${id}`);
};

export const reorderAccounts = (data: any) => {
  return client.post("/realization/accounts/reorder", data);
};

// Transaction Categories API
export const getTransactionCategories = (params?: any) => {
  return client.get("/realization/transaction-categories", { params });
};

export const getTransactionCategoryById = (id: string | number) => {
  return client.get(`/realization/transaction-categories/${id}`);
};

export const getActiveTransactionCategories = () => {
  return client.get("/realization/transaction-categories/active");
};

export const createTransactionCategory = (data: any) => {
  return client.post("/realization/transaction-categories", data);
};

export const updateTransactionCategory = (id: string | number, data: any) => {
  return client.patch(`/realization/transaction-categories/${id}`, data);
};

export const deleteTransactionCategory = (id: string | number) => {
  return client.delete(`/realization/transaction-categories/${id}`);
};

// Financial Transactions API
export const getFinancialTransactions = (params?: any) => {
  return client.get("/realization/financial-transactions", { params });
};

export const getFinancialTransactionsPaginated = (params: {
  page: number;
  limit: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  accountCode?: string;
  categoryId?: string;
}) => {
  return client.get("/realization/financial-transactions", { params });
};

export const getFinancialTransactionById = (id: string | number) => {
  return client.get(`/realization/financial-transactions/${id}`);
};

export const getGeneralJournal = (params?: any) => {
  return client.get("/realization/financial-transactions/general-journal", { params });
};

export const createFinancialTransaction = (data: any) => {
  return client.post("/realization/financial-transactions", data);
};

export const deleteFinancialTransaction = (id: string | number) => {
  return client.delete(`/realization/financial-transactions/${id}`);
};

// Financial Reports API
export const getBalanceSheet = (asOfDate: string) => {
  return client.get("/realization/financial-reports/balance-sheet", {
    params: { asOfDate }
  });
};

export const getProfitLoss = (startDate: string, endDate: string) => {
  return client.get("/realization/financial-reports/profit-loss", {
    params: { startDate, endDate }
  });
};

export const getCashFlow = (startDate: string, endDate: string) => {
  return client.get("/realization/financial-reports/cash-flow", {
    params: { startDate, endDate }
  });
};

export const getGeneralJournalReport = (startDate: string, endDate: string, limit?: number) => {
  return client.get("/realization/financial-reports/general-journal", {
    params: { startDate, endDate, limit }
  });
};

// Sync API
export const syncPaidOrders = () => {
  return client.post("/realization/sync/paid-orders");
};

export const syncApprovedReimburses = () => {
  return client.post("/realization/sync/approved-reimburses");
};

export const syncVerifiedInventory = () => {
  return client.post("/realization/sync/verified-inventory");
};

export const syncAllRealizations = () => {
  return client.post("/realization/sync/all");
};
