"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { AccountFormData } from "../../hooks/use-account-form";
import { Account } from "../../types";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isEditMode: boolean;
  formData: AccountFormData;
  onFormChange: (data: Partial<AccountFormData>) => void;
  headerAccounts?: Account[];
  onSuccess?: () => void;
}

export default function AccountModal({
  isOpen,
  onClose,
  onSave,
  isEditMode,
  formData,
  onFormChange,
  headerAccounts = [],
  onSuccess
}: AccountModalProps) {
  const handleInputChange = (field: keyof AccountFormData, value: string | number) => {
    onFormChange({ [field]: value } as Partial<AccountFormData>);
  };

  const handleRadioChange = (value: string) => {
    onFormChange({ 
      is_connected_to_bank: value === "ya",
      // Clear bank details if switching to "tidak"
      ...(value === "tidak" && {
        bank_name: "",
        bank_account_number: "",
        initial_balance: 0
      })
    } as Partial<AccountFormData>);
  };

  const handleHeaderChange = (value: string) => {
    const isHeader = value === "header";
    onFormChange({
      is_header: isHeader,
      level: isHeader ? 1 : 2,
      parent_id: isHeader ? undefined : (value === "none" ? undefined : parseInt(value))
    } as Partial<AccountFormData>);
  };

  const handleSave = () => {
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="bg-blue-600 text-white p-6 -m-6 mb-6">
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? "Edit Akun" : "Tambah Akun"}
          </DialogTitle>
          <p className="text-blue-100 text-sm mt-1">
            Isi Informasi dibawah untuk {isEditMode ? "mengedit" : "menambahkan"} akun
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Akun</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Masukkan nama akun"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Kode Akun</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="Masukkan kode akun"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Akun</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSETS">ASSETS</SelectItem>
                  <SelectItem value="LIABILITIES">LIABILITIES</SelectItem>
                  <SelectItem value="EQUITY">EQUITY</SelectItem>
                  <SelectItem value="REVENUE">REVENUE</SelectItem>
                  <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jenis Akun</Label>
              <Select 
                value={formData.is_header ? "header" : (formData.parent_id ? formData.parent_id.toString() : "none")}
                onValueChange={handleHeaderChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header Account</SelectItem>
                  <SelectItem value="none">Detail Account (Tanpa Parent)</SelectItem>
                  {headerAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      Detail Account - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Terhubung dengan Akun Rekening?</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="ya"
                    name="is_connected_to_bank"
                    value="ya"
                    checked={formData.is_connected_to_bank === true}
                    onChange={(e) => handleRadioChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="ya">Ya</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="tidak"
                    name="is_connected_to_bank"
                    value="tidak"
                    checked={formData.is_connected_to_bank === false}
                    onChange={(e) => handleRadioChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="tidak">Tidak</Label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            {/* Bank Information - Only show if connected to bank */}
            {formData.is_connected_to_bank && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Nama Bank</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name || ""}
                    onChange={(e) => handleInputChange("bank_name", e.target.value)}
                    placeholder="Masukkan nama bank"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Nomor Rekening</Label>
                  <Input
                    id="bank_account_number"
                    value={formData.bank_account_number || ""}
                    onChange={(e) => handleInputChange("bank_account_number", e.target.value)}
                    placeholder="Masukkan nomor rekening"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="initial_balance">Saldo Awal</Label>
                  <Input
                    id="initial_balance"
                    type="number"
                    value={formData.initial_balance}
                    onChange={(e) => handleInputChange("initial_balance", parseFloat(e.target.value) || 0)}
                    placeholder="Masukkan saldo awal"
                  />
                </div>
              </>
            )}
            
            {/* Description field */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Masukkan deskripsi (opsional)"
              />
            </div>
          </div>
        </div>
        
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
