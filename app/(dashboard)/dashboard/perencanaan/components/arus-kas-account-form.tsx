"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useGetPlanningAccounts } from '@/hooks/api/usePerencanaan';

const formSchema = z.object({
  accountId: z.string().min(1, 'Akun wajib dipilih'),
});

interface ArusKasAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  onSuccess?: () => void;
}

export function ArusKasAccountForm({ isOpen, onClose, categoryId, onSuccess }: ArusKasAccountFormProps) {
  const [loading, setLoading] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const { toast } = useToast();
  
  // Get all planning accounts for dropdown
  const { data: accountsData, isLoading: isLoadingAccounts } = useGetPlanningAccounts({
    search: accountSearch,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // TODO: Implement API call untuk assign account ke arus kas category
      // await assignAccountsMutation.mutateAsync({
      //   account_ids: [parseInt(values.accountId)]
      // });
      
      toast({
        title: 'Success',
        description: 'Akun berhasil ditambahkan ke kategori arus kas',
      });
      
      onSuccess?.();
      onClose();
      form.reset();
      setAccountSearch('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Gagal menambahkan akun',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setAccountSearch('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Akun ke Kategori Arus Kas</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Akun</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih akun..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Cari akun..."
                          value={accountSearch}
                          onChange={(e) => setAccountSearch(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {isLoadingAccounts ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Loading...
                          </div>
                        ) : accountsData?.items?.length > 0 ? (
                          accountsData.items
                            .filter((account: any) =>
                              account.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
                              account.code.toLowerCase().includes(accountSearch.toLowerCase())
                            )
                            .map((account: any) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{account.code} - {account.name}</span>
                                  {account.description && (
                                    <span className="text-sm text-muted-foreground">
                                      {account.description}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Akun tidak ditemukan
                          </div>
                        )}
                        {accountsData?.items?.filter((account: any) =>
                          account.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
                          account.code.toLowerCase().includes(accountSearch.toLowerCase())
                        )?.length === 0 && accountsData?.items?.length > 0 && (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Akun tidak ditemukan
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" disabled={loading || isLoadingAccounts}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}