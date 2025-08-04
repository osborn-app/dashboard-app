"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteProductOrder } from "@/hooks/api/useProductOrder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface CellActionProps {
  data: any;
}

export const ProductOrderCellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isForceDelete, setIsForceDelete] = useState(false);

  const deleteProductOrderMutation = useDeleteProductOrder(data.id, isForceDelete);

  const handleDelete = async () => {
    try {
      await deleteProductOrderMutation.mutateAsync(data.id);
      toast.success("Product order berhasil dihapus");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Gagal menghapus product order");
    }
  };

  const handleForceDelete = async () => {
    setIsForceDelete(true);
    try {
      await deleteProductOrderMutation.mutateAsync(data.id);
      toast.success("Product order berhasil dihapus secara permanen");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Gagal menghapus product order secara permanen");
    } finally {
      setIsForceDelete(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/product-orders/${data.id}/detail`}>
              <Eye className="mr-2 h-4 w-4" />
              Lihat Detail
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/product-orders/${data.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Product Order</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus product order ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
            <AlertDialogAction
              onClick={handleForceDelete}
              className="bg-red-800 hover:bg-red-900"
            >
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 