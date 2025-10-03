"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BrandHeaderProps {
  onAddClick: () => void;
}

export default function BrandHeader({ onAddClick }: BrandHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <h2 className="text-2xl font-bold">Brand Management</h2>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" /> Add Brand
      </Button>
    </div>
  );
}
