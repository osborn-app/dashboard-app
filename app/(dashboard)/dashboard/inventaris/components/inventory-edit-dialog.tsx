'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: number;
  assetName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  status: 'pending' | 'verified';
  isInstallment?: boolean;
  installmentAmount?: number;
  installmentEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
  onSubmit: (data: Partial<InventoryItem>) => void;
}

export function InventoryEditDialog({ open, onOpenChange, item, onSubmit }: InventoryEditDialogProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const [errors, setErrors] = useState<Partial<InventoryItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setFormData({
        assetName: item.assetName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        purchaseDate: item.purchaseDate,
        status: item.status,
        isInstallment: item.isInstallment || false,
        installmentAmount: item.installmentAmount || 0,
        installmentEndDate: item.installmentEndDate || '',
      });
    }
  }, [item]);

  const validateForm = (): boolean => {
    const newErrors: Partial<InventoryItem> = {};

    if (!formData.assetName?.trim()) {
      newErrors.assetName = 'Nama aset harus diisi';
    }

    if (formData.quantity !== undefined && formData.quantity <= 0) {
      (newErrors as any).quantity = 'Jumlah harus lebih dari 0';
    }

    if (formData.unitPrice !== undefined && formData.unitPrice < 0) {
      (newErrors as any).unitPrice = 'Harga satuan tidak boleh negatif';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Tanggal pembelian harus diisi';
    }

    // Validate installment fields if isInstallment is true
    if (formData.isInstallment) {
      if (!formData.installmentAmount || formData.installmentAmount <= 0) {
        (newErrors as any).installmentAmount = 'Nominal cicilan harus lebih dari 0';
      }
      if (!formData.installmentEndDate) {
        (newErrors as any).installmentEndDate = 'Tanggal berakhir cicilan harus diisi';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Mohon periksa kembali form yang diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate total price if quantity or unitPrice changed
      let updatedData = { ...formData };
      
      if (formData.quantity !== undefined || formData.unitPrice !== undefined) {
        const newQuantity = formData.quantity ?? item.quantity;
        const newUnitPrice = formData.unitPrice ?? item.unitPrice;
        updatedData.totalPrice = newQuantity * newUnitPrice;
      }

      onSubmit(updatedData);
      
      toast({
        title: 'Success',
        description: 'Inventaris berhasil diupdate',
      });
      
      onOpenChange(false);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengupdate inventaris',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof InventoryItem, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle number input changes properly
  const handleNumberInputChange = (field: 'quantity' | 'unitPrice' | 'installmentAmount', value: string) => {
    // Allow empty string for better UX
    if (value === '') {
      setFormData(prev => ({ ...prev, [field]: '' }));
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setFormData(prev => ({ ...prev, [field]: numValue }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const calculateTotalPrice = () => {
    const quantity = formData.quantity ?? item.quantity;
    const unitPrice = formData.unitPrice ?? item.unitPrice;
    return quantity * unitPrice;
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Inventaris</DialogTitle>
          <DialogDescription>
            Update informasi inventaris: {item.assetName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assetName">Nama Aset *</Label>
            <Input
              id="assetName"
              placeholder="Contoh: iPhone 17 Pro Max"
              value={formData.assetName || ''}
              onChange={(e) => handleInputChange('assetName', e.target.value)}
              className={errors.assetName ? 'border-red-500' : ''}
            />
            {errors.assetName && (
              <p className="text-sm text-red-500">{errors.assetName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity || ''}
                onChange={(e) => handleNumberInputChange('quantity', e.target.value)}
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Harga Satuan (IDR) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                placeholder="0"
                value={formData.unitPrice || ''}
                onChange={(e) => handleNumberInputChange('unitPrice', e.target.value)}
                className={errors.unitPrice ? 'border-red-500' : ''}
              />
              {errors.unitPrice && (
                <p className="text-sm text-red-500">{errors.unitPrice}</p>
              )}
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Total Harga:</div>
            <div className="text-lg font-semibold">
              {formatCurrency(calculateTotalPrice())}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formData.quantity !== item.quantity || formData.unitPrice !== item.unitPrice 
                ? 'Harga akan diupdate otomatis' 
                : 'Harga tidak berubah'
              }
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Tanggal Pembelian *</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate || ''}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                className={errors.purchaseDate ? 'border-red-500' : ''}
              />
              {errors.purchaseDate && (
                <p className="text-sm text-red-500">{errors.purchaseDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || item.status}
                onValueChange={(value: 'pending' | 'verified') => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Installment Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isInstallment"
                checked={formData.isInstallment || false}
                onCheckedChange={(checked) => handleInputChange('isInstallment', Boolean(checked))}
              />
              <Label htmlFor="isInstallment" className="text-sm font-medium">
                Apakah ini pembelian cicilan?
              </Label>
            </div>

            {(formData.isInstallment) && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="installmentAmount">Nominal Cicilan per Bulan</Label>
                  <Input
                    id="installmentAmount"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.installmentAmount || ''}
                    onChange={(e) => handleNumberInputChange('installmentAmount', e.target.value)}
                    className={errors.installmentAmount ? 'border-red-500' : ''}
                  />
                  {errors.installmentAmount && (
                    <p className="text-sm text-red-500">{errors.installmentAmount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installmentEndDate">Tanggal Berakhir Cicilan *</Label>
                  <Input
                    id="installmentEndDate"
                    type="date"
                    value={formData.installmentEndDate || ''}
                    onChange={(e) => handleInputChange('installmentEndDate', e.target.value)}
                    className={errors.installmentEndDate ? 'border-red-500' : ''}
                  />
                  {errors.installmentEndDate && (
                    <p className="text-sm text-red-500">{errors.installmentEndDate}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Update Inventaris'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
