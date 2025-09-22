import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/realization";

// ===== ACCOUNTS HOOKS =====
interface GetAccountsParams {
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
  type?: string;
  level?: number;
  is_connected_to_bank?: boolean;
  is_header?: boolean;
  parent_id?: number;
  sort_by?: string;
  sort_dir?: 'ASC' | 'DESC';
}

export const useGetAccounts = (params: GetAccountsParams = {}, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getAccounts = async () => {
    console.log("useGetAccounts params:", params); // Debug log
    
    // Filter out undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
    
    console.log("useGetAccounts cleanParams:", cleanParams); // Debug log
    
    const { data } = await axiosAuth.get(`${baseEndpoint}/accounts`, {
      params: cleanParams,
    });
    return data;
  };

  return useQuery({
    queryKey: ["realization", "accounts", params],
    queryFn: getAccounts,
    ...options,
  });
};

export const useGetAccountsWithBalance = (params: GetAccountsParams = {}, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getAccountsWithBalance = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/accounts/with-balance`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["realization", "accounts", "with-balance", params],
    queryFn: getAccountsWithBalance,
    ...options,
  });
};

export const useGetAccountById = (id: number | string) => {
  const axiosAuth = useAxiosAuth();

  const getAccountById = () => {
    return axiosAuth.get(`${baseEndpoint}/accounts/${id}`);
  };

  return useQuery({
    queryKey: ["realization", "accounts", id],
    queryFn: getAccountById,
    enabled: !!id,
  });
};

export const useGetHierarchicalAccounts = (options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getHierarchicalAccounts = () => {
    return axiosAuth.get(`${baseEndpoint}/accounts/hierarchical`);
  };

  return useQuery({
    queryKey: ["realization", "accounts", "hierarchical"],
    queryFn: getHierarchicalAccounts,
    ...options,
  });
};

export const useGetBankAccounts = (options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getBankAccounts = () => {
    return axiosAuth.get(`${baseEndpoint}/accounts/bank-accounts`);
  };

  return useQuery({
    queryKey: ["realization", "accounts", "bank"],
    queryFn: getBankAccounts,
    ...options,
  });
};

export const useGetBankAccountsWithBalance = (params: GetAccountsParams = {}, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getBankAccountsWithBalance = async () => {
    console.log("useGetBankAccountsWithBalance params:", params); // Debug log
    
    // Filter out undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
    
    console.log("useGetBankAccountsWithBalance cleanParams:", cleanParams); // Debug log
    
    const { data } = await axiosAuth.get(`${baseEndpoint}/accounts/bank/with-balance`, {
      params: cleanParams,
    });
    return data;
  };

  return useQuery({
    queryKey: ["realization", "accounts", "bank", "with-balance", params],
    queryFn: getBankAccountsWithBalance,
    ...options,
  });
};

export const useGetDetailAccounts = (options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getDetailAccounts = () => {
    return axiosAuth.get(`${baseEndpoint}/accounts/detail-accounts`);
  };

  return useQuery({
    queryKey: ["realization", "accounts", "detail"],
    queryFn: getDetailAccounts,
    ...options,
  });
};

export const useCreateAccount = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const createAccount = (body: any) => {
    return axiosAuth.post(`${baseEndpoint}/accounts`, body);
  };

  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization", "accounts"] });
    },
  });
};

export const useUpdateAccount = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updateAccount = ({ id, body }: { id: number; body: any }) => {
    return axiosAuth.patch(`${baseEndpoint}/accounts/${id}`, body);
  };

  return useMutation({
    mutationFn: updateAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization", "accounts"] });
    },
  });
};

export const useDeleteAccount = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteAccount = async (id: number) => {
    const response = await axiosAuth.delete(`${baseEndpoint}/accounts/${id}`);
    
    // Check if the response indicates failure
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || 'Failed to delete account');
    }
    
    return response;
  };

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["realization", "accounts", "bank"] });
    },
  });
};

export const useReorderAccounts = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const reorderAccounts = (body: any) => {
    return axiosAuth.post(`${baseEndpoint}/accounts/reorder`, body);
  };

  return useMutation({
    mutationFn: reorderAccounts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization", "accounts"] });
    },
  });
};

// ===== TRANSACTION CATEGORIES HOOKS =====
interface GetTransactionCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
  debit_account_id?: number;
  credit_account_id?: number;
  is_active?: boolean;
  sort_by?: string;
  sort_dir?: 'ASC' | 'DESC';
}

export const useGetTransactionCategories = (params: GetTransactionCategoriesParams = {}, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getTransactionCategories = async () => {
    console.log("useGetTransactionCategories params:", params); // Debug log
    
    // Filter out undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
    
    console.log("useGetTransactionCategories cleanParams:", cleanParams); // Debug log
    
    const { data } = await axiosAuth.get(`${baseEndpoint}/transaction-categories`, {
      params: cleanParams,
    });
    return data;
  };

  return useQuery({
    queryKey: ["realization", "categories", params],
    queryFn: getTransactionCategories,
    ...options,
  });
};

export const useGetTransactionCategoryById = (id: number | string) => {
  const axiosAuth = useAxiosAuth();

  const getTransactionCategoryById = () => {
    return axiosAuth.get(`${baseEndpoint}/transaction-categories/${id}`);
  };

  return useQuery({
    queryKey: ["realization", "categories", id],
    queryFn: getTransactionCategoryById,
    enabled: !!id,
  });
};

export const useGetActiveTransactionCategories = (options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getActiveTransactionCategories = () => {
    return axiosAuth.get(`${baseEndpoint}/transaction-categories/active`);
  };

  return useQuery({
    queryKey: ["realization", "categories", "active"],
    queryFn: getActiveTransactionCategories,
    ...options,
  });
};

export const useCreateTransactionCategory = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const createTransactionCategory = (body: any) => {
    return axiosAuth.post(`${baseEndpoint}/transaction-categories`, body);
  };

  return useMutation({
    mutationFn: createTransactionCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization", "categories"] });
    },
  });
};

export const useUpdateTransactionCategory = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updateTransactionCategory = ({ id, body }: { id: string | number; body: any }) => {
    return axiosAuth.patch(`${baseEndpoint}/transaction-categories/${id}`, body);
  };

  return useMutation({
    mutationFn: updateTransactionCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization", "categories"] });
    },
  });
};

export const useDeleteTransactionCategory = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteTransactionCategory = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/transaction-categories/${id}`);
  };

  return useMutation({
    mutationFn: deleteTransactionCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization", "categories"] });
    },
  });
};

// ===== FINANCIAL TRANSACTIONS HOOKS =====
interface GetFinancialTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
  category_id?: number;
  account_id?: number;
  start_date?: string;
  end_date?: string;
  source_type?: string;
  sort_by?: string;
  sort_dir?: 'ASC' | 'DESC';
}

// export const useGetFinancialTransactions = (params: GetFinancialTransactionsParams = {}, options = {}) => {
//   const axiosAuth = useAxiosAuth();

//   const getFinancialTransactions = async () => {
//     console.log("useGetFinancialTransactions params:", params); // Debug log
    
//     // Filter out undefined values
//     const cleanParams = Object.fromEntries(
//       Object.entries(params).filter(([_, value]) => value !== undefined)
//     );
    
//     console.log("useGetFinancialTransactions cleanParams:", cleanParams); // Debug log
    
//     const { data } = await axiosAuth.get(`${baseEndpoint}/financial-transactions`, {
//       params: cleanParams,
//     });
//     return data;
//   };

//   return useQuery({
//     queryKey: ["realization", "transactions", params],
//     queryFn: getFinancialTransactions,
//     ...options,
//   });
// };

export const useGetFinancialTransactions = (params?: GetFinancialTransactionsParams) => {
  const axiosAuth = useAxiosAuth();

  const getFinancialTransactions = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/financial-transactions`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["realization", "transactions", params],
    queryFn: getFinancialTransactions,
  });
};

export const useGetFinancialTransactionById = (id: number | string) => {
  const axiosAuth = useAxiosAuth();

  const getFinancialTransactionById = () => {
    return axiosAuth.get(`${baseEndpoint}/financial-transactions/${id}`);
  };

  return useQuery({
    queryKey: ["realization", "transactions", id],
    queryFn: getFinancialTransactionById,
    enabled: !!id,
  });
};

export const useGetGeneralJournal = (params: GetFinancialTransactionsParams = {}, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getGeneralJournal = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/financial-transactions/general-journal`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["realization", "general-journal", params],
    queryFn: getGeneralJournal,
    ...options,
  });
};

export const useCreateFinancialTransaction = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const createFinancialTransaction = (body: any) => {
    return axiosAuth.post(`${baseEndpoint}/financial-transactions`, body);
  };

  return useMutation({
    mutationFn: createFinancialTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization", "transactions"] });
    },
  });
};

export const useUpdateFinancialTransaction = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updateFinancialTransaction = ({ id, body }: { id: number; body: any }) => {
    return axiosAuth.patch(`${baseEndpoint}/financial-transactions/${id}`, body);
  };

  return useMutation({
    mutationFn: updateFinancialTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization", "transactions"] });
    },
  });
};

export const useDeleteFinancialTransaction = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteFinancialTransaction = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/financial-transactions/${id}`);
  };

  return useMutation({
    mutationFn: deleteFinancialTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization", "transactions"] });
    },
  });
};

// ===== FINANCIAL REPORTS HOOKS =====
export const useGetBalanceSheet = (asOfDate: string, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getBalanceSheet = () => {
    return axiosAuth.get(`${baseEndpoint}/financial-reports/balance-sheet`, {
      params: { asOfDate }
    });
  };

  return useQuery({
    queryKey: ["realization", "reports", "balance-sheet", asOfDate],
    queryFn: getBalanceSheet,
    enabled: !!asOfDate,
    ...options,
  });
};

export const useGetProfitLoss = (startDate: string, endDate: string, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getProfitLoss = () => {
    return axiosAuth.get(`${baseEndpoint}/financial-reports/profit-loss`, {
      params: { startDate, endDate }
    });
  };

  return useQuery({
    queryKey: ["realization", "reports", "profit-loss", startDate, endDate],
    queryFn: getProfitLoss,
    enabled: !!startDate && !!endDate,
    ...options,
  });
};

export const useGetCashFlow = (startDate: string, endDate: string, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getCashFlow = () => {
    return axiosAuth.get(`${baseEndpoint}/financial-reports/cash-flow`, {
      params: { startDate, endDate }
    });
  };

  return useQuery({
    queryKey: ["realization", "reports", "cash-flow", startDate, endDate],
    queryFn: getCashFlow,
    enabled: !!startDate && !!endDate,
    ...options,
  });
};

export const useGetGeneralJournalReport = (startDate: string, endDate: string, limit?: number, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getGeneralJournalReport = () => {
    return axiosAuth.get(`${baseEndpoint}/financial-reports/general-journal`, {
      params: { startDate, endDate, limit }
    });
  };

  return useQuery({
    queryKey: ["realization", "reports", "general-journal", startDate, endDate, limit],
    queryFn: getGeneralJournalReport,
    enabled: !!startDate && !!endDate,
    ...options,
  });
};

// ===== SYNC HOOKS =====
export const useSyncPaidOrders = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const syncPaidOrders = () => {
    return axiosAuth.post(`${baseEndpoint}/sync/paid-orders`);
  };

  return useMutation({
    mutationFn: syncPaidOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization"] });
    },
  });
};

export const useSyncApprovedReimburses = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const syncApprovedReimburses = () => {
    return axiosAuth.post(`${baseEndpoint}/sync/approved-reimburses`);
  };

  return useMutation({
    mutationFn: syncApprovedReimburses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization"] });
    },
  });
};

export const useSyncVerifiedInventory = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const syncVerifiedInventory = () => {
    return axiosAuth.post(`${baseEndpoint}/sync/verified-inventory`);
  };

  return useMutation({
    mutationFn: syncVerifiedInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization"] });
    },
  });
};

export const useSyncAllRealizations = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const syncAllRealizations = () => {
    return axiosAuth.post(`${baseEndpoint}/sync/all`);
  };

  return useMutation({
    mutationFn: syncAllRealizations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["realization"] });
    },
  });
};
