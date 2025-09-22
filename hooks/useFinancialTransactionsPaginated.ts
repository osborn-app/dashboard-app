import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFinancialTransactionsPaginated } from '@/client/realizationClient';
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
  items: FinancialTransaction[];
  meta: {
    total_items: number;
    item_count: number;
  };
  pagination: {
    current_page: number;
    total_page: number;
    next_page: number | null;
  };
}

export function useFinancialTransactionsPaginated(params: PaginationParams) {
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['financial-transactions', params],
    queryFn: () => getFinancialTransactionsPaginated(params),
    staleTime: 0, // No caching
    gcTime: 0, // No caching
  });

  const response = data?.data as PaginatedResponse | undefined;

  return {
    transactions: response?.items || [],
    totalItems: response?.meta?.total_items || 0,
    totalPages: response?.pagination?.total_page || 0,
    currentPage: response?.pagination?.current_page || params.page,
    hasNextPage: response?.pagination?.next_page !== null,
    hasPrevPage: (response?.pagination?.current_page || 1) > 1,
    isLoading: isLoading || isFetching,
    error: error?.message || null,
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

// Hook untuk pagination dengan search dan filters
export function useFinancialTransactionsWithFilters(initialParams: Omit<PaginationParams, 'page'>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialParams.limit || 50);
  const [searchQuery, setSearchQuery] = useState(initialParams.search || '');
  const [filters, setFilters] = useState({
    startDate: initialParams.startDate || '',
    endDate: initialParams.endDate || '',
    accountCode: initialParams.accountCode || '',
    categoryId: initialParams.categoryId || '',
  });

  const debouncedSearch = useDebouncedValue(searchQuery, 500);

  const params: PaginationParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    accountCode: filters.accountCode !== 'all' ? filters.accountCode : undefined,
    categoryId: filters.categoryId !== 'all' ? filters.categoryId : undefined,
  };

  const {
    transactions,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    refetch,
  } = useFinancialTransactionsPaginated(params);

  // Reset to first page when search, filters, or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters.startDate, filters.endDate, filters.accountCode, filters.categoryId, itemsPerPage]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const updatePageSize = useCallback((newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  return {
    // Data
    transactions,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    
    // Loading states
    isLoading,
    error,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Filters
    filters,
    updateFilters,
    
    // Pagination controls
    goToPage,
    updatePageSize,
    refetch,
  };
}
