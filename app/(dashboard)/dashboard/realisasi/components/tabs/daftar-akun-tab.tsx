"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, Cloud, Search, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import AccountList from "../account-list";
import AccountModal from "../modals/account-modal";
import { useAccountForm } from "../../hooks/use-account-form";
import { Account, CreateAccountData, ReorderAccountsData } from "../../types";
import { toast } from "sonner";
import { AccountListSkeleton, FadeInWrapper, LoadingSpinner } from "../ui/skeleton-loading";
import Swal from "sweetalert2";
import "../ui/sweetalert-fix.css";
import {
  useGetAccounts,
  useGetAccountById,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useReorderAccounts
} from "@/hooks/api/useRealization";
import { TabType } from "../../hooks/use-tab-state";
import { useDebounce } from "../../hooks/use-debounce";

interface DaftarAkunTabProps {
  registerRefetchCallback: (tab: TabType, callback: () => void) => void;
}

export default function DaftarAkunTab({ registerRefetchCallback }: DaftarAkunTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  
  // API Hooks
  const { data: accountsData, isLoading: accountsLoading, refetch: refetchAccounts } = useGetAccounts({ 
    page: 1, 
    limit: 100,
    ...(debouncedSearchQuery && { q: debouncedSearchQuery })
  });
  const { data: accountByIdData, isLoading: accountByIdLoading, refetch: refetchAccountById } = useGetAccountById(selectedAccountId || 0);
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();
  const reorderAccountsMutation = useReorderAccounts();
  
  const {
    formData,
    isEditMode,
    editingAccountId,
    updateFormData,
    resetForm,
    setEditMode,
    getFormDataForAPI
  } = useAccountForm();

  // Register refetch callback for this tab
  useEffect(() => {
    registerRefetchCallback("daftar-akun", refetchAccounts);
  }, [registerRefetchCallback, refetchAccounts]);

  // Refetch data every time component mounts (when tab is clicked)
  useEffect(() => {
    console.log("Daftar Akun tab mounted/activated, refetching data...");
    refetchAccounts();
  }, [refetchAccounts]);

  // Organize accounts into hierarchical structure
  const organizeAccountsHierarchy = (accounts: Account[]) => {
    console.log("Organizing accounts:", accounts);
    
    // Filter only root accounts (parent_id is null)
    const rootAccounts = accounts.filter(account => !account.parent_id);
    
    // Add expanded property to each account and preserve children structure
    const addExpandedProperty = (account: any) => {
      return {
        ...account,
        expanded: false,
        children: account.children && account.children.length > 0 
          ? account.children.map(addExpandedProperty) 
          : []
      };
    };

    // Process root accounts and their children
    const processedAccounts = rootAccounts.map(addExpandedProperty);
    
    console.log("Processed accounts:", processedAccounts);
    return processedAccounts;
  };

  const handleAddAccount = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditAccount = (id: number) => {
    console.log("handleEditAccount called with id:", id);
    setSelectedAccountId(id);
  };

  // Effect to handle account data when it's loaded
  useEffect(() => {
    if (accountByIdData && selectedAccountId) {
      const account = accountByIdData.data;
      console.log("Account data loaded:", account);
      
      if (account) {
        setEditMode(selectedAccountId, {
          code: account.code,
          name: account.name,
          type: account.type,
          level: account.level,
          is_header: account.is_header,
          sort_order: account.sort_order,
          parent_id: account.parent_id,
          is_connected_to_bank: account.is_connected_to_bank,
          bank_name: account.bank_name || "",
          bank_account_number: account.bank_account_number || "",
          initial_balance: account.initial_balance,
          description: account.description || ""
        });
        setIsModalOpen(true);
        setSelectedAccountId(null); // Reset after opening modal
      }
    }
  }, [accountByIdData, selectedAccountId, setEditMode]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Handler functions
  const handleReorderAccounts = async (newOrder: ReorderAccountsData) => {
    try {
      await reorderAccountsMutation.mutateAsync(newOrder);
      toast.success("Urutan akun berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui urutan akun");
      console.error("Error reordering accounts:", error);
    }
  };

  const handleCreateAccount = async (accountData: CreateAccountData) => {
    try {
      await createAccountMutation.mutateAsync(accountData);
      await Swal.fire({
        title: "Berhasil",
        text: "Akun berhasil ditambahkan!",
        icon: "success",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        allowEscapeKey: false,
        focusConfirm: true,
        buttonsStyling: true,
        showConfirmButton: true,
        confirmButtonColor: "#3085d6"
      });
      handleCloseModal();
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: "Gagal membuat akun",
        icon: "error",
        confirmButtonText: "OK",
        focusConfirm: true,
        buttonsStyling: true,
        showConfirmButton: true,
        confirmButtonColor: "#d33"
      });
      console.error("Error creating account:", error);
    }
  };

  const handleUpdateAccount = async (id: number, accountData: CreateAccountData) => {
    console.log("handleUpdateAccount called with id:", id, "accountData:", accountData);
    try {
      await updateAccountMutation.mutateAsync({ id, body: accountData });
      await Swal.fire({
        title: "Berhasil",
        text: "Akun berhasil diperbarui!",
        icon: "success",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        allowEscapeKey: false,
        focusConfirm: true,
        buttonsStyling: true,
        showConfirmButton: true,
        confirmButtonColor: "#3085d6"
      });
      handleCloseModal();
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: "Gagal memperbarui akun",
        icon: "error",
        confirmButtonText: "OK",
        focusConfirm: true,
        buttonsStyling: true,
        showConfirmButton: true,
        confirmButtonColor: "#d33"
      });
      console.error("Error updating account:", error);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus akun ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await deleteAccountMutation.mutateAsync(id);
        await Swal.fire({
          title: "Berhasil",
          text: "Akun berhasil dihapus!",
          icon: "success",
          confirmButtonText: "OK"
        });
        refetchAccounts();
      } catch (error) {
        await Swal.fire({
          title: "Error",
          text: "Gagal menghapus akun",
          icon: "error",
          confirmButtonText: "OK"
        });
        console.error("Error deleting account:", error);
      }
    }
  };

  const handleSaveAccount = () => {
    const accountData = getFormDataForAPI();
    
    if (isEditMode && editingAccountId) {
      handleUpdateAccount(editingAccountId, accountData);
    } else {
      handleCreateAccount(accountData);
    }
    
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari akun....."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Cloud className="h-4 w-4" />
            <span>Rekap Akun</span>
          </Button>
          <Button 
            className={cn(buttonVariants({ variant: "main" }))}
            onClick={handleAddAccount}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Akun
          </Button>
        </div>
      </div>

        <Card>
          <CardContent className="p-6">
            {accountsLoading ? (
              <FadeInWrapper>
                <AccountListSkeleton />
              </FadeInWrapper>
            ) : (
              <FadeInWrapper delay={200}>
                <AccountList
                  accounts={organizeAccountsHierarchy(accountsData?.items || [])}
                  onReorder={handleReorderAccounts}
                  onEditAccount={handleEditAccount}
                  onDeleteAccount={handleDeleteAccount}
                />
              </FadeInWrapper>
            )}
          </CardContent>
        </Card>

      <AccountModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAccount}
        isEditMode={isEditMode}
        formData={formData}
        onFormChange={updateFormData}
        headerAccounts={accountsData?.items?.filter((account: Account) => account.is_header) || []}
      />
    </div>
  );
}
