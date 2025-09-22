"use client";

import React, { useEffect, useState } from "react";
import TransactionList from "../transactions";
import { FinancialTransaction, CreateFinancialTransactionData } from "../../types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { TransactionsSkeleton, FadeInWrapper, LoadingSpinner } from "../ui/skeleton-loading";
import {
  useGetFinancialTransactions,
  useCreateFinancialTransaction,
  useUpdateFinancialTransaction,
  useDeleteFinancialTransaction,
  useSyncAllRealizations,
  useGetAccounts,
  useGetTransactionCategories
} from "@/hooks/api/useRealization";
import { TabType } from "../../hooks/use-tab-state";
import { useDebounce } from "../../hooks/use-debounce";
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';

interface TransaksiTabProps {
  registerRefetchCallback: (tab: TabType, callback: () => void) => void;
}

export default function TransaksiTab({ registerRefetchCallback }: TransaksiTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [filters, setFilters] = useState({
    accountCode: "",
    categoryId: "",
  });
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
  
  // API Hooks
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useGetFinancialTransactions({ 
    page: currentPage, 
    limit: pageSize,
    q: debouncedSearchQuery,
    start_date: dateRange?.from ? dayjs(dateRange.from).locale("id").format("YYYY-MM-DDT00:00:00Z") : undefined,
    end_date: dateRange?.to ? dayjs(dateRange.to).locale("id").format("YYYY-MM-DDT23:00:00Z") : undefined,
    category_id: filters.categoryId && filters.categoryId !== "all" ? parseInt(filters.categoryId) : undefined,
  });

  // Hook for exporting all data (without filters)
  const { data: allTransactionsData, refetch: refetchAllTransactions } = useGetFinancialTransactions({ 
    page: 1, 
    limit: 10000,
    // No filters for all data export
  });
  const { data: accountsData } = useGetAccounts({ page: 1, limit: 1000 });
  const { data: categoriesData } = useGetTransactionCategories({ page: 1, limit: 1000 });
  const createTransactionMutation = useCreateFinancialTransaction();
  const updateTransactionMutation = useUpdateFinancialTransaction();
  const deleteTransactionMutation = useDeleteFinancialTransaction();
  const syncAllMutation = useSyncAllRealizations();

  // Register refetch callback for this tab
  useEffect(() => {
    registerRefetchCallback("transaksi", refetchTransactions);
  }, [registerRefetchCallback, refetchTransactions]);

  // Handler functions
  const handleCreateTransaction = async (transactionData: CreateFinancialTransactionData) => {
    try {
      await createTransactionMutation.mutateAsync(transactionData);
      toast.success("Transaksi berhasil dibuat");
    } catch (error) {
      toast.error("Gagal membuat transaksi");
      console.error("Error creating transaction:", error);
    }
  };

  const handleUpdateTransaction = async (id: number, data: any) => {
    try {
      await updateTransactionMutation.mutateAsync({ id, body: data });
      toast.success("Transaksi berhasil diperbarui");
      refetchTransactions();
    } catch (error) {
      toast.error("Gagal memperbarui transaksi");
      console.error("Error updating transaction:", error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransactionMutation.mutateAsync(id);
      toast.success("Transaksi berhasil dihapus");
      refetchTransactions();
    } catch (error) {
      toast.error("Gagal menghapus transaksi");
      console.error("Error deleting transaction:", error);
      throw error;
    }
  };

  const handleSyncAll = async () => {
    try {
      const response = await syncAllMutation.mutateAsync();
      
      // Show SweetAlert success with custom message
      await Swal.fire({
        title: "Berhasil!",
        text: response?.data?.message || "All realizations sync completed",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10b981",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
      });
      
      // Also show toast as backup
      toast.success("Sinkronisasi berhasil dilakukan");
    } catch (error) {
      // Show SweetAlert error
      await Swal.fire({
        title: "Gagal!",
        text: "Gagal melakukan sinkronisasi",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        allowOutsideClick: true,
        allowEscapeKey: true,
      });
      
      // Also show toast as backup
      toast.error("Gagal melakukan sinkronisasi");
      console.error("Error syncing:", error);
    }
  };

  const handleExportTransactions = async (format: 'excel' | 'csv', exportType: 'all' | 'filtered') => {
    try {
      let dataToExport = transactionsData?.items || [];

      // If exporting all data, use the all transactions data
      if (exportType === 'all') {
        // Refresh all transactions data to ensure we have the latest
        await refetchAllTransactions();
        dataToExport = allTransactionsData?.items || [];
      }

      if (dataToExport.length === 0) {
        throw new Error('Tidak ada data untuk diekspor');
      }

      // Prepare data for export
      const exportData = dataToExport.map((transaction: any) => ({
        'ID': transaction.id,
        'Tanggal Transaksi': dayjs(transaction.transaction_date).format('DD/MM/YYYY HH:mm'),
        'Nomor Referensi': transaction.reference_number,
        'Deskripsi': transaction.description,
        'Jumlah': transaction.total_amount,
        'Kategori': transaction.category?.name || '-',
        'Catatan': transaction.notes || '-',
        'Status': transaction.is_active ? 'Aktif' : 'Tidak Aktif',
        'Sumber': transaction.source_type,
        'ID Sumber': transaction.source_id,
        'Tanggal Dibuat': dayjs(transaction.created_at).format('DD/MM/YYYY HH:mm'),
        'Tanggal Diupdate': dayjs(transaction.updated_at).format('DD/MM/YYYY HH:mm'),
      }));

      if (format === 'csv') {
        // Export as CSV
        const csvContent = convertToCSV(exportData);
        downloadFile(csvContent, `transactions_${exportType}_${dayjs().format('YYYY-MM-DD')}.csv`, 'text/csv');
      } else {
        // Export as Excel (XLSX)
        const excelContent = convertToExcel(exportData);
        downloadFile(excelContent, `transactions_${exportType}_${dayjs().format('YYYY-MM-DD')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', true);
      }
      
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  // Helper function to convert data to Excel using XLSX library
  const convertToExcel = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    
    // Generate Excel file as buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return excelBuffer;
  };

  // Helper function to download file
  const downloadFile = (content: any, filename: string, mimeType: string, isExcel: boolean = false) => {
    let blob: Blob;
    
    if (isExcel) {
      // For Excel files, content is already a buffer
      blob = new Blob([content], { type: mimeType });
    } else {
      // For CSV files, content is a string
      blob = new Blob([content], { type: mimeType });
    }
    
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  };

  // Filter handlers
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setCurrentPage(1); // Reset to first page when date range changes
  };

  const handleClearDate = () => {
    setDateRange({ from: undefined, to: undefined });
    setCurrentPage(1); // Reset to first page when date range is cleared
  };

  const handleCategoryFilterChange = (value: string) => {
    handleFilterChange({ categoryId: value });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="space-y-4">
      <FadeInWrapper>
        <TransactionList
          transactions={transactionsData?.items || []}
          accounts={accountsData?.items || []}
          categories={categoriesData?.items || []}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateTransaction={handleCreateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onSyncAll={handleSyncAll}
          onExportTransactions={handleExportTransactions}
          // Filter props
          filters={filters}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onClearDate={handleClearDate}
          onCategoryFilterChange={handleCategoryFilterChange}
          // Pagination props
          currentPage={transactionsData?.pagination?.current_page || currentPage}
          totalPages={transactionsData?.pagination?.total_page || 1}
          totalItems={transactionsData?.meta?.total_items || 0}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={transactionsLoading}
        />
      </FadeInWrapper>
    </div>
  );
}
