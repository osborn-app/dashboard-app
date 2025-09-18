"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ArusKasAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  onSuccess?: () => void;
  editData?: {
    id: string;
    name: string;
    code: string;
    formula?: string;
  } | null;
  onDataChange?: () => void;
}

export const ArusKasAccountForm = ({ 
  isOpen, 
  onClose, 
  categoryId,
  onSuccess,
  editData,
  onDataChange 
}: ArusKasAccountFormProps) => {
  const { toast } = useToast();
  const isEditMode = !!editData;
  
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    code: editData?.code || '',
    formula: editData?.formula || '',
    category_id: categoryId
  });

  React.useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        code: editData.code,
        formula: editData.formula || '',
        category_id: categoryId
      });
    }
  }, [editData, categoryId]);

  // TODO: Integrate with API hooks when ready
  // const createAccountMutation = usePostPlanningAccounts(formData);
  // const updateAccountMutation = useUpdatePlanningAccount(editData?.id || '');

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Nama akun harus diisi', variant: 'destructive' });
      return;
    }

    if (!formData.code.trim()) {
      toast({ title: 'Error', description: 'Kode akun harus diisi', variant: 'destructive' });
      return;
    }

    try {
      // TODO: Replace with real API calls
      if (isEditMode) {
        // await updateAccountMutation.mutateAsync(formData);
        toast({ title: 'Success', description: 'Akun berhasil diperbarui' });
      } else {
        // await createAccountMutation.mutateAsync();
        toast({ title: 'Success', description: 'Akun berhasil ditambahkan' });
      }
      onClose();
      onSuccess?.();
      onDataChange?.();
    } catch (error) {
      toast({ title: 'Error', description: isEditMode ? 'Gagal memperbarui akun' : 'Gagal menambahkan akun', variant: 'destructive' });
    }
  };

  const handleClose = () => {
    setFormData({ name: '', code: '', formula: '', category_id: categoryId });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Akun' : 'Tambah Akun'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Akun</label>
            <Input 
              placeholder="Masukkan nama akun" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kode Akun</label>
            <Input 
              placeholder="Masukkan kode akun" 
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Formula</label>
            <Input 
              placeholder="Masukkan formula (opsional)" 
              value={formData.formula}
              onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
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
