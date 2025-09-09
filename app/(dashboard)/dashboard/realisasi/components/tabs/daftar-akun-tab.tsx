"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, Cloud, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import AccountList from "../account-list";
import AccountModal from "../modals/account-modal";
import { useAccountForm, AccountFormData } from "../../hooks/use-account-form";

interface DaftarAkunTabProps {
  accountsData: any[];
  onReorderAccounts: (newOrder: any[]) => void;
  onEditAccount: (id: string) => void;
  onDeleteAccount: (id: string) => void;
}

export default function DaftarAkunTab({
  accountsData,
  onReorderAccounts,
  onEditAccount,
  onDeleteAccount
}: DaftarAkunTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
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
    const account = accountsData.find(acc => acc.id === id);
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
          <AccountList 
            accounts={accountsData} 
            onReorder={onReorderAccounts}
            onEditAccount={handleEditAccount}
            onDeleteAccount={onDeleteAccount}
          />
        </CardContent>
      </Card>

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
