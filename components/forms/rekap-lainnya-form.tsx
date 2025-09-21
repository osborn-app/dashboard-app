"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateLainnya, useEditLainnya } from "@/hooks/api/useRekap";
import { useGetTransactionCategories } from "@/hooks/api/useRealization";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Form schema untuk validasi
const formSchema = z.object({
  name: z.string().min(1, "Nama transaksi wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  nominal: z.string().min(1, "Nominal wajib diisi"),
  date: z.date({
    required_error: "Tanggal wajib dipilih",
  }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RekapLainnyaFormProps {
  initialData?: any | null;
  isEdit?: boolean;
}

export const RekapLainnyaForm: React.FC<RekapLainnyaFormProps> = ({
  initialData,
  isEdit,
}) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Determine form mode and title
  const isDetailMode = !isEdit && initialData;
  const title = isDetailMode
    ? "Detail Transaksi Lainnya"
    : isEdit
    ? "Edit Transaksi Lainnya"
    : "Tambah Transaksi Lainnya";

  const description = isDetailMode
    ? "Lihat detail transaksi lainnya"
    : isEdit
    ? "Edit data transaksi lainnya"
    : "Tambah transaksi lainnya baru";

  // API hooks
  const { mutate: createLainnya } = useCreateLainnya();
  const { mutate: editLainnya } = useEditLainnya();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetTransactionCategories({ 
    is_active: true,
    page: 1,
    limit: 1000 
  });

  // Default values
  const defaultValues = initialData
    ? {
        name: initialData.name || "",
        categoryId: initialData.categoryId || initialData.category || "",
        nominal: initialData.nominal?.toString() || "",
        date: initialData.date ? new Date(initialData.date) : new Date(),
        description: initialData.description || "",
      }
    : {
        name: "",
        categoryId: "",
        nominal: "",
        date: new Date(),
        description: "",
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(defaultValues);
    }
  }, [initialData, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        categoryId: values.categoryId,
        nominal: parseFloat(values.nominal),
        date: values.date.toISOString(),
      };

      if (isEdit && params.id) {
        editLainnya(
          { id: params.id as string, data: formData },
          {
            onSuccess: () => {
              toast({
                title: "Berhasil!",
                description: "Data transaksi berhasil diperbarui",
              });
              // Invalidate semua query yang relevan
              queryClient.invalidateQueries({ queryKey: ["lainnya"] });
              queryClient.invalidateQueries({ queryKey: ["rekap-pencatatan"] });
              queryClient.invalidateQueries({ queryKey: ["lainnya-by-id"] });
              router.push("/dashboard/rekap-pencatatan?type=lainnya");
            },
            onError: (error: any) => {
              toast({
                variant: "destructive",
                title: "Gagal!",
                description:
                  error?.response?.data?.message ||
                  "Terjadi kesalahan saat memperbarui data",
              });
            },
          },
        );
      } else {
        createLainnya(formData, {
          onSuccess: () => {
            toast({
              title: "Berhasil!",
              description: "Data transaksi berhasil ditambahkan",
            });
            // Invalidate semua query yang relevan
            queryClient.invalidateQueries({ queryKey: ["lainnya"] });
            queryClient.invalidateQueries({ queryKey: ["rekap-pencatatan"] });
            queryClient.invalidateQueries({ queryKey: ["lainnya-by-id"] });
            router.push("/dashboard/rekap-pencatatan?type=lainnya");
          },
          onError: (error: any) => {
            toast({
              variant: "destructive",
              title: "Gagal!",
              description:
                error?.response?.data?.message ||
                "Terjadi kesalahan saat menambahkan data",
            });
          },
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          {/* 2 Kolom untuk field utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Nama Transaksi
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama transaksi"
                      {...field}
                      disabled={isDetailMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Kategori
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isDetailMode || categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Cari kategori..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {categoriesData?.items
                          ?.filter((category: any) =>
                            category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                            (category.description && category.description.toLowerCase().includes(categorySearch.toLowerCase()))
                          )
                          ?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{category.name}</span>
                                {category.description && (
                                  <span className="text-sm text-muted-foreground">
                                    {category.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        {categoriesData?.items?.filter((category: any) =>
                          category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                          (category.description && category.description.toLowerCase().includes(categorySearch.toLowerCase()))
                        )?.length === 0 && (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Kategori tidak ditemukan
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nominal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Nominal
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Masukkan nominal transaksi"
                      {...field}
                      disabled={isDetailMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Tanggal Transaksi
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={isDetailMode}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Field keterangan full width */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keterangan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Masukkan keterangan transaksi (opsional)"
                    className="resize-none"
                    {...field}
                    disabled={isDetailMode}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action buttons */}
          {!isDetailMode && (
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/rekap-pencatatan")}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-main hover:bg-main/90"
              >
                {loading
                  ? "Menyimpan..."
                  : isEdit
                  ? "Simpan Perubahan"
                  : "Simpan"}
              </Button>
            </div>
          )}

          {/* Detail mode - back button only */}
          {isDetailMode && (
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/rekap-pencatatan")}
              >
                Kembali
              </Button>
              <Button
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/rekap-pencatatan/lainnya/${params.id}/edit`,
                  )
                }
                className="bg-main hover:bg-main/90"
              >
                Edit
              </Button>
            </div>
          )}
        </form>
      </Form>
    </>
  );
};
