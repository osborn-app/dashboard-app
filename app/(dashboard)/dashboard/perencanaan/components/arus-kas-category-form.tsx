"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePostPlanningCategories, useUpdatePlanningCategory } from '@/hooks/api/usePerencanaan';

interface ArusKasCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  planningId: string | number;
  onSuccess?: () => void;
  editData?: {
    id: string;
    name: string;
    description?: string;
    type: string;
  } | null;
  onDataChange?: () => void;
}

export const ArusKasCategoryForm = ({ 
  isOpen, 
  onClose, 
  planningId,
  onSuccess,
  editData,
  onDataChange 
}: ArusKasCategoryFormProps) => {
  const { toast } = useToast();
  const isEditMode = !!editData;
  
  const [formData, setFormData] = useState({
    planning_id: planningId,
    name: editData?.name || '',
    description: editData?.description || '',
    type: 'LAINNYA',
    sort_order: 1,
    template_id: 'template_arus_kas'
  });

  React.useEffect(() => {
    if (editData) {
      setFormData({
        planning_id: planningId,
        name: editData.name || '',
        description: editData.description || '',
        type: 'LAINNYA',
        sort_order: 1,
        template_id: 'template_arus_kas'
      });
    }
  }, [editData, planningId]);

  const createCategoryMutation = usePostPlanningCategories(planningId, formData);
  const updateCategoryMutation = useUpdatePlanningCategory(editData?.id || 0);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Nama kategori harus diisi', variant: 'destructive' });
      return;
    }

    try {
      if (isEditMode) {
        await updateCategoryMutation.mutateAsync(formData);
        toast({ title: 'Success', description: 'Kategori berhasil diperbarui' });
      } else {
        await createCategoryMutation.mutateAsync();
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
    setFormData({ 
      planning_id: planningId,
      name: '', 
      description: '', 
      type: 'LAINNYA', 
      sort_order: 1,
      template_id: 'template_arus_kas'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Kategori' : 'Tambah Kategori ARUS KAS'}</DialogTitle>
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
