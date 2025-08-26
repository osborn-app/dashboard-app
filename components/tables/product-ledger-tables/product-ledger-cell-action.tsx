"use client";
import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/constants/data";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/context/UserContext";

interface ProductLedgerCellActionProps {
  data: User;
}

export const ProductLedgerCellAction: React.FC<ProductLedgerCellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const router = useRouter();
  const id = data?.id;
  const queryClient = useQueryClient();

  const onConfirm = async () => {
    setLoading(true);
    try {
      // Delete logic would go here
      toast({
        variant: "success",
        title: "Product Ledger deleted successfully!",
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oops! Ada error.",
        description: `Something went wrong: ${error}`,
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
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

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/product-ledgers/${data?.id}/detail`);
            }}
          >
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>

          {user?.role !== "owner" && (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/product-ledgers/${data?.id}/edit`);
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
