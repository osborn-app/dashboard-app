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
import { Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

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
  const [openDebitCombo, setOpenDebitCombo] = useState(false);
  const [openCreditCombo, setOpenCreditCombo] = useState(false);
  const { toast } = useToast();

  // Fetch accounts data (all accounts like table rencana)
  const { data: accountsResponse } = useGetPlanningAccounts({ page: 1, limit: 1000 });
  
  // Delete mutation hook
  const deleteMutation = useDeletePlanningEntry(planningId || '', entryId || '');
  
  // Use all accounts like in table rencana
  const allAccounts = useMemo(() => {
    if (!accountsResponse?.items) {
      return [];
    }
    return accountsResponse.items;
  }, [accountsResponse]);

  // Filtered accounts for debit dropdown
  const filteredDebitAccounts = useMemo(() => {
    const list = allAccounts;
    const q = debitAccountSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((acc: any) =>
      acc.name?.toLowerCase().includes(q) || acc.code?.toLowerCase().includes(q)
    );
  }, [allAccounts, debitAccountSearch]);

  // Filtered accounts for credit dropdown
  const filteredCreditAccounts = useMemo(() => {
    const list = allAccounts;
    const q = creditAccountSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((acc: any) =>
      acc.name?.toLowerCase().includes(q) || acc.code?.toLowerCase().includes(q)
    );
  }, [allAccounts, creditAccountSearch]);

  // Initialize form data when editing or reset when creating
  React.useEffect(() => {
    if (editingData) {
      setFormData(editingData);
    } else {
      // Reset form when creating new
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

    if (!formData.name.trim()) {
      newErrors.name = 'Nama rencana harus diisi';
    }

    if (!formData.planningDate) {
      newErrors.planningDate = 'Tanggal perencanaan harus diisi';
    }

    // Validate accounts - check if we have at least one complete journal entry
    const hasValidAccounts = formData.accounts.some(account => {
      const isValid = account.account_debit_id && account.account_credit_id && account.debit > 0 && account.credit > 0 && account.debit === account.credit;
      return isValid;
    });

    if (!hasValidAccounts) {
      newErrors.accounts = 'Pilih akun debit, akun credit, dan isi jumlah yang sama untuk debit & kredit';
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
    
    if (!planningId || !entryId) {
      toast({
        title: 'Error',
        description: 'ID perencanaan atau entri tidak ditemukan',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    
    try {
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
    setFormData(prev => {
      const updated = {
        ...prev,
        accounts: prev.accounts.map(account =>
          account.id === accountId ? { ...account, [field]: value } : account
        )
      };
      return updated;
    });
  };



  const totalDebit = formData.accounts.reduce((sum, account) => sum + (account.debit || 0), 0);
  const totalCredit = formData.accounts.reduce((sum, account) => sum + (account.credit || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {/* Table Header - Hidden on mobile */}
              <div className="hidden sm:grid grid-cols-12 gap-4 font-medium text-sm">
                <div className="col-span-3">Akun Debit</div>
                <div className="col-span-3">Akun Credit</div>
                <div className="col-span-2">Debit</div>
                <div className="col-span-2">Kredit</div>
                <div className="col-span-2"></div>
              </div>

              {/* Account Rows */}
              {formData.accounts.map((account, index) => (
                <div key={account.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Debit Account Dropdown */}
                  <div className="col-span-1 sm:col-span-3">
                    <Label className="text-xs font-medium text-gray-600 sm:hidden mb-1 block">Akun Debit</Label>
                    <Popover open={openDebitCombo} onOpenChange={setOpenDebitCombo}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          type="button"
                        >
                          {account.account_debit_id ? (
                            (() => {
                              const selected = allAccounts.find((acc: any) => acc.id.toString() === account.account_debit_id);
                              return selected ? (
                                <>
                                  <span className="font-mono text-xs">{selected.code}</span>
                                  <span className="text-sm ml-2">{selected.name}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Pilih akun debit...</span>
                              );
                            })()
                          ) : (
                            <span className="text-muted-foreground">Pilih akun debit...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-80 sm:w-[--radix-popover-trigger-width]">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Cari akun debit..."
                            value={debitAccountSearch}
                            onValueChange={setDebitAccountSearch}
                          />
                          <CommandList className="max-h-60 overflow-y-auto">
                            {filteredDebitAccounts.length === 0 ? (
                              <div className="py-4 text-sm text-muted-foreground text-center">
                                Akun tidak ditemukan
                              </div>
                            ) : (
                              <CommandGroup>
                                {filteredDebitAccounts.map((acc: any) => (
                                  <div
                                    key={acc.id}
                                    className="flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                                    onClick={() => {
                                      updateAccount(account.id, 'account_debit_id', acc.id.toString());
                                      setOpenDebitCombo(false);
                                    }}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      updateAccount(account.id, 'account_debit_id', acc.id.toString());
                                      setOpenDebitCombo(false);
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-mono text-xs">{acc.code}</span>
                                      <span className="text-sm">{acc.name}</span>
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        account.account_debit_id === acc.id.toString()
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </div>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Credit Account Dropdown */}
                  <div className="col-span-1 sm:col-span-3">
                    <Label className="text-xs font-medium text-gray-600 sm:hidden mb-1 block">Akun Credit</Label>
                    <Popover open={openCreditCombo} onOpenChange={setOpenCreditCombo}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          type="button"
                        >
                          {account.account_credit_id ? (
                            (() => {
                              const selected = allAccounts.find((acc: any) => acc.id.toString() === account.account_credit_id);
                              return selected ? (
                                <>
                                  <span className="font-mono text-xs">{selected.code}</span>
                                  <span className="text-sm ml-2">{selected.name}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Pilih akun credit...</span>
                              );
                            })()
                          ) : (
                            <span className="text-muted-foreground">Pilih akun credit...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-80 sm:w-[--radix-popover-trigger-width]">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Cari akun credit..."
                            value={creditAccountSearch}
                            onValueChange={setCreditAccountSearch}
                          />
                          <CommandList className="max-h-60 overflow-y-auto">
                            {filteredCreditAccounts.length === 0 ? (
                              <div className="py-4 text-sm text-muted-foreground text-center">
                                Akun tidak ditemukan
                              </div>
                            ) : (
                              <CommandGroup>
                                {filteredCreditAccounts.map((acc: any) => (
                                  <div
                                    key={acc.id}
                                    className="flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                                    onClick={() => {
                                      updateAccount(account.id, 'account_credit_id', acc.id.toString());
                                      setOpenCreditCombo(false);
                                    }}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      updateAccount(account.id, 'account_credit_id', acc.id.toString());
                                      setOpenCreditCombo(false);
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-mono text-xs">{acc.code}</span>
                                      <span className="text-sm">{acc.name}</span>
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        account.account_credit_id === acc.id.toString()
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </div>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <Label className="text-xs font-medium text-gray-600 sm:hidden mb-1 block">Debit</Label>
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
                  <div className="col-span-1 sm:col-span-2">
                    <Label className="text-xs font-medium text-gray-600 sm:hidden mb-1 block">Kredit</Label>
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
                  <div className="col-span-1 sm:col-span-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-4 border-t">
                <div className="col-span-1 sm:col-span-5"></div>
                <div className="col-span-1 sm:col-span-3">
                  <div className="bg-purple-100 p-2 rounded text-sm">
                    <span className="font-medium">Total Debit : {formatRupiah(totalDebit)}</span>
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-3">
                  <div className="bg-purple-100 p-2 rounded text-sm">
                    <span className="font-medium">Total Kredit : {formatRupiah(totalCredit)}</span>
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-1"></div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
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
