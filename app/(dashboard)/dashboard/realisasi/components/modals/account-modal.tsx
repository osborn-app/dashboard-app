"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccountFormData {
  namaAkun: string;
  kodeAkun: string;
  tipeAkun: string;
  kelompokAkun: string;
  terhubungRekening: string;
  namaBank: string;
  nomorRekening: string;
  saldoAwal: string;
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AccountFormData) => void;
  isEditMode: boolean;
  formData: AccountFormData;
  onFormChange: (data: Partial<AccountFormData>) => void;
}

export default function AccountModal({
  isOpen,
  onClose,
  onSave,
  isEditMode,
  formData,
  onFormChange
}: AccountModalProps) {
  const handleInputChange = (field: keyof AccountFormData, value: string) => {
    onFormChange({ [field]: value });
  };

  const handleRadioChange = (value: string) => {
    onFormChange({ 
      terhubungRekening: value,
      // Clear bank details if switching to "tidak"
      ...(value === "tidak" && {
        namaBank: "",
        nomorRekening: "",
        saldoAwal: ""
      })
    });
  };

  const handleSave = () => {
    onSave(formData);
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
              <Label htmlFor="namaAkun">Nama Akun</Label>
              <Input
                id="namaAkun"
                value={formData.namaAkun}
                onChange={(e) => handleInputChange("namaAkun", e.target.value)}
                placeholder="Masukkan nama akun"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipeAkun">Tipe Akun</Label>
              <Select 
                value={formData.tipeAkun} 
                onValueChange={(value) => handleInputChange("tipeAkun", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="detail">Detail</SelectItem>
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
                    name="terhubungRekening"
                    value="ya"
                    checked={formData.terhubungRekening === "ya"}
                    onChange={(e) => handleRadioChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="ya">Ya</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="tidak"
                    name="terhubungRekening"
                    value="tidak"
                    checked={formData.terhubungRekening === "tidak"}
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
            <div className="space-y-2">
              <Label htmlFor="kodeAkun">Kode Akun</Label>
              <Input
                id="kodeAkun"
                value={formData.kodeAkun}
                onChange={(e) => handleInputChange("kodeAkun", e.target.value)}
                placeholder="Masukkan kode akun"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kelompokAkun">Pilih Kelompok Akun</Label>
              <Select 
                value={formData.kelompokAkun} 
                onValueChange={(value) => handleInputChange("kelompokAkun", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelompok akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harta">Harta</SelectItem>
                  <SelectItem value="kewajiban">Kewajiban</SelectItem>
                  <SelectItem value="modal">Modal</SelectItem>
                  <SelectItem value="pendapatan">Pendapatan</SelectItem>
                  <SelectItem value="beban">Beban</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Bank Account Details - Conditional */}
        {formData.terhubungRekening === "ya" && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900">Detail Rekening Bank</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namaBank">Nama Bank</Label>
                <Input
                  id="namaBank"
                  value={formData.namaBank}
                  onChange={(e) => handleInputChange("namaBank", e.target.value)}
                  placeholder="Masukkan nama bank"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomorRekening">Nomor Rekening</Label>
                  <Input
                    id="nomorRekening"
                    value={formData.nomorRekening}
                    onChange={(e) => handleInputChange("nomorRekening", e.target.value)}
                    placeholder="Masukkan nomor rekening"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="saldoAwal">Saldo Awal</Label>
                  <Input
                    id="saldoAwal"
                    value={formData.saldoAwal}
                    onChange={(e) => handleInputChange("saldoAwal", e.target.value)}
                    placeholder="Masukkan saldo awal"
                    type="number"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
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
