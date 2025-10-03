"use client";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface CellActionProps {
  data: any;
  onEdit?: (brand: any) => void;
  onDelete?: (brand: any) => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onEdit, onDelete }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(data);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(data);
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEdit}
        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 text-red-500"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};