'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

import { Perencanaan } from "@/types/perencanaan";

type PerencanaanItem = Perencanaan;

interface EditPerencanaanFormData {
  name: string;
  start_date: string;
  end_date: string;
}

interface EditPerencanaanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PerencanaanItem;
  onSubmit: (data: Partial<PerencanaanItem>) => void;
}

export function EditPerencanaanDialog({ open, onOpenChange, item, onSubmit }: EditPerencanaanDialogProps) {
  const [formData, setFormData] = useState<EditPerencanaanFormData>({
    name: '',
    start_date: '',
    end_date: '',
  });
  const [errors, setErrors] = useState<Partial<EditPerencanaanFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        start_date: item.start_date || '',
        end_date: item.end_date || '',
      });
    }
  }, [item]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EditPerencanaanFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama perencanaan harus diisi';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Tanggal awal harus diisi';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Tanggal akhir harus diisi';
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'Tanggal akhir harus lebih besar dari tanggal awal';
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
      const apiData = {
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      onSubmit(apiData);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengupdate perencanaan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof EditPerencanaanFormData, value: string) => {
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
          <DialogTitle>Edit Perencanaan</DialogTitle>
          <DialogDescription>
            Edit informasi perencanaan yang sudah ada
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
              <Label htmlFor="start_date">Tanggal Awal *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Tanggal Akhir *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date}</p>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
