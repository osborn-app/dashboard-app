"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, TrendingUp, Edit, RefreshCw, Calendar } from "lucide-react";
import EditTransactionModal from "./transaksi/edit-transaction-modal";
import { FinancialTransaction, CreateFinancialTransactionData, Account, TransactionCategory } from "../types";
import { TransactionTable } from "@/components/tables/transaction-tables/transaction-table";
import { createTransactionColumns, TransactionItem } from "@/components/tables/transaction-tables/columns";
import { AdvancedPagination } from "@/components/ui/advanced-pagination";
import { useFinancialTransactionsWithFilters } from "@/hooks/useFinancialTransactionsPaginated";
import { TransactionsSkeleton } from "./ui/skeleton-loading";

interface TransactionListProps {
  accounts?: Account[];
  categories?: TransactionCategory[];
  onCreateTransaction: (transactionData: CreateFinancialTransactionData) => void;
  onDeleteTransaction: (id: number) => void;
  onSyncAll: () => void;
}

export default function TransactionList({ 
  accounts = [],
  categories = [],
  onCreateTransaction, 
  onDeleteTransaction,
  onSyncAll
}: TransactionListProps) {
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  // Use custom hook for paginated data with default limit 50
  const {
    transactions,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    goToPage,
    updatePageSize,
    refetch,
  } = useFinancialTransactionsWithFilters({
    limit: 50, // Default limit 50, can be changed
    search: "",
    startDate: "",
    endDate: "",
    accountCode: "",
    categoryId: "",
  });

  // Handle filter changes
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    updateFilters({ [field]: value });
  };

  const handleAccountFilterChange = (value: string) => {
    updateFilters({ accountCode: value });
  };

  const handleCategoryFilterChange = (value: string) => {
    updateFilters({ categoryId: value });
  };


  const handleEditClick = (transaction: FinancialTransaction) => {
    setSelectedTransactionId(transaction.id);
    setIsEditModalOpen(true);
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={onSyncAll}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
          
          <Button variant="outline" size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Rekap Transaksi
          </Button>
        </div>
        
        {/* Bottom Row: Date Range and Filters */}
        <div className="flex items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              placeholder="Tanggal Mulai"
                className="pr-10"
            />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            
            <div className="relative flex-1">
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              placeholder="Tanggal Selesai"
                className="pr-10"
            />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          
          {/* Account Filter */}
          <Select value={filters.accountCode || "all"} onValueChange={handleAccountFilterChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Semua Akun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Akun</SelectItem>
              <SelectItem value="11100">11100 - KAS & BANK</SelectItem>
              <SelectItem value="41000">41000 - Pendapatan Sewa Kendaraan</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Category Filter */}
          <Select value={filters.categoryId || "all"} onValueChange={handleCategoryFilterChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      {totalPages > 1 && (
        <div className="mt-4">
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage} // Dynamic limit
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 20, 50, 100]} // Multiple options
            showPageSizeSelector={true} // Show selector
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

    </div>
  );
}
