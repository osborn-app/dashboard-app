'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CreateInventoryData {
  assetName: string;
  quantity: number;
  unitPrice: number;
  purchaseDate: string;
  status: 'pending' | 'verified';
}

interface CreateInventoryFormData {
  assetName: string;
  quantity: number;
  unitPrice: number;
  purchaseDate: string;
  status: 'pending' | 'verified';
}

interface CreateInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateInventoryData) => void;
}

export function CreateInventoryDialog({ open, onOpenChange, onSubmit }: CreateInventoryDialogProps) {
  const [formData, setFormData] = useState<CreateInventoryFormData>({
    assetName: '',
    quantity: 1,
    unitPrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'pending',
  });
  const [errors, setErrors] = useState<Partial<CreateInventoryFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateInventoryFormData> = {};

    if (!formData.assetName.trim()) {
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
      // Calculate total price
      const totalPrice = formData.quantity * formData.unitPrice;
      
      // Prepare data for API call
      const apiData = {
        assetName: formData.assetName.trim(),
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        purchaseDate: formData.purchaseDate,
        status: formData.status,
      };

      // Call the onSubmit function (which will handle the API call)
      onSubmit(apiData);

      // Reset form
      setFormData({
        assetName: '',
        quantity: 1,
        unitPrice: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      });
      setErrors({});
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat membuat inventaris',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateInventoryFormData, value: string | number) => {
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
  const handleNumberInputChange = (field: 'quantity' | 'unitPrice', value: string) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Inventaris Baru</DialogTitle>
          <DialogDescription>
            Isi informasi detail inventaris yang akan ditambahkan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assetName">Nama Aset *</Label>
            <Input
              id="assetName"
              placeholder="Contoh: iPhone 17 Pro Max"
              value={formData.assetName}
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
                value={formData.quantity}
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
                value={formData.unitPrice}
                onChange={(e) => handleNumberInputChange('unitPrice', e.target.value)}
                className={errors.unitPrice ? 'border-red-500' : ''}
              />
              {errors.unitPrice && (
                <p className="text-sm text-red-500">{errors.unitPrice}</p>
              )}
            </div>
          </div>

          {formData.quantity > 0 && formData.unitPrice > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Total Harga:</div>
              <div className="text-lg font-semibold">
                {formatCurrency(formData.quantity * formData.unitPrice)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Tanggal Pembelian *</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
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
                value={formData.status}
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Inventaris'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
