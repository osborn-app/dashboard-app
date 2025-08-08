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
import {
  useDeleteFleet,
  useUpdateFleetStatusToPreparation,
  useUpdateFleetStatusToAvailable,
} from "@/hooks/api/useFleet";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash, Wrench, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CellActionProps {
  data: User;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const id = data?.id;
  const queryClient = useQueryClient();

  const { mutateAsync: deleteFleet } = useDeleteFleet(id);
  const { mutateAsync: updateFleetStatusToPreparation } =
    useUpdateFleetStatusToPreparation();
  const { mutateAsync: updateFleetStatusToAvailable } =
    useUpdateFleetStatusToAvailable();

  const onConfirm = async () => {
    deleteFleet(id, {
      onSuccess: () => {
        toast({
          variant: "success",
          title: "Fleet berhasil dihapus!",
        });
        router.refresh();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Oops! Ada error.",
          description: `Something went wrong: ${error.message}`,
        });
        queryClient.invalidateQueries({ queryKey: ["fleets"] });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["fleets"] });
        setOpen(false);
      },
    });
  };

  const onPreparation = async () => {
    try {
      await updateFleetStatusToPreparation(id);

      toast({
        variant: "success",
        title: "Fleet berhasil diubah ke status preparation!",
      });

      // Force refresh the page to see changes immediately
      router.refresh();

      // Also invalidate queries manually
      queryClient.invalidateQueries({ queryKey: ["fleets"] });
      queryClient.invalidateQueries({ queryKey: ["available-fleets"] });
    } catch (error: any) {
      console.error("Error updating fleet status:", error);

      toast({
        variant: "destructive",
        title: "Oops! Ada error.",
        description: `Something went wrong: ${error.message}`,
      });
    }
  };

  const onAvailable = async () => {
    try {
      await updateFleetStatusToAvailable(id);

      toast({
        variant: "success",
        title: "Fleet berhasil diubah ke status available!",
      });

      // Force refresh the page to see changes immediately
      router.refresh();

      // Also invalidate queries manually
      queryClient.invalidateQueries({ queryKey: ["fleets"] });
      queryClient.invalidateQueries({ queryKey: ["available-fleets"] });
    } catch (error: any) {
      console.error("Error updating fleet status:", error);

      toast({
        variant: "destructive",
        title: "Oops! Ada error.",
        description: `Something went wrong: ${error.message}`,
      });
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
              router.push(`/dashboard/fleets/${data?.id}/edit`);
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>

          {data?.status === "available" && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onPreparation();
              }}
            >
              <Wrench className="mr-2 h-4 w-4" /> Preparation
            </DropdownMenuItem>
          )}

          {data?.status === "preparation" && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onAvailable();
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Available
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
