'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useGetPlanningAccounts, useDeletePlanningEntry } from '@/hooks/api/usePerencanaan';
import { Plus, Trash2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RencanaAccount {
  id: string;
  accountName: string;
  account_debit_id: string;
  account_credit_id: string;
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
  planningId?: string;
  entryId?: string | number;
  onDelete?: () => void;
}

export function CreateRencanaDialog({ open, onOpenChange, onSubmit, editingData, planningId, entryId, onDelete }: CreateRencanaDialogProps) {
  const [formData, setFormData] = useState<CreateRencanaFormData>({
    name: '',
    planningDate: '',
    accounts: [
      { id: '1', accountName: '', account_debit_id: '', account_credit_id: '', debit: 0, credit: 0 }
    ]
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateRencanaFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [debitAccountSearch, setDebitAccountSearch] = useState('');
  const [creditAccountSearch, setCreditAccountSearch] = useState('');
  const { toast } = useToast();

  // Fetch accounts data (level 2 only)
  const { data: accountsResponse } = useGetPlanningAccounts({ page: 1, limit: 1000 });
  
  // Delete mutation hook
  const deleteMutation = useDeletePlanningEntry(planningId || '', entryId || '');
  
  const level2Accounts = useMemo(() => {
    if (!accountsResponse?.items) {
      console.log('No accounts response data');
      return [];
    }
    const filtered = accountsResponse.items.filter((account: any) => account.level === 2);
    console.log('Level 2 accounts:', filtered);
    return filtered;
  }, [accountsResponse]);

  // Initialize form data when editing or reset when creating
  React.useEffect(() => {
    console.log('useEffect triggered, editingData:', editingData);
    if (editingData) {
      console.log('Setting form data from editingData:', editingData);
      setFormData(editingData);
    } else {
      // Reset form when creating new
      console.log('Resetting form for new entry');
      setFormData({
        name: '',
        planningDate: '',
        accounts: [{ id: '1', accountName: '', account_debit_id: '', account_credit_id: '', debit: 0, credit: 0 }]
      });
      setErrors({});
    }
  }, [editingData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateRencanaFormData, string>> = {};

    console.log('Validating form data:', formData);

    if (!formData.name.trim()) {
      newErrors.name = 'Nama rencana harus diisi';
    }

    if (!formData.planningDate) {
      newErrors.planningDate = 'Tanggal perencanaan harus diisi';
    }

    // Validate accounts - check if we have at least one complete journal entry
    const hasValidAccounts = formData.accounts.some(account => {
      const isValid = account.account_debit_id && account.account_credit_id && account.debit > 0 && account.credit > 0 && account.debit === account.credit;
      console.log('Account validation:', { account, isValid });
      return isValid;
    });

    console.log('Has valid accounts:', hasValidAccounts);

    if (!hasValidAccounts) {
      newErrors.accounts = 'Pilih akun debit, akun credit, dan isi jumlah yang sama untuk debit & kredit';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted, validating...');
    
    if (!validateForm()) {
      console.log('Validation failed');
      toast({
        title: 'Validation Error',
        description: 'Mohon periksa kembali form yang diisi',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Validation passed, submitting...');

    setIsSubmitting(true);
    
    try {
      console.log('Dialog submitting formData:', formData);
      onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        planningDate: '',
        accounts: [{ id: '1', accountName: '', account_debit_id: '', account_credit_id: '', debit: 0, credit: 0 }]
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

  const handleDelete = async () => {
    console.log('Delete attempt - planningId:', planningId, 'entryId:', entryId);
    
    if (!planningId || !entryId) {
      console.error('Missing IDs - planningId:', planningId, 'entryId:', entryId);
      toast({
        title: 'Error',
        description: 'ID perencanaan atau entri tidak ditemukan',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log('Calling delete API with planningId:', planningId, 'entryId:', entryId);
      await deleteMutation.mutateAsync();
      
      toast({
        title: 'Success',
        description: 'Rencana berhasil dihapus',
      });
      
      // Close dialog and call onDelete callback
      onOpenChange(false);
      if (onDelete) {
        onDelete();
      }
      
    } catch (error) {
      console.error('Error deleting rencana:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus rencana',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
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
      account_debit_id: '',
      account_credit_id: '',
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
    console.log('updateAccount called:', { accountId, field, value });
    setFormData(prev => {
      const updated = {
        ...prev,
        accounts: prev.accounts.map(account =>
          account.id === accountId ? { ...account, [field]: value } : account
        )
      };
      console.log('Form data updated:', updated);
      return updated;
    });
  };



  const totalDebit = formData.accounts.reduce((sum, account) => sum + (account.debit || 0), 0);
  const totalCredit = formData.accounts.reduce((sum, account) => sum + (account.credit || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="bg-blue-600 text-white p-4 -m-6 mb-4">
            {editingData ? 'Edit Rencana' : 'Tambah Rencana'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 -mt-2">
            {editingData ? 'Isi informasi dibawah untuk mengubah rencana' : 'Isi informasi dibawah untuk menambahkan rencana'}
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
                <div className="col-span-3">Akun Debit</div>
                <div className="col-span-3">Akun Credit</div>
                <div className="col-span-2">Debit</div>
                <div className="col-span-2">Kredit</div>
                <div className="col-span-2"></div>
              </div>

              {/* Account Rows */}
              {formData.accounts.map((account, index) => (
                <div key={account.id} className="grid grid-cols-12 gap-4 items-center">
                  {/* Debit Account Dropdown */}
                  <div className="col-span-3">
                    <Select
                      value={account.account_debit_id || ""}
                      onValueChange={(value) => {
                        console.log('Debit account selected:', value);
                        updateAccount(account.id, 'account_debit_id', value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih akun debit" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Cari akun debit..."
                            value={debitAccountSearch}
                            onChange={(e) => setDebitAccountSearch(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <ScrollArea className="max-h-60 overflow-y-auto">
                          {level2Accounts
                            .filter((acc: any) => 
                              acc.name.toLowerCase().includes(debitAccountSearch.toLowerCase()) ||
                              acc.code.toLowerCase().includes(debitAccountSearch.toLowerCase())
                            )
                            .map((acc: any) => (
                              <SelectItem key={acc.id} value={acc.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-mono text-xs">{acc.code}</span>
                                  <span className="text-sm">{acc.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Credit Account Dropdown */}
                  <div className="col-span-3">
                    <Select
                      value={account.account_credit_id || ""}
                      onValueChange={(value) => {
                        console.log('Credit account selected:', value);
                        updateAccount(account.id, 'account_credit_id', value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih akun credit" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Cari akun credit..."
                            value={creditAccountSearch}
                            onChange={(e) => setCreditAccountSearch(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <ScrollArea className="max-h-60 overflow-y-auto">
                          {level2Accounts
                            .filter((acc: any) => 
                              acc.name.toLowerCase().includes(creditAccountSearch.toLowerCase()) ||
                              acc.code.toLowerCase().includes(creditAccountSearch.toLowerCase())
                            )
                            .map((acc: any) => (
                              <SelectItem key={acc.id} value={acc.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-mono text-xs">{acc.code}</span>
                                  <span className="text-sm">{acc.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={account.debit || ''}
                      onChange={(e) => {
                        const debitValue = parseFloat(e.target.value) || 0;
                        updateAccount(account.id, 'debit', debitValue);
                        updateAccount(account.id, 'credit', debitValue); // Auto-sync credit with debit
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={account.credit || ''}
                      onChange={(e) => {
                        const creditValue = parseFloat(e.target.value) || 0;
                        updateAccount(account.id, 'credit', creditValue);
                        updateAccount(account.id, 'debit', creditValue); // Auto-sync debit with credit
                      }}
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
            {editingData && (
            <Button
              type="button"
              variant="outline"
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Telah Terealisasi
            </Button>
            )}
            {editingData && planningId && entryId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </>
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isDeleting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
