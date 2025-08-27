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
import { useDeleteProduct, useUpdateProductStatus } from "@/hooks/api/useProduct";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/context/UserContext";

interface ProductCellActionProps {
  data: User;
}

export const ProductCellAction: React.FC<ProductCellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const router = useRouter();
  const id = data?.id;
  const queryClient = useQueryClient();

  const { mutateAsync: deleteProduct } = useDeleteProduct(id);
  const { mutateAsync: updateProductStatus } = useUpdateProductStatus(id);

  const onConfirm = async () => {
    setLoading(true);
    deleteProduct(id, {
      onSuccess: () => {
        toast({
          variant: "success",
          title: "Product deleted successfully!",
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
        queryClient.invalidateQueries({ queryKey: ["products"] });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        setLoading(false);
        setOpen(false);
      },
    });
  };

  const handleStatusToggle = async () => {
    const newStatus = data?.status === "available" ? "unavailable" : "available";
    
    updateProductStatus(
      { status: newStatus },
      {
        onSuccess: () => {
          toast({
            variant: "success",
            title: `Product ${newStatus === "available" ? "activated" : "deactivated"} successfully!`,
          });
          queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error updating product status",
            //@ts-ignore
            description: `Something went wrong: ${error?.response?.data?.message}`,
          });
        },
      }
    );
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
              router.push(`/dashboard/products/${data?.id}/detail`);
            }}
          >
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>

          {user?.role !== "owner" && (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/products/${data?.id}/edit`);
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusToggle();
                }}
              >
                {data?.status === "available" ? (
                  <>
                    <ToggleLeft className="mr-2 h-4 w-4" /> Deactivate
                  </>
                ) : (
                  <>
                    <ToggleRight className="mr-2 h-4 w-4" /> Activate
                  </>
                )}
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