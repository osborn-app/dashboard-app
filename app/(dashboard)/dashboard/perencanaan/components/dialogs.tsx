"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { useDeletePlanningCategory } from '@/hooks/api/usePerencanaan';

import { CreatePerencanaanData, Perencanaan } from "@/types/perencanaan";

// ===== CREATE PERENCANAAN DIALOG =====
interface CreatePerencanaanFormData {
  name: string;
  startDate: string;
  endDate: string;
}

interface CreatePerencanaanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePerencanaanData) => void;
  isLoading?: boolean;
}

export function CreatePerencanaanDialog({ open, onOpenChange, onSubmit, isLoading = false }: CreatePerencanaanDialogProps) {
  const [formData, setFormData] = useState<CreatePerencanaanFormData>({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Partial<CreatePerencanaanFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<CreatePerencanaanFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama perencanaan harus diisi';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Tanggal awal harus diisi';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Tanggal akhir harus diisi';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'Tanggal akhir harus lebih besar dari tanggal awal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Mohon periksa kembali form yang diisi',
        variant: 'destructive',
      });
      return;
    }

    const apiData = {
      name: formData.name.trim(),
      start_date: formData.startDate,
      end_date: formData.endDate,
    };

    onSubmit(apiData);
  };

  const handleInputChange = (field: keyof CreatePerencanaanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Perencanaan</DialogTitle>
          <DialogDescription>
            Isi informasi dibawah untuk menambahkan transaksi
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Perencanaan *</Label>
            <Input
              id="name"
              placeholder="Contoh: Penambahan Unit Lamborghini"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Awal *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ===== EDIT PERENCANAAN DIALOG =====
type PerencanaanItem = Perencanaan;

interface EditPerencanaanFormData {
  name: string;
  start_date: string;
  end_date: string;
}

interface EditPerencanaanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PerencanaanItem;
  onSubmit: (data: Partial<PerencanaanItem>) => void;
}

export function EditPerencanaanDialog({ open, onOpenChange, item, onSubmit }: EditPerencanaanDialogProps) {
  const [formData, setFormData] = useState<EditPerencanaanFormData>({
    name: '',
    start_date: '',
    end_date: '',
  });
  const [errors, setErrors] = useState<Partial<EditPerencanaanFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        start_date: item.start_date || '',
        end_date: item.end_date || '',
      });
    }
  }, [item]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EditPerencanaanFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama perencanaan harus diisi';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Tanggal awal harus diisi';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Tanggal akhir harus diisi';
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'Tanggal akhir harus lebih besar dari tanggal awal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Mohon periksa kembali form yang diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const apiData = {
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      onSubmit(apiData);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengupdate perencanaan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof EditPerencanaanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Perencanaan</DialogTitle>
          <DialogDescription>
            Edit informasi perencanaan yang sudah ada
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Perencanaan *</Label>
            <Input
              id="name"
              placeholder="Contoh: Penambahan Unit Lamborghini"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Tanggal Awal *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Tanggal Akhir *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ===== DELETE PERENCANAAN DIALOG =====
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

// ===== DELETE CATEGORY DIALOG =====
interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  planningId: string | number;
  onSuccess?: () => void;
  onDataChange?: () => void;
}

export const DeleteCategoryDialog = ({ 
  isOpen, 
  onClose, 
  categoryId,
  categoryName,
  planningId,
  onSuccess,
  onDataChange 
}: DeleteCategoryDialogProps) => {
  const { toast } = useToast();
  const deleteCategoryMutation = useDeletePlanningCategory(planningId, parseInt(categoryId));

  const handleDelete = async () => {
    try {
      await deleteCategoryMutation.mutateAsync(parseInt(categoryId));
      toast({
        title: 'Success',
        description: 'Kategori berhasil dihapus',
      });
      onClose();
      onSuccess?.();
      onDataChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus kategori',
        variant: 'destructive',
      });
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
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteCategoryMutation.isPending}
          >
            {deleteCategoryMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ===== ARUS KAS DELETE CATEGORY DIALOG =====
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
