"use client";
import { useState } from "react";
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
import { useDeleteBrand } from "@/hooks/api/useBrand";
import { toast } from "@/components/ui/use-toast";

interface DeleteBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: any;
}

export default function DeleteBrandDialog({ 
  open, 
  onOpenChange, 
  brand 
}: DeleteBrandDialogProps) {
  const [loading, setLoading] = useState(false);
  const { mutate: deleteBrand } = useDeleteBrand();

  const handleDelete = () => {
    if (!brand?.id) return;
    
    setLoading(true);
    
    deleteBrand(brand.id, {
      onSuccess: () => {
        toast({
          variant: "success",
          title: "Brand berhasil dihapus!",
        });
        onOpenChange(false);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error!",
          description: error.message,
        });
      },
      onSettled: () => {
        setLoading(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Brand</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus brand <strong>"{brand?.name}"</strong>?
            <br />
            <br />
            Tindakan ini tidak dapat dibatalkan dan akan menghapus brand secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
