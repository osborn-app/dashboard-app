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
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEdit && data) {
      form.reset({
        region_name: data.region_name,
        daily_rate: Number(data.daily_rate),
        description: data.description || "",
        is_active: data.is_active,
      });
    } else {
      form.reset({
        region_name: "",
        daily_rate: 0,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Tarif Luar Kota" : "Tambah Tarif Luar Kota"}
          </DialogTitle>
          <DialogDescription>
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
                  <FormLabel>Nama Wilayah</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama wilayah"
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
                  <FormLabel>Tarif Harian</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Masukkan tarif harian"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan deskripsi (opsional)"
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status Aktif</FormLabel>
                    <div className="text-sm text-muted-foreground">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
