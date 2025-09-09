"use client";

import React from "react";
import Categories from "../categories";

interface KategoriTabProps {
  categoryData: any[];
  onAddCategory: (category: { name: string; debitAccount: string; creditAccount: string }) => void;
  onEditCategory: (id: string, category: { name: string; debitAccount: string; creditAccount: string }) => void;
  onDeleteCategory: (id: string) => void;
}

export default function KategoriTab({
  categoryData,
  onAddCategory,
  onEditCategory,
  onDeleteCategory
}: KategoriTabProps) {
  return (
    <div className="space-y-4">
      <Categories 
        categories={categoryData}
        onAddCategory={onAddCategory}
        onEditCategory={onEditCategory}
        onDeleteCategory={onDeleteCategory}
      />
    </div>
  );
}
