import { useState, useEffect, useCallback } from 'react';
import { FinancialTransaction } from '@/app/(dashboard)/dashboard/realisasi/types';

interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  accountCode?: string;
  categoryId?: string;
}

interface PaginatedResponse {
  data: FinancialTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseFinancialTransactionsReturn {
  transactions: FinancialTransaction[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (params: PaginationParams) => Promise<void>;
  refetch: () => void;
}

export function useFinancialTransactions(
  initialParams: PaginationParams
): UseFinancialTransactionsReturn {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialParams.page);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<PaginationParams>(initialParams);

  const fetchTransactions = useCallback(async (newParams: PaginationParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', newParams.page.toString());
      queryParams.append('limit', newParams.limit.toString());
      
      if (newParams.search) queryParams.append('search', newParams.search);
      if (newParams.startDate) queryParams.append('startDate', newParams.startDate);
      if (newParams.endDate) queryParams.append('endDate', newParams.endDate);
      if (newParams.accountCode && newParams.accountCode !== 'all') {
        queryParams.append('accountCode', newParams.accountCode);
      }
      if (newParams.categoryId && newParams.categoryId !== 'all') {
        queryParams.append('categoryId', newParams.categoryId);
      }
      
      // Make API call
      const response = await fetch(`/api/financial-transactions?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: PaginatedResponse = await response.json();
      
      setTransactions(result.data);
      setTotalItems(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
      setParams(newParams);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchTransactions(params);
  }, [fetchTransactions, params]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions(initialParams);
  }, []);

  return {
    transactions,
    totalItems,
    totalPages,
    currentPage,
    isLoading,
    error,
    fetchTransactions,
    refetch,
  };
}

// Hook untuk debounced search
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook untuk pagination dengan search
export function useFinancialTransactionsWithSearch(
  initialParams: PaginationParams
) {
  const [searchQuery, setSearchQuery] = useState(initialParams.search || '');
  const debouncedSearch = useDebouncedValue(searchQuery, 500);
  
  const {
    transactions,
    totalItems,
    totalPages,
    currentPage,
    isLoading,
    error,
    fetchTransactions,
    refetch,
  } = useFinancialTransactions(initialParams);

  // Update search in params
  useEffect(() => {
    if (debouncedSearch !== initialParams.search) {
      fetchTransactions({
        ...initialParams,
        search: debouncedSearch,
        page: 1, // Reset to first page when searching
      });
    }
  }, [debouncedSearch]);

  return {
    transactions,
    totalItems,
    totalPages,
    currentPage,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    fetchTransactions,
    refetch,
  };
}
