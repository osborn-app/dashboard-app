"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ArusKasCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  categoryType: 'OPERASI' | 'INVESTASI' | 'PENDANAAN';
  onSuccess?: () => void;
  editData?: {
    id: string;
    name: string;
    description: string;
    type: string;
  } | null;
  onDataChange?: () => void;
}

export const ArusKasCategoryForm = ({ 
  isOpen, 
  onClose, 
  categoryType, 
  onSuccess,
  editData,
  onDataChange 
}: ArusKasCategoryFormProps) => {
  const { toast } = useToast();
  const isEditMode = !!editData;
  
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    description: editData?.description || '',
    type: editData?.type || categoryType,
    sort_order: 1
  });

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

  // TODO: Integrate with API hooks when ready
  // const createCategoryMutation = usePostPlanningCategories(formData);
  // const updateCategoryMutation = useUpdatePlanningCategory(editData?.id || '');

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Nama kategori harus diisi', variant: 'destructive' });
      return;
    }

    try {
      // TODO: Replace with real API calls
      if (isEditMode) {
        // await updateCategoryMutation.mutateAsync(formData);
        toast({ title: 'Success', description: 'Kategori berhasil diperbarui' });
      } else {
        // await createCategoryMutation.mutateAsync();
        toast({ title: 'Success', description: 'Kategori berhasil ditambahkan' });
      }
      onClose();
      onSuccess?.();
      onDataChange?.();
    } catch (error) {
      toast({ title: 'Error', description: isEditMode ? 'Gagal memperbarui kategori' : 'Gagal menambahkan kategori', variant: 'destructive' });
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', type: categoryType, sort_order: 1 });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Kategori' : `Tambah Kategori ${categoryType}`}</DialogTitle>
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
            <Button variant="outline" onClick={handleClose}>Batal</Button>
            <Button onClick={handleSubmit}>
              {isEditMode ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
