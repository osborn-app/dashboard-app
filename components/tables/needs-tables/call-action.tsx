import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

type CellActionProps = {
  row: any;
};

const CellAction: React.FC<CellActionProps> = ({ row }) => {
  const router = useRouter();
  
  const handleView = () => {
    router.push(`/dashboard/needs/${row.id}/detail`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/needs/${row.id}/edit`);
  };

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus maintenance ini?')) {
      // Implementasi delete
      console.log('Delete maintenance:', row.id);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleView}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CellAction;
