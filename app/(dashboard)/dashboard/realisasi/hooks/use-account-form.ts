"use client";

import { useState } from "react";

export interface AccountFormData {
  namaAkun: string;
  kodeAkun: string;
  tipeAkun: string;
  kelompokAkun: string;
  terhubungRekening: string;
  namaBank: string;
  nomorRekening: string;
  saldoAwal: string;
}

const initialFormData: AccountFormData = {
  namaAkun: "",
  kodeAkun: "",
  tipeAkun: "",
  kelompokAkun: "",
  terhubungRekening: "tidak",
  namaBank: "",
  nomorRekening: "",
  saldoAwal: ""
};

export function useAccountForm() {
  const [formData, setFormData] = useState<AccountFormData>(initialFormData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const updateFormData = (updates: Partial<AccountFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditMode(false);
    setEditingAccountId(null);
  };

  const setEditMode = (accountId: string, accountData: Partial<AccountFormData>) => {
    setIsEditMode(true);
    setEditingAccountId(accountId);
    setFormData(prev => ({ ...prev, ...accountData }));
  };

  return {
    formData,
    isEditMode,
    editingAccountId,
    updateFormData,
    resetForm,
    setEditMode
  };
}
