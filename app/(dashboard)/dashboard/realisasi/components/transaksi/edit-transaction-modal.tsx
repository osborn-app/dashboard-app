"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Edit, Trash2, X } from "lucide-react";

interface TransactionItem {
  id: string;
  date: string;
  category: string;
  transactionName: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  type: 'debit' | 'credit';
  parentTransactionId?: string;
}

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionItem | null;
  onEdit: (id: string, data: Partial<TransactionItem>) => void;
  onDelete: (id: string) => void;
}

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete
}: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    transactionName: '',
    date: '',
    category: '',
    totalAmount: 0
  });

  // Update form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        transactionName: transaction.transactionName || '',
        date: transaction.date || '',
        category: transaction.category || '',
        totalAmount: transaction.debit || transaction.credit || 0
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction) {
      onEdit(transaction.id, formData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (transaction) {
      onDelete(transaction.id);
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Edit Transaksi
                </DialogTitle>
                <p className="text-sm text-blue-100 mt-1">
                  Ubah informasi dibawah untuk merubah detail transaksi
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
            {/* Transaction Info Display */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-3">Informasi Transaksi Saat Ini</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Kode Akun:</span>
                  <p className="font-mono font-medium">{transaction?.accountCode}</p>
                </div>
                <div>
                  <span className="text-gray-600">Nama Akun:</span>
                  <p className="font-medium">{transaction?.accountName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tipe:</span>
                  <p className="font-medium capitalize">{transaction?.type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Jumlah:</span>
                  <p className="font-medium">{formatCurrency(transaction?.debit || transaction?.credit || 0)}</p>
                </div>
              </div>
            </div>

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
                  />
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
                      <SelectItem value="Orderan Sewa - Pendapatan Sewa Fleets">
                        Orderan Sewa - Pendapatan Sewa Fleets
                      </SelectItem>
                      <SelectItem value="Pembayaran Gaji - Beban Operasional">
                        Pembayaran Gaji - Beban Operasional
                      </SelectItem>
                      <SelectItem value="Pembelian ATK - Beban Operasional">
                        Pembelian ATK - Beban Operasional
                      </SelectItem>
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
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus Transaksi</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
