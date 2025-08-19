"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useEditAddon, useGetDetailAddon } from "@/hooks/api/useProduct";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Spinner from "@/components/spinner";

const formSchema = z.object({
  name: z.string().min(1, "Nama add-on wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  price: z.string().min(1, "Harga wajib diisi"),
  description: z.string().optional(),
  is_available: z.boolean().default(true),
});

const categoryOptions = [
  { label: "iPhone", value: "iphone" },
  { label: "Kamera", value: "camera" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Starlink", value: "starlink" },
  { label: "Mobil", value: "car" },
  { label: "Motor", value: "motorcycle" },
];

interface AddonEditFormProps {
  addonId: string;
}

export const AddonEditForm = ({ addonId }: AddonEditFormProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { mutateAsync: editAddon } = useEditAddon(addonId);
  const { data: addonData, isLoading: isLoadingAddon } = useGetDetailAddon(addonId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      description: "",
      is_available: true,
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (addonData?.data) {
      const addon = addonData.data;
      form.reset({
        name: addon.name || "",
        category: addon.category || "",
        price: addon.price?.toString() || "",
        description: addon.description || "",
        is_available: addon.is_available ?? true,
      });
    }
  }, [addonData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await editAddon({
        ...values,
        price: parseFloat(values.price),
      });
      toast({
        variant: "success",
        title: "Add-on berhasil diperbarui!",
      });
      router.push("/dashboard/add-ons");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal memperbarui add-on",
        description: error?.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingAddon) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Add-on</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama add-on" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Masukkan harga" 
                    {...field} 
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
                  <Textarea 
                    placeholder="Masukkan deskripsi (opsional)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Tersedia</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Buat add-on ini tersedia untuk pembelian
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Memperbarui..." : "Perbarui Add-on"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/dashboard/add-ons")}
            >
              Batal
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
