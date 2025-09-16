'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

import { CreatePerencanaanData } from "@/types/perencanaan";

interface CreatePerencanaanFormData {
  name: string;
  startDate: string;
  endDate: string;
}

interface CreatePerencanaanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePerencanaanData) => void;
  isLoading?: boolean;
}

export function CreatePerencanaanDialog({ open, onOpenChange, onSubmit, isLoading = false }: CreatePerencanaanDialogProps) {
  const [formData, setFormData] = useState<CreatePerencanaanFormData>({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Partial<CreatePerencanaanFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<CreatePerencanaanFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama perencanaan harus diisi';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Tanggal awal harus diisi';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Tanggal akhir harus diisi';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'Tanggal akhir harus lebih besar dari tanggal awal';
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

    const apiData = {
      name: formData.name.trim(),
      start_date: formData.startDate,
      end_date: formData.endDate,
    };


    onSubmit(apiData);
  };

  const handleInputChange = (field: keyof CreatePerencanaanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Perencanaan</DialogTitle>
          <DialogDescription>
            Isi informasi dibawah untuk menambahkan transaksi
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Perencanaan *</Label>
            <Input
              id="name"
              placeholder="Contoh: Penambahan Unit Lamborghini"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Awal *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
