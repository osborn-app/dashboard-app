"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { TransactionCategory, CreateTransactionCategoryData, Account } from "../types";
import AccountFilter from "./account-filter";
import CategoryModal from "./modals/category-modal";

interface CategoriesProps {
  categories: TransactionCategory[];
  accounts?: Account[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreateCategory?: (category: CreateTransactionCategoryData) => void;
  onUpdateCategory?: (id: number, category: CreateTransactionCategoryData) => void;
  onDeleteCategory?: (id: number, categoryName: string) => void;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    debitAccountId: null as number | null,
    creditAccountId: null as number | null
  });

  // Client-side filtering based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }
    
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.debit_account?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.credit_account?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Check if category is a new category (can be edited/deleted)
  // Based on the response structure, categories with specific names are system categories
  const isNewCategory = (category: TransactionCategory) => {
    // Categories that start with "Orderan", "Reimburse", "Inventaris", "Diskon Penjualan" are system categories
    const systemCategoryPrefixes = [
      "Orderan Fleets",
      "Orderan Product", 
      "Orderan Sewa",
      "Reimburse",
      "Inventaris",
      "Diskon Penjualan"
    ];
    
    return !systemCategoryPrefixes.some(prefix => category.name.startsWith(prefix));
  };

  const handleAddClick = () => {
    setFormData({ name: "", debitAccountId: null, creditAccountId: null });
    setIsEditMode(false);
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (category: TransactionCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      debitAccountId: parseInt(category.debit_account_id.toString()),
      creditAccountId: parseInt(category.credit_account_id.toString())
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (formData.name && formData.debitAccountId && formData.creditAccountId) {
      const categoryData = {
        name: formData.name,
        debit_account_id: formData.debitAccountId,
        credit_account_id: formData.creditAccountId
      };
      
      try {
        if (isEditMode && editingCategory) {
          await onUpdateCategory?.(editingCategory.id, categoryData);
        } else {
          await onCreateCategory?.(categoryData);
        }
        return true; // Success
      } catch (error) {
        console.error("Error saving category:", error);
        return false; // Failure
      }
    }
    return false; // Validation failed
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingCategory(null);
    setFormData({ name: "", debitAccountId: null, creditAccountId: null });
  };

  const handleFormChange = (data: Partial<{
    name: string;
    debitAccountId: number | null;
    creditAccountId: number | null;
  }>) => {
    setFormData(prev => ({ ...prev, ...data }));
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
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
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
                      {searchQuery.trim() ? 'Tidak ada kategori yang sesuai dengan pencarian' : 'Tidak ada kategori yang ditemukan'}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{category.name}</td>
                      <td className="py-3 px-4 text-gray-900">{category.debit_account?.name || "N/A"}</td>
                      <td className="py-3 px-4 text-gray-900">{category.credit_account?.name || "N/A"}</td>
                      <td className="py-3 px-4 text-center">
                        {isNewCategory(category) ? (
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
                              onClick={() => onDeleteCategory?.(category.id, category.name)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Hapus Kategori"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSubmit}
        isEditMode={isEditMode}
        formData={formData}
        onFormChange={handleFormChange}
        accounts={accounts}
      />
    </div>
  );
}
