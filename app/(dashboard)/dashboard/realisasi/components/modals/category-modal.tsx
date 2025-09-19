"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import SimpleAccountSelect from "../simple-account-select";
import Swal from "sweetalert2";

import {  Account } from "../../types";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<boolean>; // Return boolean for success/failure
  isEditMode: boolean;
  formData: {
    name: string;
    debitAccountId: number | null;
    creditAccountId: number | null;
  };
  onFormChange: (data: Partial<{
    name: string;
    debitAccountId: number | null;
    creditAccountId: number | null;
  }>) => void;
  accounts: Account[];
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  isEditMode,
  formData,
  onFormChange,
  accounts
}: CategoryModalProps) {
  const handleInputChange = (field: string, value: string | number | null) => {
    onFormChange({ [field]: value });
  };

  const handleSave = async () => {
    try {
      const success = await onSave();
      
      if (success) {
        await Swal.fire({
          title: "Berhasil!",
          text: `Kategori ${isEditMode ? "berhasil diupdate" : "berhasil ditambahkan"}`,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#10b981",
          timer: 3000,
          timerProgressBar: true,
          allowOutsideClick: false,
          allowEscapeKey: true,
        });
        onClose();
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: `Gagal ${isEditMode ? "mengupdate" : "menambahkan"} kategori`,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ef4444",
          allowOutsideClick: true,
          allowEscapeKey: true,
        });
      }
    } catch (error) {
      console.error("Error saving category:", error);
      await Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menyimpan kategori",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        allowOutsideClick: true,
        allowEscapeKey: true,
      });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="bg-blue-600 text-white p-6 -m-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full">
              {isEditMode ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {isEditMode ? "Edit Kategori" : "Tambah Kategori"}
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-sm mt-1">
                {isEditMode ? "Ubah informasi kategori yang dipilih" : "Tambah kategori yang ingin ditambahkan"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kategori</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Masukkan nama kategori"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="debit">Pilih Akun Debit</Label>
            <SimpleAccountSelect
              accounts={accounts}
              selectedAccountId={formData.debitAccountId}
              onAccountSelect={(accountId) => handleInputChange("debitAccountId", accountId)}
              placeholder="Pilih akun debit..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="credit">Pilih Akun Kredit</Label>
            <SimpleAccountSelect
              accounts={accounts}
              selectedAccountId={formData.creditAccountId}
              onAccountSelect={(accountId) => handleInputChange("creditAccountId", accountId)}
              placeholder="Pilih akun kredit..."
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {isEditMode ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
