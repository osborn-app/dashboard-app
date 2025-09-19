"use client";

import React, { useEffect, useState } from "react";
import Categories from "../categories";
import { TransactionCategory, CreateTransactionCategoryData } from "../../types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { CategoriesSkeleton, FadeInWrapper, LoadingSpinner } from "../ui/skeleton-loading";
import {
  useGetTransactionCategories,
  useCreateTransactionCategory,
  useUpdateTransactionCategory,
  useDeleteTransactionCategory,
  useGetAccounts
} from "@/hooks/api/useRealization";
import { TabType } from "../../hooks/use-tab-state";

interface KategoriTabProps {
  registerRefetchCallback: (tab: TabType, callback: () => void) => void;
}

export default function KategoriTab({ registerRefetchCallback }: KategoriTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // API Hooks - fetch all data without search query to avoid refetch
  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = useGetTransactionCategories({ 
    page: 1, 
    limit: 1000, // Get all categories for client-side filtering
  });
  const { data: accountsData } = useGetAccounts({ page: 1, limit: 1000 });
  const createCategoryMutation = useCreateTransactionCategory();
  const updateCategoryMutation = useUpdateTransactionCategory();
  const deleteCategoryMutation = useDeleteTransactionCategory();

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
      await updateCategoryMutation.mutateAsync({ id, body: categoryData });
      toast.success("Kategori berhasil diperbarui");
      refetchCategories();
    } catch (error) {
      toast.error("Gagal memperbarui kategori");
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: number, categoryName: string) => {
    try {
      // Show SweetAlert confirmation
      const result = await Swal.fire({
        title: 'Konfirmasi Hapus',
        text: `Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await deleteCategoryMutation.mutateAsync(id);
        
        // Show success SweetAlert
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Kategori berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
        
        refetchCategories();
      }
    } catch (error) {
      // Show error SweetAlert
      await Swal.fire({
        title: 'Gagal!',
        text: 'Gagal menghapus kategori.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
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
