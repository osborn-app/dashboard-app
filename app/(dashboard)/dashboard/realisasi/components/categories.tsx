"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { TransactionCategory, CreateTransactionCategoryData, Account } from "../types";

interface CategoriesProps {
  categories: TransactionCategory[];
  accounts?: Account[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreateCategory?: (category: CreateTransactionCategoryData) => void;
  onUpdateCategory?: (id: number, category: CreateTransactionCategoryData) => void;
  onDeleteCategory?: (id: number) => void;
}

export default function Categories({ 
  categories, 
  accounts = [],
  searchQuery = "",
  onSearchChange,
  onCreateCategory, 
  onUpdateCategory, 
  onDeleteCategory 
}: CategoriesProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    debitAccountId: 0,
    creditAccountId: 0
  });
  const [debitPopoverOpen, setDebitPopoverOpen] = useState(false);
  const [creditPopoverOpen, setCreditPopoverOpen] = useState(false);

  // Use API search instead of local filtering
  const filteredCategories = categories;

  const handleAddClick = () => {
    setFormData({ name: "", debitAccountId: 0, creditAccountId: 0 });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (category: TransactionCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      debitAccountId: category.debit_account_id,
      creditAccountId: category.credit_account_id
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = () => {
    if (formData.name && formData.debitAccountId && formData.creditAccountId) {
      const categoryData = {
        name: formData.name,
        debit_account_id: formData.debitAccountId,
        credit_account_id: formData.creditAccountId
      };
      
      if (isEditModalOpen && editingCategory) {
        onUpdateCategory?.(editingCategory.id, categoryData);
      } else {
        onCreateCategory?.(categoryData);
      }
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", debitAccountId: 0, creditAccountId: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Search and Add Button */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari Kategori........"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Kategori</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Akun Debit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Akun Kredit</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Tidak ada kategori yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{category.name}</td>
                      <td className="py-3 px-4 text-gray-900">{category.debit_account?.name || "N/A"}</td>
                      <td className="py-3 px-4 text-gray-900">{category.credit_account?.name || "N/A"}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(category)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Edit Kategori"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteCategory?.(category.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    Tambah Kategori
                  </DialogTitle>
                  <p className="text-sm text-blue-100 mt-1">
                    Tambah Kategori yang ingin ditambahkan
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                placeholder="Masukkan nama kategori"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="debit">Pilih Debit</Label>
              <Popover open={debitPopoverOpen} onOpenChange={setDebitPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={debitPopoverOpen}
                    className="w-full justify-between"
                  >
                    {formData.debitAccountId 
                      ? accounts.find(account => account.id === formData.debitAccountId)?.code + " - " + accounts.find(account => account.id === formData.debitAccountId)?.name
                      : "Pilih akun debit..."
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Cari akun debit..." />
                    <CommandList>
                      <CommandEmpty>Akun tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {accounts.map((account) => (
                          <CommandItem
                            key={account.id}
                            value={`${account.code} ${account.name}`}
                            onSelect={() => {
                              setFormData({ ...formData, debitAccountId: account.id });
                              setDebitPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.debitAccountId === account.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {account.code} - {account.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="credit">Pilih Kredit</Label>
              <Popover open={creditPopoverOpen} onOpenChange={setCreditPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={creditPopoverOpen}
                    className="w-full justify-between"
                  >
                    {formData.creditAccountId 
                      ? accounts.find(account => account.id === formData.creditAccountId)?.code + " - " + accounts.find(account => account.id === formData.creditAccountId)?.name
                      : "Pilih akun kredit..."
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Cari akun kredit..." />
                    <CommandList>
                      <CommandEmpty>Akun tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {accounts.map((account) => (
                          <CommandItem
                            key={account.id}
                            value={`${account.code} ${account.name}`}
                            onSelect={() => {
                              setFormData({ ...formData, creditAccountId: account.id });
                              setCreditPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.creditAccountId === account.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {account.code} - {account.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-gray-50">
            <Button variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    Edit Kategori
                  </DialogTitle>
                  <p className="text-sm text-blue-100 mt-1">
                    Ubah informasi kategori yang dipilih
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Kategori</Label>
              <Input
                id="edit-name"
                placeholder="Masukkan nama kategori"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-debit">Pilih Debit</Label>
              <Select value={formData.debitAccountId.toString()} onValueChange={(value) => setFormData({ ...formData, debitAccountId: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun debit" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-credit">Pilih Kredit</Label>
              <Select value={formData.creditAccountId.toString()} onValueChange={(value) => setFormData({ ...formData, creditAccountId: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun kredit" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-gray-50">
            <Button variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              Simpan Perubahan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
