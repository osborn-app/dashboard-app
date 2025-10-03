"use client";
import { useState } from "react";
import BrandTables from "@/components/tables/brand-tables/brand-tables";
import BrandCreateEditDialog from "./components/brand-create-edit-dialog";

interface BrandTableWrapperProps {
  isCreateDialogOpen: boolean;
  onCreateDialogChange: (open: boolean) => void;
}

export default function BrandTableWrapper({ 
  isCreateDialogOpen, 
  onCreateDialogChange 
}: BrandTableWrapperProps) {
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [deletingBrand, setDeletingBrand] = useState<any>(null);

  return (
    <>
      <BrandTables 
        onEdit={(brand) => setEditingBrand(brand)}
        onDelete={(brand) => setDeletingBrand(brand)}
      />
      
      {/* Create Dialog */}
      <BrandCreateEditDialog 
        open={isCreateDialogOpen}
        onOpenChange={onCreateDialogChange}
      />
      
      {/* Edit Dialog */}
      <BrandCreateEditDialog 
        open={!!editingBrand}
        onOpenChange={(open) => !open && setEditingBrand(null)}
        brand={editingBrand}
      />
      
      {/* Delete Dialog */}
      <BrandCreateEditDialog 
        open={!!deletingBrand}
        onOpenChange={(open) => !open && setDeletingBrand(null)}
        brand={deletingBrand}
      />
    </>
  );
}
