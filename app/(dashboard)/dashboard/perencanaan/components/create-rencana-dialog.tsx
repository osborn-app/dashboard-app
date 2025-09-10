'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface RencanaAccount {
  id: string;
  accountName: string;
  debit: number;
  credit: number;
}

interface CreateRencanaFormData {
  name: string;
  planningDate: string;
  accounts: RencanaAccount[];
}

interface CreateRencanaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRencanaFormData) => void;
  editingData?: CreateRencanaFormData | null;
}

export function CreateRencanaDialog({ open, onOpenChange, onSubmit, editingData }: CreateRencanaDialogProps) {
  const [formData, setFormData] = useState<CreateRencanaFormData>({
    name: '',
    planningDate: '',
    accounts: [
      { id: '1', accountName: '', debit: 0, credit: 0 }
    ]
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateRencanaFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form data when editing
  useState(() => {
    if (editingData) {
      setFormData(editingData);
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateRencanaFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama rencana harus diisi';
    }

    if (!formData.planningDate) {
      newErrors.planningDate = 'Tanggal perencanaan harus diisi';
    }

    // Validate accounts
    const hasValidAccounts = formData.accounts.some(account => 
      account.accountName.trim() && (account.debit > 0 || account.credit > 0)
    );

    if (!hasValidAccounts) {
      newErrors.accounts = 'Minimal satu akun harus diisi';
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
      onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        planningDate: '',
        accounts: [{ id: '1', accountName: '', debit: 0, credit: 0 }]
      });
      setErrors({});
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan rencana',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateRencanaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addAccount = () => {
    const newAccount: RencanaAccount = {
      id: Date.now().toString(),
      accountName: '',
      debit: 0,
      credit: 0
    };
    setFormData(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccount]
    }));
  };

  const removeAccount = (accountId: string) => {
    if (formData.accounts.length > 1) {
      setFormData(prev => ({
        ...prev,
        accounts: prev.accounts.filter(account => account.id !== accountId)
      }));
    }
  };

  const updateAccount = (accountId: string, field: keyof RencanaAccount, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      accounts: prev.accounts.map(account =>
        account.id === accountId ? { ...account, [field]: value } : account
      )
    }));
  };

  const totalDebit = formData.accounts.reduce((sum, account) => sum + (account.debit || 0), 0);
  const totalCredit = formData.accounts.reduce((sum, account) => sum + (account.credit || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="bg-blue-600 text-white p-4 -m-6 mb-4">
            {editingData ? 'Edit Rencana Anggaran' : 'Tambah Rencana Anggaran'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 -mt-2">
            {editingData ? 'Isi informasi dibawah untuk mengubah rencana anggaran' : 'Isi informasi dibawah untuk menambahkan rencana anggaran'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                placeholder="Masukkan nama rencana"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="planningDate">Tanggal Perencanaan</Label>
              <Input
                id="planningDate"
                type="date"
                value={formData.planningDate}
                onChange={(e) => handleInputChange('planningDate', e.target.value)}
                className={errors.planningDate ? 'border-red-500' : ''}
              />
              {errors.planningDate && (
                <p className="text-sm text-red-500">{errors.planningDate}</p>
              )}
            </div>
          </div>

          {/* Jurnal Umum Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jurnal Umum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 font-medium text-sm">
                <div className="col-span-5">Nama Akun</div>
                <div className="col-span-3">Debit</div>
                <div className="col-span-3">Kredit</div>
                <div className="col-span-1">Aksi</div>
              </div>

              {/* Account Rows */}
              {formData.accounts.map((account, index) => (
                <div key={account.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <Input
                      placeholder="Nama akun"
                      value={account.accountName}
                      onChange={(e) => updateAccount(account.id, 'accountName', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="0"
                      value={account.debit || ''}
                      onChange={(e) => updateAccount(account.id, 'debit', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="0"
                      value={account.credit || ''}
                      onChange={(e) => updateAccount(account.id, 'credit', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1">
                    {formData.accounts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAccount(account.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Account Button */}
              <Button
                type="button"
                variant="outline"
                onClick={addAccount}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Akun
              </Button>

              {/* Totals */}
              <div className="grid grid-cols-12 gap-4 pt-4 border-t">
                <div className="col-span-5"></div>
                <div className="col-span-3">
                  <div className="bg-purple-100 p-2 rounded text-sm">
                    <span className="font-medium">Total Debit : {formatRupiah(totalDebit)}</span>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="bg-purple-100 p-2 rounded text-sm">
                    <span className="font-medium">Total Kredit : {formatRupiah(totalCredit)}</span>
                  </div>
                </div>
                <div className="col-span-1"></div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Telah Terealisasi
            </Button>
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
