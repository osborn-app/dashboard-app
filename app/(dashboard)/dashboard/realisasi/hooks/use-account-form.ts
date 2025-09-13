"use client";

import { useState } from "react";
import { CreateAccountData, AccountType } from "../types";

export interface AccountFormData {
  code: string;
  name: string;
  type: AccountType;
  level: number;
  is_header: boolean;
  sort_order: number;
  parent_id?: number;
  is_connected_to_bank: boolean;
  bank_name?: string;
  bank_account_number?: string;
  initial_balance: number;
  description?: string;
}

const initialFormData: AccountFormData = {
  code: "",
  name: "",
  type: "ASSETS",
  level: 2,
  is_header: false,
  sort_order: 0,
  parent_id: undefined,
  is_connected_to_bank: false,
  bank_name: "",
  bank_account_number: "",
  initial_balance: 0,
  description: ""
};

export function useAccountForm() {
  const [formData, setFormData] = useState<AccountFormData>(initialFormData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);

  const updateFormData = (updates: Partial<AccountFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditMode(false);
    setEditingAccountId(null);
  };

  const setEditMode = (accountId: number, accountData: Partial<AccountFormData>) => {
    setIsEditMode(true);
    setEditingAccountId(accountId);
    setFormData(prev => ({ ...prev, ...accountData }));
  };

  const getFormDataForAPI = (): CreateAccountData => {
    const apiData = {
      code: formData.code,
      name: formData.name,
      type: formData.type,
      level: formData.level,
      is_header: formData.is_header,
      sort_order: formData.sort_order,
      parent_id: formData.parent_id,
      is_connected_to_bank: formData.is_connected_to_bank,
      bank_name: formData.bank_name || undefined,
      bank_account_number: formData.bank_account_number || undefined,
      initial_balance: formData.initial_balance,
      description: formData.description || undefined,
    };
    console.log("Form data for API:", apiData);
    return apiData;
  };

  return {
    formData,
    isEditMode,
    editingAccountId,
    updateFormData,
    resetForm,
    setEditMode,
    getFormDataForAPI
  };
}
