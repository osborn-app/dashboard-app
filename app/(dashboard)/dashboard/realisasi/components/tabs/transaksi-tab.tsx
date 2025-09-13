"use client";

import React, { useEffect, useState } from "react";
import TransactionList from "../transactions";
import { FinancialTransaction, CreateFinancialTransactionData } from "../../types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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

interface TransaksiTabProps {
  registerRefetchCallback: (tab: TabType, callback: () => void) => void;
}

export default function TransaksiTab({ registerRefetchCallback }: TransaksiTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
  
  // API Hooks
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useGetFinancialTransactions({ 
    page: 1, 
    limit: 50,
    ...(debouncedSearchQuery && { q: debouncedSearchQuery })
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
      await syncAllMutation.mutateAsync();
      toast.success("Sinkronisasi berhasil dilakukan");
    } catch (error) {
      toast.error("Gagal melakukan sinkronisasi");
      console.error("Error syncing:", error);
    }
  };

  return (
    <div className="space-y-4">
      {transactionsLoading ? (
        <FadeInWrapper>
          <TransactionsSkeleton />
        </FadeInWrapper>
      ) : (
        <FadeInWrapper delay={200}>
          <TransactionList
            transactions={transactionsData?.items || []}
            accounts={accountsData?.items || []}
            categories={categoriesData?.items || []}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateTransaction={handleCreateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onSyncAll={handleSyncAll}
          />
        </FadeInWrapper>
      )}
    </div>
  );
}
