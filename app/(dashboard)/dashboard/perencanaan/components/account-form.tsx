"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  onSuccess?: () => void;
}

export const AccountForm = ({ 
  isOpen, 
  onClose, 
  categoryId,
  onSuccess 
}: AccountFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category_id: categoryId || ''
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Nama akun harus diisi',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.code.trim()) {
      toast({
        title: 'Error',
        description: 'Kode akun harus diisi',
        variant: 'destructive',
      });
      return;
    }

    try {
      // TODO: Implement API call untuk create account
      // await createAccountMutation.mutateAsync();
      
      toast({
        title: 'Success',
        description: 'Akun berhasil ditambahkan',
      });
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        category_id: categoryId || ''
      });
      
      onClose();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menambahkan akun',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      category_id: categoryId || ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Akun</DialogTitle>
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
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
