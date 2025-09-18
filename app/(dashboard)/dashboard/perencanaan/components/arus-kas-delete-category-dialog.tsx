"use client";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

interface ArusKasDeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  onSuccess?: () => void;
  onDataChange?: () => void;
}

export const ArusKasDeleteCategoryDialog = ({ 
  isOpen, 
  onClose, 
  categoryId,
  categoryName,
  onSuccess,
  onDataChange 
}: ArusKasDeleteCategoryDialogProps) => {
  const { toast } = useToast();
  
  // TODO: Integrate with API hook when ready
  // const deleteCategoryMutation = useDeletePlanningCategory(parseInt(categoryId));

  const handleDelete = async () => {
    try {
      // TODO: Replace with real API call
      // await deleteCategoryMutation.mutateAsync(parseInt(categoryId));
      toast({ title: 'Success', description: 'Kategori berhasil dihapus' });
      onClose();
      onSuccess?.();
      onDataChange?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus kategori', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Hapus Kategori
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus kategori <strong>&quot;{categoryName}&quot;</strong>?
            <br />
            <span className="text-red-600 font-medium">
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua akun yang terkait dengan kategori ini.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
          >
            Hapus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
