"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "@/components/ui/use-toast";
import { useDeleteAddon, useEditAddon } from "@/hooks/api/useProduct";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AddonCellActionProps {
  data: any;
}

export const AddonCellAction: React.FC<AddonCellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const router = useRouter();
  const id = data?.id;
  const queryClient = useQueryClient();

  const { mutateAsync: deleteAddon } = useDeleteAddon(id);
  const { mutateAsync: editAddon } = useEditAddon(id);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAddon(id);
      toast({
        variant: "success",
        title: "Add-on berhasil dihapus!",
      });
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal menghapus add-on",
        description: error?.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    setLoading(true);
    try {
      await editAddon({
        is_available: !data?.is_available,
      });
      toast({
        variant: "success",
        title: "Status berhasil diperbarui!",
        description: `Add-on "${data?.name}" sekarang ${!data?.is_available ? 'tersedia' : 'tidak tersedia'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal memperbarui status",
        description: error?.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Add-on</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus add-on `{data?.name}`? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>

          {/* <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/add-ons/${data?.id}/detail`);
            }}
          >
            <Eye className="mr-2 h-4 w-4" /> Lihat Detail
          </DropdownMenuItem> */}

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/add-ons/${data?.id}/edit`);
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleAvailabilityToggle();
            }}
            disabled={loading}
          >
            {data?.is_available ? (
              <>
                <ToggleLeft className="mr-2 h-4 w-4" /> 
                {loading ? "Memperbarui..." : "Set Tidak Tersedia"}
              </>
            ) : (
              <>
                <ToggleRight className="mr-2 h-4 w-4" /> 
                {loading ? "Memperbarui..." : "Set Tersedia"}
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
