"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Edit, Trash2, X } from "lucide-react";
import Swal from "sweetalert2";

import { FinancialTransaction, TransactionCategory } from "../../types";
import { getFinancialTransactionById, getActiveTransactionCategories } from "@/client/realizationClient";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number | null;
  onEdit: (id: number, data: any) => void;
  onDelete: (id: number) => void;
}

export default function EditTransactionModal({
  isOpen,
  onClose,
  transactionId,
  onEdit,
  onDelete
}: EditTransactionModalProps) {
  const [transaction, setTransaction] = useState<FinancialTransaction | null>(null);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    transaction_date: '',
    category_id: '',
    total_amount: 0,
    notes: ''
  });

  // Fetch transaction data when modal open
  useEffect(() => {
    if (isOpen && transactionId) {
      fetchTransactionData();
    }
  }, [isOpen, transactionId]);

  const fetchTransactionData = async () => {
    if (!transactionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch transaction and categories in parallel
      const [transactionResponse, categoriesResponse] = await Promise.all([
        getFinancialTransactionById(transactionId),
        getActiveTransactionCategories()
      ]);
      
      const transactionData = transactionResponse.data;
      const categoriesData = categoriesResponse.data;
      
      setTransaction(transactionData);
      setCategories(categoriesData);
      
      // Format transaction date for input field (YYYY-MM-DD format)
      const transactionDate = transactionData.transaction_date 
        ? new Date(transactionData.transaction_date).toISOString().split('T')[0]
        : '';
      
      setFormData({
        description: transactionData.description || '',
        transaction_date: transactionDate,
        category_id: transactionData.category_id?.toString() || '',
        total_amount: transactionData.total_amount || 0,
        notes: transactionData.notes || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction data');
      console.error('Error fetching transaction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction?.id) {
      try {
        await onEdit(transaction.id, formData);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Transaksi berhasil diperbarui',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        onClose();
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal memperbarui transaksi',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
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
  
  // Show loading state
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
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
                    Memuat data transaksi...
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
          <div className="p-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Memuat data transaksi...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state
  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    Error
                  </DialogTitle>
                  <p className="text-sm text-red-100 mt-1">
                    Gagal memuat data transaksi
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
          <div className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchTransactionData} variant="outline">
                Coba Lagi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show no data state
  if (!transaction) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
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
                    Tidak ada data transaksi...
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
          <div className="p-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <span>Tidak ada data transaksi yang dipilih</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
                  <span className="text-gray-600">Reference:</span>
                  <p className="font-mono font-medium">{transaction?.reference_number}</p>
                </div>
                <div>
                  <span className="text-gray-600">Kategori:</span>
                  <p className="font-medium">{transaction?.category?.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tanggal:</span>
                  <p className="font-medium">{transaction?.transaction_date}</p>
                </div>
                <div>
                  <span className="text-gray-600">Jumlah:</span>
                  <p className="font-medium">{formatCurrency(transaction?.total_amount || 0)}</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Deskripsi Transaksi
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Masukkan deskripsi transaksi"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transaction_date" className="text-sm font-medium text-gray-700">
                    Tanggal Transaksi
                  </Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
                    Kategori
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({...formData, category_id: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih kategori transaksi" />
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
                  <Label htmlFor="total_amount" className="text-sm font-medium text-gray-700">
                    Total Transaksi
                  </Label>
                  <Input
                    id="total_amount"
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Catatan
              </Label>
              <Input
                id="notes"
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Masukkan catatan (opsional)"
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
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
