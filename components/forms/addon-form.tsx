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
import { usePostAddon } from "@/hooks/api/useProduct";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const formSchema = z.object({
  name: z.string().min(1, "Nama add-on wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  price: z.string().min(1, "Harga wajib diisi"),
  description: z.string().optional(),
  is_available: z.boolean().default(true),
  stock_quantity: z.string().min(1, "Stock quantity wajib diisi"),
  reserved_quantity: z.string().optional().default("0"),
}).refine((data) => {
  const stockQty = parseInt(data.stock_quantity);
  const reservedQty = parseInt(data.reserved_quantity || "0");
  return reservedQty <= stockQty;
}, {
  message: "Reserved quantity tidak boleh lebih dari stock quantity",
  path: ["reserved_quantity"],
});

const categoryOptions = [
  { label: "iPhone", value: "iphone" },
  { label: "Kamera", value: "camera" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Starlink", value: "starlink" },
  { label: "Mobil", value: "car" },
  { label: "Motor", value: "motorcycle" },
];

export const AddonForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { mutateAsync: createAddon } = usePostAddon();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      description: "",
      is_available: true,
      stock_quantity: "",
      reserved_quantity: "0",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await createAddon({
        ...values,
        price: parseFloat(values.price),
        stock_quantity: parseInt(values.stock_quantity),
        reserved_quantity: parseInt(values.reserved_quantity || "0"),
      });
      toast({
        variant: "success",
        title: "Add-on berhasil dibuat!",
      });
      router.push("/dashboard/add-ons");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal membuat add-on",
        description: error?.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Masukkan jumlah stock"
                        min="0"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="text-sm text-blue-800">
                <h4 className="font-medium mb-2">📦 Informasi Stock Management:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Stock Quantity:</strong> Total stock yang tersedia</li>
                  <li>• <strong>Reserved Quantity:</strong> Stock yang sudah dipesan (default: 0)</li>
                  <li>• <strong>Available:</strong> Stock Quantity - Reserved Quantity</li>
                  <li>• Add-on hanya muncul jika Available &gt; 0</li>
                </ul>
              </div>
            </div> */}
          </div>

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
              {loading ? "Membuat..." : "Buat Add-on"}
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
