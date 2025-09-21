"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, TrendingUp, Edit, RefreshCw } from "lucide-react";
import EditTransactionModal from "./transaksi/edit-transaction-modal";
import { FinancialTransaction, CreateFinancialTransactionData, Account, TransactionCategory } from "../types";
import { TransactionTable } from "@/components/tables/transaction-tables/transaction-table";
import { createTransactionColumns, TransactionItem } from "@/components/tables/transaction-tables/columns";
import { AdvancedPagination } from "@/components/ui/advanced-pagination";
// import { useFinancialTransactionsWithFilters } from "@/hooks/useFinancialTransactionsPaginated";
import { TransactionsSkeleton } from "./ui/skeleton-loading";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";
import CategoryFilter from "./category-filter";
import ExportModal from "./modals/export-modal";
import Swal from "sweetalert2";

interface TransactionListProps {
  transactions?: FinancialTransaction[];
  accounts?: Account[];
  categories?: TransactionCategory[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreateTransaction: (transactionData: CreateFinancialTransactionData) => void;
  onDeleteTransaction: (id: number) => void;
  onSyncAll: () => void;
  onExportTransactions?: (format: 'excel' | 'csv', exportType: 'all' | 'filtered') => void;
  // Filter props
  filters?: {
    accountCode: string;
    categoryId: string;
  };
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  onClearDate?: () => void;
  onAccountFilterChange?: (value: string) => void;
  onCategoryFilterChange?: (value: string) => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
}

export default function TransactionList({ 
  transactions: externalTransactions,
  accounts = [],
  categories = [],
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  onCreateTransaction, 
  onDeleteTransaction,
  onSyncAll,
  onExportTransactions,
  // Filter props
  filters = { accountCode: "", categoryId: "" },
  dateRange,
  onDateRangeChange,
  onClearDate,
  onAccountFilterChange,
  onCategoryFilterChange,
  // Pagination props
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 50,
  onPageChange,
  onPageSizeChange,
  isLoading = false
}: TransactionListProps) {
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Use data from props instead of internal hook
  const transactions = externalTransactions || [];
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || "");

  // Use real pagination data from props
  const error = null;

  // Pagination handlers using real functions
  const goToPage = (page: number) => {
    onPageChange?.(page);
  };

  const updatePageSize = (newLimit: number) => {
    onPageSizeChange?.(newLimit);
  };

  const refetch = () => {
    // This will be handled by the parent component
    console.log("Refetch data");
  };


  const handleEditClick = (transaction: FinancialTransaction) => {
    setSelectedTransactionId(transaction.id);
    setIsEditModalOpen(true);
  };

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const handleExport = async (format: 'excel' | 'csv', exportType: 'all' | 'filtered') => {
    try {
      setIsExporting(true);
      
      // Call parent export handler
      if (onExportTransactions) {
        await onExportTransactions(format, exportType);
      }
      
      // Close modal
      setIsExportModalOpen(false);
      
      // Show success message
      const exportTypeText = exportType === 'all' ? 'semua data' : 'data sesuai filter';
      await Swal.fire({
        title: "Berhasil!",
        text: `${exportTypeText} berhasil diekspor dalam format ${format.toUpperCase()}`,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10b981",
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
      });
      
    } catch (error) {
      console.error("Export error:", error);
      
      // Show error message
      await Swal.fire({
        title: "Gagal!",
        text: "Gagal mengekspor data transaksi",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        allowOutsideClick: true,
        allowEscapeKey: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteTransaction = (id: number) => {
    onDeleteTransaction(id);
  };

  const handleEditTransaction = (id: number, data: any) => {
    // TODO: Implement edit transaction logic
    console.log('Edit transaction:', id, data);
  };

  // Convert FinancialTransaction to TransactionItem format
  const convertToTransactionItems = (transactions: FinancialTransaction[]): TransactionItem[] => {
    const items: TransactionItem[] = [];
    
    transactions.forEach((transaction) => {
      const debitEntry = transaction.entries.find(entry => entry.entry_type === 'DEBIT');
      const creditEntry = transaction.entries.find(entry => entry.entry_type === 'CREDIT');
      
      // Add debit entry
      if (debitEntry) {
        items.push({
          id: transaction.id,
          tanggal: transaction.transaction_date,
          kategori: transaction.category?.name || '-',
          keterangan: transaction.description,
          namaAkun: debitEntry.account.name,
          debit: debitEntry.amount,
          kredit: 0,
          transactionGroup: `transaction-${transaction.id}`,
          isFirstInGroup: true,
        });
      }
      
      // Add credit entry
      if (creditEntry) {
        items.push({
          id: transaction.id,
          tanggal: transaction.transaction_date,
          kategori: transaction.category?.name || '-',
          keterangan: transaction.description,
          namaAkun: creditEntry.account.name,
          debit: 0,
          kredit: creditEntry.amount,
          transactionGroup: `transaction-${transaction.id}`,
          isFirstInGroup: false,
        });
      }
    });
    
    return items;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (pageSize: number) => {
    updatePageSize(pageSize);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Section */}
      <div className="space-y-3">
        {/* Top Row: Search and Action Buttons */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari transaksi....."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                externalOnSearchChange?.(e.target.value);
              }}
              className="pl-10"
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={onSyncAll}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportClick}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Rekap Transaksi
          </Button>
        </div>
        
        {/* Bottom Row: Date Range and Filters */}
        <div className="flex items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2 flex-1">
            <CalendarDateRangePicker
              onDateRangeChange={onDateRangeChange || (() => {})}
              onClearDate={onClearDate || (() => {})}
              dateRange={dateRange}
            />
          </div>
          {/* Category Filter */}
          <CategoryFilter
            categories={categories || []}
            selectedCategoryId={filters.categoryId || "all"}
            onCategoryChange={onCategoryFilterChange}
            placeholder="Semua Kategori"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TransactionsSkeleton />
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-2">Error: {error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()}
                >
                  Coba Lagi
                </Button>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500">Tidak ada data transaksi</p>
              </div>
            </div>
          ) : (
            <TransactionTable
              columns={createTransactionColumns({
                onEdit: (item) => {
                  const transaction = transactions.find(t => t.id === item.id);
                  if (transaction) {
                    handleEditClick(transaction);
                  }
                }
              })}
              data={convertToTransactionItems(transactions)}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 0 && totalItems > 0 && (
        <div className="mt-4">
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 20, 50, 100]}
            showPageSizeSelector={true}
            showInfo={true}
            maxVisiblePages={5}
          />
        </div>
      )}

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransactionId(null);
        }}
        transactionId={selectedTransactionId}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />

    </div>
  );
}
