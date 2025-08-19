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
import { useDeleteMaintenance, useMarkMaintenanceDone } from "@/hooks/api/useNeeds";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash, Eye, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

interface MaintenanceCellActionProps {
  data: any;
}

export const MaintenanceCellAction: React.FC<MaintenanceCellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const router = useRouter();
  const id = data?.id;
  const queryClient = useQueryClient();

  const { mutateAsync: deleteMaintenance } = useDeleteMaintenance(id, session?.user?.accessToken || "");
  const { mutateAsync: markMaintenanceDone } = useMarkMaintenanceDone(id, session?.user?.accessToken || "");

  const onConfirm = async () => {
    setLoading(true);
    try {
      await deleteMaintenance();
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Maintenance berhasil dihapus!",
        confirmButtonColor: "#10b981",
      });
      router.refresh();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: `Gagal menghapus maintenance: ${error?.response?.data?.message || "Terjadi kesalahan"}`,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      setLoading(false);
      setOpen(false);
    }
  };

  const handleMarkAsDone = async () => {
    try {
      await markMaintenanceDone();
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Maintenance berhasil ditandai sebagai selesai!",
        confirmButtonColor: "#10b981",
      });
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: `Gagal menandai maintenance sebagai selesai: ${error?.response?.data?.message || "Terjadi kesalahan"}`,
        confirmButtonColor: "#ef4444",
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
              router.push(`/dashboard/needs/${data?.id}/detail`);
            }}
          >
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>

          {data?.status === 'ongoing' && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsDone();
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Mark as Done
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