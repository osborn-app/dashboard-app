"use client";

import React, { useEffect, useState } from "react";
import Categories from "../categories";
import { TransactionCategory, CreateTransactionCategoryData } from "../../types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CategoriesSkeleton, FadeInWrapper, LoadingSpinner } from "../ui/skeleton-loading";
import {
  useGetTransactionCategories,
  useCreateTransactionCategory,
  useUpdateTransactionCategory,
  useDeleteTransactionCategory,
  useGetAccounts
} from "@/hooks/api/useRealization";
import { TabType } from "../../hooks/use-tab-state";
import { useDebounce } from "../../hooks/use-debounce";

interface KategoriTabProps {
  registerRefetchCallback: (tab: TabType, callback: () => void) => void;
}

export default function KategoriTab({ registerRefetchCallback }: KategoriTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
  
  // API Hooks
  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = useGetTransactionCategories({ 
    page: 1, 
    limit: 100,
    ...(debouncedSearchQuery && { q: debouncedSearchQuery })
  });
  const { data: accountsData } = useGetAccounts({ page: 1, limit: 1000 });
  const createCategoryMutation = useCreateTransactionCategory();

  // Register refetch callback for this tab
  useEffect(() => {
    registerRefetchCallback("kategori", refetchCategories);
  }, [registerRefetchCallback, refetchCategories]);

  // Handler functions
  const handleCreateCategory = async (categoryData: CreateTransactionCategoryData) => {
    try {
      await createCategoryMutation.mutateAsync(categoryData);
      toast.success("Kategori berhasil dibuat");
    } catch (error) {
      toast.error("Gagal membuat kategori");
      console.error("Error creating category:", error);
    }
  };

  const handleUpdateCategory = async (id: number, categoryData: CreateTransactionCategoryData) => {
    try {
      toast.success("Kategori berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui kategori");
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      toast.success("Kategori berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus kategori");
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="space-y-4">
      {categoriesLoading ? (
        <FadeInWrapper>
          <CategoriesSkeleton />
        </FadeInWrapper>
      ) : (
        <FadeInWrapper delay={200}>
          <Categories
            categories={categoriesData?.items || []}
            accounts={accountsData?.items || []}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </FadeInWrapper>
      )}
    </div>
  );
}
