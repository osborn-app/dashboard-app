"use client";

import { AlertForceModal } from "@/components/modal/alertforce-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { useDeleteProductOrder } from "@/hooks/api/useProductOrder";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CellActionProps {
  data: any;
}

export const ProductOrderCellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [force, setForce] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync: deleteProductOrder } = useDeleteProductOrder(data.id, force);

  const onConfirm = async () => {
    setLoading(true);
    deleteProductOrder(data.id, {
      onSuccess: () => {
        // Invalidate all relevant queries for real-time updates
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["orders", "product"] });
        queryClient.invalidateQueries({ queryKey: ["orders", data.id] });
        queryClient.invalidateQueries({ queryKey: ["orders", "product", data.id] });
        toast({
          variant: "success",
          title: "Product order berhasil dihapus!",
        });
        router.refresh();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Oops! Ada error.",
          //@ts-ignore
          description: `Something went wrong: ${error?.response?.data?.message}`,
        });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
      onSettled: () => {
        // Invalidate all relevant queries for real-time updates
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["orders", "product"] });
        queryClient.invalidateQueries({ queryKey: ["orders", data.id] });
        queryClient.invalidateQueries({ queryKey: ["orders", "product", data.id] });
        setLoading(false);
        setOpen(false);
      },
    });
  };

  return (
    <>
      <AlertForceModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        data={data}
        checked={force}
        setChecked={setForce}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
          <DropdownMenuItem
            className="text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}; 