"use client";

import React from "react";
import AccountTable from "../account-table";
import AccountModal from "../modals/account-modal";
import { useAccountForm, AccountFormData } from "../../hooks/use-account-form";
import { useState } from "react";

interface DaftarRekeningTabProps {
  accountTableData: any[];
  onEditAccount: (id: string) => void;
  onDeleteAccount: (id: string) => void;
}

export default function DaftarRekeningTab({
  accountTableData,
  onEditAccount,
  onDeleteAccount
}: DaftarRekeningTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    formData,
    isEditMode,
    editingAccountId,
    updateFormData,
    resetForm,
    setEditMode
  } = useAccountForm();

  const handleAddAccount = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditAccount = (id: string) => {
    // Find account data and populate form
    const account = accountTableData.find(acc => acc.id === id);
    if (account) {
      setEditMode(id, {
        namaAkun: account.name,
        kodeAkun: account.code,
        tipeAkun: account.type,
        kelompokAkun: "",
        terhubungRekening: "tidak",
        namaBank: "",
        nomorRekening: "",
        saldoAwal: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSaveAccount = (data: AccountFormData) => {
    console.log("Saving account:", data);
    // Here you would typically save to your backend
    handleCloseModal();
  };

  return (
    <div className="space-y-4">
      <AccountTable 
        accounts={accountTableData}
        onAddAccount={handleAddAccount}
        onEditAccount={handleEditAccount}
        onDeleteAccount={onDeleteAccount}
      />

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
