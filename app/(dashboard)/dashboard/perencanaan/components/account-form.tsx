"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useToast } from "@/hooks/use-toast";
import { useAssignAccountsToCategory, useGetPlanningAccounts } from "@/hooks/api/usePerencanaan";

// ⬇️ NEW: Combobox building blocks
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  accountId: z.string().min(1, "Akun wajib dipilih"),
});

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  planningId: string | number;
  categoryType?: 'PENDAPATAN' | 'BEBAN'; // Tambahkan parameter untuk filter type
  onSuccess?: () => void;
}

export function AccountForm({
  isOpen,
  onClose,
  categoryId,
  planningId,
  categoryType,
  onSuccess,
}: AccountFormProps) {
  const [loading, setLoading] = useState(false);
  const [openCombo, setOpenCombo] = useState(false);
  const [search, setSearch] = useState("");

  const { toast } = useToast();
  const assignAccountsMutation = useAssignAccountsToCategory(planningId, categoryId);

  // Get all planning accounts (fetch all data, filter client-side)
  const { data: accountsData, isLoading: isLoadingAccounts } = useGetPlanningAccounts({
    page: 1,
    limit: 1000,
  });

  // Client-side filter berdasarkan type dan search
  const items = useMemo(() => {
    let list = accountsData?.items ?? [];
    
    // Filter berdasarkan categoryType (REVENUE untuk PENDAPATAN, EXPENSE untuk BEBAN)
    if (categoryType) {
      const accountType = categoryType === 'PENDAPATAN' ? 'REVENUE' : 'EXPENSE';
      list = list.filter((account: any) => account.type === accountType);
    }
    
    // Filter berdasarkan search query
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a: any) =>
          a.name?.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q)
      );
    }
    
    return list;
  }, [accountsData?.items, search, categoryType]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await assignAccountsMutation.mutateAsync({
        account_ids: [parseInt(values.accountId, 10)],
      });
      
      toast({
        title: "Success",
        description: "Akun berhasil ditambahkan ke kategori",
      });
      
      onSuccess?.();
      handleClose(); // pastikan reset state
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Gagal menambahkan akun",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSearch("");
    setOpenCombo(false);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Jangan reset ketika open = true (dibuka). Reset hanya saat ditutup.
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Akun ke Kategori</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* ⬇️ REPLACED: Select -> Combobox */}
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => {
                // untuk menampilkan label terpilih
                const selected = (accountsData?.items ?? []).find(
                  (a: any) => String(a.id) === String(field.value)
                );

                return (
                  <FormItem className="flex flex-col">
                  <FormLabel>Pilih Akun</FormLabel>
                    <Popover open={openCombo} onOpenChange={setOpenCombo}>
                      <PopoverTrigger asChild>
                    <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                            type="button"
                          >
                            {selected ? (
                              <>
                                {selected.code} - {selected.name}
                              </>
                            ) : (
                              <span className="text-muted-foreground">
                                Pilih akun…
                              </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                    </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                        <Command shouldFilter={false}>
                          {/* built-in search bar (beneran bisa diketik) */}
                          <CommandInput
                            placeholder="Cari akun…"
                            value={search}
                            onValueChange={setSearch}
                          />
                           <CommandList className="max-h-60 overflow-y-auto">
                             {isLoadingAccounts ? (
                               <div className="py-4 text-sm text-muted-foreground text-center">
                                 Loading…
                      </div>
                             ) : items.length === 0 ? (
                               <div className="py-4 text-sm text-muted-foreground text-center">
                                 Akun tidak ditemukan
                          </div>
                             ) : (
                               <CommandGroup>
                                 {items.map((account: any) => (
                                   <div
                                     key={account.id}
                                     className="flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                                     onClick={() => {
                                       field.onChange(String(account.id));
                                       setOpenCombo(false);
                                     }}
                                     onMouseDown={(e) => {
                                       e.preventDefault();
                                       field.onChange(String(account.id));
                                       setOpenCombo(false);
                                     }}
                                   >
                                <div className="flex flex-col">
                                       <span className="font-medium">
                                         {account.code} - {account.name}
                                       </span>
                                  {account.description && (
                                    <span className="text-sm text-muted-foreground">
                                      {account.description}
                                    </span>
                                  )}
                                </div>
                                     <Check
                                       className={cn(
                                         "ml-auto h-4 w-4",
                                         String(field.value) === String(account.id)
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
                  <FormMessage />
                </FormItem>
                );
              }}
            />
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" disabled={loading || isLoadingAccounts}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

