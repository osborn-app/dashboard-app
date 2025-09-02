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
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CellActionProps {
  data: any;
  type: "orderan-sewa" | "reimburse" | "inventaris" | "lainnya";
}

export const CellAction: React.FC<CellActionProps> = ({ data, type }) => {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: deleteLainnya } = useDeleteLainnya();

  const handleView = () => {
    router.push(`/dashboard/rekap-pencatatan/${type}/${data.id}/detail`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/rekap-pencatatan/${type}/${data.id}/edit`);
  };

  const handleDelete = () => {
    deleteLainnya(data.id, {
      onSuccess: () => {
        toast({
          title: "Berhasil!",
          description: "Data transaksi berhasil dihapus",
        });
        // Invalidate semua query yang relevan
        queryClient.invalidateQueries({ queryKey: ["lainnya"] });
        queryClient.invalidateQueries({ queryKey: ["rekap-pencatatan"] });
        queryClient.invalidateQueries({ queryKey: ["lainnya-by-id"] });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Gagal!",
          description:
            error?.response?.data?.message ||
            "Terjadi kesalahan saat menghapus data",
        });
      },
    });
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
