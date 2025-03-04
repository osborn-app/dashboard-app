"use client";
import { ReimburseStatus } from "@/app/(dashboard)/dashboard/reimburse/[reimburseid]/types/reimburse";
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
import { useUser } from "@/context/UserContext";
import { useDeleteReimburse } from "@/hooks/api/useReimburse";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CellActionProps {
  data: User;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { user } = useUser();
  const router = useRouter();
  const id = data?.id;
  const queryClient = useQueryClient();

  const { mutateAsync: deleteReimburse } = useDeleteReimburse(id);

  const onConfirm = async () => {
    setLoading(true);
    deleteReimburse(id, {
      onSuccess: () => {
        toast({
          variant: "success",
          title: "Reimburse berhasil dihapus!",
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
        queryClient.invalidateQueries({ queryKey: ["reimburse"] });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["reimburse"] });
        setLoading(false);
        setOpen(false);
      },
    });
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
        {user?.role !== "driver" && (
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            {data?.status !== "rejected" && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/reimburse/${data?.id}/edit`);
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              <Trash className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </>
  );
};
