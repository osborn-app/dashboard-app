"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Trash, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeleteLainnya } from "@/hooks/api/useRekap";

interface CellActionProps {
  data: any;
  type: "orderan-sewa" | "reimburse" | "inventaris" | "lainnya";
}

export const CellAction: React.FC<CellActionProps> = ({ data, type }) => {
  const router = useRouter();
  const { mutate: deleteLainnya } = useDeleteLainnya();

  const handleView = () => {
    router.push(`/dashboard/rekap/${type}/${data.id}/detail`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/rekap/${type}/${data.id}/edit`);
  };

  const handleDelete = () => {
    deleteLainnya(data.id);
  };

  // Hanya tampilkan dropdown untuk type "lainnya"
  if (type !== "lainnya") {
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleView();
          }}
        >
          <Eye className="mr-2 h-4 w-4" /> Detail
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleEdit();
          }}
        >
          <Edit className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
