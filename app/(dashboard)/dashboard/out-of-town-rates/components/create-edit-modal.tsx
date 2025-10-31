"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { usePostOutOfTownRate, usePatchOutOfTownRate } from "@/hooks/api/useOutOfTownRates";
import { OutOfTownRate, OutOfTownRateFormData } from "@/hooks/api/useOutOfTownRates";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

const formSchema = z.object({
  region_name: z.string().min(1, "Nama wilayah harus diisi"),
  daily_rate: z.number().min(0, "Tarif harian tidak boleh kurang dari 0"),
  motorcycle_daily_rate: z.number().min(0, "Tarif harian motor tidak boleh kurang dari 0").optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: OutOfTownRate | null;
  isEdit?: boolean;
}

export const CreateEditModal: React.FC<CreateEditModalProps> = ({
  isOpen,
  onClose,
  data,
  isEdit = false,
}) => {
  const { mutateAsync: createOutOfTownRate, isPending: isCreating } = usePostOutOfTownRate();
  const { mutateAsync: updateOutOfTownRate, isPending: isUpdating } = usePatchOutOfTownRate();

  const form = useForm<OutOfTownRateFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region_name: "",
      daily_rate: 0,
      motorcycle_daily_rate: 0,
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEdit && data) {
      form.reset({
        region_name: data.region_name,
        daily_rate: Number(data.daily_rate),
        motorcycle_daily_rate: data.motorcycle_daily_rate ? Number(data.motorcycle_daily_rate) : 0,
        description: data.description || "",
        is_active: data.is_active,
      });
    } else {
      form.reset({
        region_name: "",
        daily_rate: 0,
        motorcycle_daily_rate: 0,
        description: "",
        is_active: true,
      });
    }
  }, [isEdit, data, form]);

  const onSubmit = async (values: OutOfTownRateFormData) => {
    try {
      if (isEdit && data) {
        await updateOutOfTownRate({ id: data.id, body: values });
        toast({
          variant: "success",
          title: "Tarif luar kota berhasil diperbarui!",
        });
      } else {
        await createOutOfTownRate(values);
        toast({
          variant: "success",
          title: "Tarif luar kota berhasil ditambahkan!",
        });
      }
      onClose();
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oops! Ada error.",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
      });
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEdit ? "Edit Tarif Luar Kota" : "Tambah Tarif Luar Kota"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isEdit 
              ? "Perbarui informasi tarif luar kota" 
              : "Tambahkan tarif luar kota baru ke sistem"
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="region_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Nama Wilayah</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama wilayah"
                      className="h-10 text-sm"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="daily_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Tarif Harian Mobil</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Masukkan tarif harian mobil"
                      className="h-10 text-sm"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motorcycle_daily_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Tarif Harian Motor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Masukkan tarif harian motor"
                      className="h-10 text-sm"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Deskripsi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan deskripsi (opsional)"
                      className="h-10 text-sm"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                  <div className="space-y-0.5 flex-1">
                    <FormLabel className="text-sm sm:text-base font-medium">Status Aktif</FormLabel>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Aktifkan atau nonaktifkan tarif ini
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full sm:w-auto h-10 text-sm"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:w-auto h-10 text-sm"
              >
                {isLoading ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
