"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";

import { CreateFinancialTransactionData, Account, TransactionCategory } from "../../types";

interface CreateTransactionData {
  transactionName: string;
  date: string;
  category: string;
  totalAmount: number;
  accountCode: string;
  accountName: string;
  type: 'debit' | 'credit';
}

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateFinancialTransactionData) => void;
  accounts?: Account[];
  categories?: TransactionCategory[];
}

export default function CreateTransactionModal({
  isOpen,
  onClose,
  onCreate,
  accounts = [],
  categories = []
}: CreateTransactionModalProps) {
  const [formData, setFormData] = useState<CreateTransactionData>({
    transactionName: '',
    date: '',
    category: '',
    totalAmount: 0,
    accountCode: '',
    accountName: '',
    type: 'debit'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to CreateFinancialTransactionData format
    const transactionData: CreateFinancialTransactionData = {
      reference_number: `MAN-${Date.now()}`,
      transaction_date: formData.date,
      description: formData.transactionName,
      total_amount: formData.totalAmount,
      category_id: 1, // Default category, should be selected from dropdown
      notes: '',
      entries: [
        {
          account_id: parseInt(formData.accountCode),
          entry_type: formData.type.toUpperCase() as 'DEBIT' | 'CREDIT',
          amount: formData.totalAmount,
          description: formData.transactionName
        }
      ],
      source_type: 'manual'
    };
    
    onCreate(transactionData);
    onClose();
    // Reset form
    setFormData({
      transactionName: '',
      date: '',
      category: '',
      totalAmount: 0,
      accountCode: '',
      accountName: '',
      type: 'debit'
    });
  };

  const handleAccountChange = (accountCode: string) => {
    const account = accounts.find(acc => acc.code === accountCode);
    
    setFormData({
      ...formData,
      accountCode,
      accountName: account?.name || ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Tambah Transaksi Baru
                </DialogTitle>
                <p className="text-sm text-green-100 mt-1">
                  Isi informasi dibawah untuk membuat transaksi baru
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionName" className="text-sm font-medium text-gray-700">
                    Nama Transaksi
                  </Label>
                  <Input
                    id="transactionName"
                    type="text"
                    value={formData.transactionName}
                    onChange={(e) => setFormData({...formData, transactionName: e.target.value})}
                    placeholder="Masukkan nama transaksi"
                    className="w-full"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Tanggal Transaksi
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                    Tipe Transaksi
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'debit' | 'credit') => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Kategori
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountCode" className="text-sm font-medium text-gray-700">
                    Kode Akun
                  </Label>
                  <Select
                    value={formData.accountCode}
                    onValueChange={handleAccountChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih akun" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.code}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalAmount" className="text-sm font-medium text-gray-700">
                    Total Transaksi
                  </Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({...formData, totalAmount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    className="w-full"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Account Name Display */}
            {formData.accountName && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Akun yang Dipilih</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Kode:</span>
                    <p className="font-mono font-medium text-blue-900">{formData.accountCode}</p>
                  </div>
                  <div>
                    <span className="text-blue-600">Nama:</span>
                    <p className="font-medium text-blue-900">{formData.accountName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                Buat Transaksi
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}