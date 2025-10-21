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
import { useDeleteOutOfTownRate, useToggleOutOfTownRateStatus } from "@/hooks/api/useOutOfTownRates";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import { OutOfTownRate } from "@/hooks/api/useOutOfTownRates";

interface CellActionProps {
  data: OutOfTownRate;
  onEdit: (data: OutOfTownRate) => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: deleteOutOfTownRate } = useDeleteOutOfTownRate();
  const { mutateAsync: toggleStatus } = useToggleOutOfTownRateStatus();

  const onConfirm = async () => {
    setLoading(true);
    try {
      await deleteOutOfTownRate(data.id);
      toast({
        variant: "success",
        title: "Tarif luar kota berhasil dihapus!",
      });
      queryClient.invalidateQueries({ queryKey: ["out-of-town-rates"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oops! Ada error.",
        description: `Something went wrong: ${error.message}`,
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleStatus({ id: data.id, is_active: !data.is_active });
      toast({
        variant: "success",
        title: `Tarif luar kota berhasil ${!data.is_active ? 'diaktifkan' : 'dinonaktifkan'}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["out-of-town-rates"] });
    } catch (error: any) {
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
              onEdit(data);
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus();
            }}
          >
            {data.is_active ? (
              <>
                <ToggleLeft className="mr-2 h-4 w-4" /> Nonaktifkan
              </>
            ) : (
              <>
                <ToggleRight className="mr-2 h-4 w-4" /> Aktifkan
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
