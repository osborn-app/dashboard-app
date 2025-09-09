"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CategoryItem {
  id: string;
  name: string;
  debitAccount: string;
  creditAccount: string;
}

interface CategoriesProps {
  categories: CategoryItem[];
  onAddCategory?: (category: Omit<CategoryItem, 'id'>) => void;
  onEditCategory?: (id: string, category: Omit<CategoryItem, 'id'>) => void;
  onDeleteCategory?: (id: string) => void;
}

export default function Categories({ 
  categories, 
  onAddCategory, 
  onEditCategory, 
  onDeleteCategory 
}: CategoriesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    debitAccount: "",
    creditAccount: ""
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.debitAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.creditAccount.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClick = () => {
    setFormData({ name: "", debitAccount: "", creditAccount: "" });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (category: CategoryItem) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      debitAccount: category.debitAccount,
      creditAccount: category.creditAccount
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = () => {
    if (formData.name && formData.debitAccount && formData.creditAccount) {
      if (isEditModalOpen && editingCategory) {
        onEditCategory?.(editingCategory.id, formData);
      } else {
        onAddCategory?.(formData);
      }
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", debitAccount: "", creditAccount: "" });
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
                      <td className="py-3 px-4 text-gray-900">{category.debitAccount}</td>
                      <td className="py-3 px-4 text-gray-900">{category.creditAccount}</td>
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
              <Select value={formData.debitAccount} onValueChange={(value) => setFormData({ ...formData, debitAccount: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun debit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KAS & BANK">KAS & BANK</SelectItem>
                  <SelectItem value="PIUTANG">PIUTANG</SelectItem>
                  <SelectItem value="PENDAPATAN">PENDAPATAN</SelectItem>
                  <SelectItem value="BEBAN">BEBAN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="credit">Pilih Kredit</Label>
              <Select value={formData.creditAccount} onValueChange={(value) => setFormData({ ...formData, creditAccount: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun kredit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendapatan Sewa Kendaraan">Pendapatan Sewa Kendaraan</SelectItem>
                  <SelectItem value="Beban Gaji">Beban Gaji</SelectItem>
                  <SelectItem value="Beban Operasional">Beban Operasional</SelectItem>
                  <SelectItem value="KAS & BANK">KAS & BANK</SelectItem>
                </SelectContent>
              </Select>
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
              <Select value={formData.debitAccount} onValueChange={(value) => setFormData({ ...formData, debitAccount: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun debit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KAS & BANK">KAS & BANK</SelectItem>
                  <SelectItem value="PIUTANG">PIUTANG</SelectItem>
                  <SelectItem value="PENDAPATAN">PENDAPATAN</SelectItem>
                  <SelectItem value="BEBAN">BEBAN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-credit">Pilih Kredit</Label>
              <Select value={formData.creditAccount} onValueChange={(value) => setFormData({ ...formData, creditAccount: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun kredit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendapatan Sewa Kendaraan">Pendapatan Sewa Kendaraan</SelectItem>
                  <SelectItem value="Beban Gaji">Beban Gaji</SelectItem>
                  <SelectItem value="Beban Operasional">Beban Operasional</SelectItem>
                  <SelectItem value="KAS & BANK">KAS & BANK</SelectItem>
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
