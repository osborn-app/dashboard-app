"use client";

import React, { useState, useEffect } from "react";
import BankAccountsTable from "../bank-accounts-table";
import AccountModal from "../modals/account-modal";
import { useAccountForm } from "../../hooks/use-account-form";
import { Account, CreateAccountData } from "../../types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import "../ui/sweetalert-fix.css";
import { AccountTableSkeleton, FadeInWrapper, LoadingSpinner } from "../ui/skeleton-loading";
import {
  useGetBankAccounts,
  useGetBankAccountsWithBalance,
  useGetAccountById,
  useUpdateAccount,
  useDeleteAccount
} from "@/hooks/api/useRealization";
import { TabType } from "../../hooks/use-tab-state";
import { useDebounce } from "../../hooks/use-debounce";

interface DaftarRekeningTabProps {
  registerRefetchCallback: (tab: TabType, callback: () => void) => void;
}

export default function DaftarRekeningTab({ registerRefetchCallback }: DaftarRekeningTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  
  // API Hooks
  const { data: bankAccountsData, isLoading: bankAccountsLoading, refetch: refetchBankAccounts } = useGetBankAccountsWithBalance({
    ...(debouncedSearchQuery && { q: debouncedSearchQuery })
  });
  const { data: accountByIdData, isLoading: accountByIdLoading, refetch: refetchAccountById } = useGetAccountById(selectedAccountId || 0);
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();
  
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
    registerRefetchCallback("daftar-rekening", refetchBankAccounts);
  }, [registerRefetchCallback, refetchBankAccounts]);

  // Effect to handle account data when it's loaded
  useEffect(() => {
    if (accountByIdData && selectedAccountId) {
      const account = accountByIdData.data;
      
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

  // Handler functions
  const handleUpdateAccount = async (id: number, accountData: CreateAccountData) => {
    try {
      await updateAccountMutation.mutateAsync({ id, body: accountData });
      toast.success("Akun berhasil diperbarui");
      refetchBankAccounts();
    } catch (error) {
      toast.error("Gagal memperbarui akun");
      console.error("Error updating account:", error);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    console.log("handleDeleteAccount called with id:", id);
    
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus rekening ini?",
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
          text: "Rekening berhasil dihapus!",
          icon: "success",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          allowEscapeKey: false,
          focusConfirm: true,
          buttonsStyling: true,
          showConfirmButton: true,
          confirmButtonColor: "#3085d6"
        });
        refetchBankAccounts();
      } catch (error) {
        await Swal.fire({
          title: "Error",
          text: (error as Error).message || "Gagal menghapus rekening",
          icon: "error",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          allowEscapeKey: false,
          focusConfirm: true,
          buttonsStyling: true,
          showConfirmButton: true,
          confirmButtonColor: "#d33"
        });
        console.error("Error deleting account:", error);
      }
    }
  };

  const handleEditAccount = (id: number) => {
    console.log("handleEditAccount called with id:", id);
    setSelectedAccountId(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSaveAccount = () => {
    const accountData = getFormDataForAPI();

    if (isEditMode && editingAccountId) {
      handleUpdateAccount(editingAccountId, accountData);
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-4">
      {bankAccountsLoading ? (
        <FadeInWrapper>
          <AccountTableSkeleton />
        </FadeInWrapper>
      ) : (
        <FadeInWrapper delay={200}>
          <BankAccountsTable
            accounts={bankAccountsData?.data || []}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </FadeInWrapper>
      )}

      <AccountModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAccount}
        isEditMode={isEditMode}
        formData={formData}
        onFormChange={updateFormData}
      />
    </div>
  );
}
