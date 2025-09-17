"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePostPlanningCategories, useUpdatePlanningCategory } from '@/hooks/api/usePerencanaan';
import { useToast } from '@/hooks/use-toast';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  categoryType: 'AKTIVA' | 'PASIVA';
  onSuccess?: () => void;
  editData?: {
    id: string;
    name: string;
    description: string;
    type: string;
  } | null;
  onDataChange?: () => void;
}

export const CategoryForm = ({ 
  isOpen, 
  onClose, 
  categoryType, 
  onSuccess,
  editData,
  onDataChange 
}: CategoryFormProps) => {
  const { toast } = useToast();
  const isEditMode = !!editData;
  
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    description: editData?.description || '',
    type: editData?.type || categoryType,
    sort_order: 1
  });

  // Update form data when editData changes
  React.useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        description: editData.description,
        type: editData.type,
        sort_order: 1
      });
    }
  }, [editData]);

  const createCategoryMutation = usePostPlanningCategories(formData);
  const updateCategoryMutation = useUpdatePlanningCategory(editData?.id || '');

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Nama kategori harus diisi',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditMode) {
        await updateCategoryMutation.mutateAsync(formData);
        toast({
          title: 'Success',
          description: 'Kategori berhasil diperbarui',
        });
      } else {
        await createCategoryMutation.mutateAsync();
        toast({
          title: 'Success',
          description: 'Kategori berhasil ditambahkan',
        });
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: categoryType,
        sort_order: 1
      });
      
      onClose();
      onSuccess?.();
      onDataChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: isEditMode ? 'Gagal memperbarui kategori' : 'Gagal menambahkan kategori',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      type: categoryType,
      sort_order: 1
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Kategori' : `Tambah Kategori ${categoryType}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Kategori</label>
            <Input 
              placeholder="Masukkan nama kategori" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isEditMode ? updateCategoryMutation.isPending : createCategoryMutation.isPending}
            >
              {isEditMode 
                ? (updateCategoryMutation.isPending ? 'Memperbarui...' : 'Perbarui')
                : (createCategoryMutation.isPending ? 'Menyimpan...' : 'Simpan')
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
