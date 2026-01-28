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
import { useDeleteUser, useGetUserById } from "@/hooks/api/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { UserDetailDialog } from "./user-detail-dialog";

interface CellActionProps {
  data: any;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const queryClient = useQueryClient();
  const id = data?.id;

  const { mutateAsync: deleteUser } = useDeleteUser();

  const onConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteUser(id);
      toast({
        variant: "success",
        title: "User berhasil dihapus!",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpenDelete(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oops! Ada error.",
        description: `Something went wrong: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={onConfirmDelete}
        loading={loading}
      />
      <UserDetailDialog
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        userId={id}
      />
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
              setOpenDetail(true);
            }}
          >
            <Eye className="mr-2 h-4 w-4" /> Detail
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setOpenDelete(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
