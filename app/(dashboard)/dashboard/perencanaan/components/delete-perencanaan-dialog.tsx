'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

import { Perencanaan } from "@/types/perencanaan";

type PerencanaanItem = Perencanaan;

interface DeletePerencanaanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PerencanaanItem | null;
  onConfirm: (item: PerencanaanItem) => void;
}

export function DeletePerencanaanDialog({ open, onOpenChange, item, onConfirm }: DeletePerencanaanDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!item) return;

    setIsDeleting(true);
    
    try {
      onConfirm(item);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menghapus perencanaan',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>Hapus Perencanaan</DialogTitle>
          </div>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus perencanaan ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Perencanaan yang akan dihapus:</h4>
            <p className="text-red-700 font-medium">{item.name}</p>
            <p className="text-red-600 text-sm mt-1">
              Periode: {new Date(item.start_date).toLocaleDateString('id-ID')} - {new Date(item.end_date).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
