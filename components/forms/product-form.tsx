"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePostProduct, useEditProduct, useGetDetailProduct } from "@/hooks/api/useProduct";
import { useGetInfinityLocation } from "@/hooks/api/useLocation";
import { useGetInfinityOwners } from "@/hooks/api/useOwner";
import { NumericFormat } from "react-number-format";
import MulitpleImageUpload, {
  MulitpleImageUploadResponse,
} from "@/components/multiple-image-upload";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import axios from "axios";
import { omitBy } from "lodash";
import { useDebounce } from "use-debounce";
import { Select as AntdSelect, Space } from "antd";

// Product Category Enums
enum ProductCategory {
  IPHONE = "iphone",
  CAMERA = "camera",
  OUTDOOR = "outdoor",
  STARLINK = "starlink",
}

// File schema for photo upload
const fileSchema = z.custom<any>(
  (val: any) => {
    // if (val.length == 0) return false;
    // for (let i = 0; i < val.length; i++) {
    //   const file = val[i];
    //   const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    //   if (!allowedTypes.includes(file.type)) return false;
    // }
    return true;
  },
  {
    message:
      "Foto kosong. Pastikan file yang kamu pilih adalah tipe JPEG, PNG.",
  },
);

// Product Form Schema trigger
const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  model: z.string().min(1, "Model wajib diisi"),
  price: z.string().min(1, "Harga wajib diisi"),
  location_id: z.string().min(1, "Lokasi wajib dipilih"),
  owner_id: z.string().min(1, "Pemilik wajib dipilih"),
  status: z.string().min(1, "Status wajib dipilih"),
  photos: fileSchema,
  specifications: z.object({
    brand: z.string().optional(),
    color: z.string().optional(),
    size: z.string().optional(),
    weight: z.string().optional(),
    material: z.string().optional(),
    warranty: z.string().optional(),
  }).optional(),
  description: z.string().optional(),
  commission: z
    .object({
      transgo: z.number(),
      owner: z.number(),
      partner: z.number(),
    })
    .refine((data) => data.owner + data.partner <= 100, {
      message:
        "Total persentase dari Owner dan Partner tidak boleh melebihi 100%",
      path: ["owner", "partner"],
    }),
});

type ProductFormValues = z.infer<typeof productSchema> & {
  photos: MulitpleImageUploadResponse;
};

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
  productId?: string;
}

export const CreateProductForm: React.FC<ProductFormProps> = () => {
  return <ProductForm isEdit={false} />;
};

export const EditProductForm: React.FC<ProductFormProps> = ({ productId }) => {
  return <ProductForm isEdit={true} productId={productId} />;
};

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  isEdit = false,
  productId,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchOwner, setSearchOwner] = useState("");
  const [searchLocationDebounce] = useDebounce(searchLocation, 500);
  const [searchOwnerDebounce] = useDebounce(searchOwner, 500);
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();

  const title = productId ? "Edit Produk" : "Buat Produk";
  const description = productId ? "Edit detail produk" : "Buat produk baru";

  // Fetch data
  const {
    data: locations,
    fetchNextPage: fetchNextLocations,
    isFetchingNextPage: isFetchingNextLocations,
  } = useGetInfinityLocation(searchLocationDebounce);
  
  const {
    data: owners,
    fetchNextPage: fetchNextOwners,
    isFetchingNextPage: isFetchingNextOwners,
  } = useGetInfinityOwners(searchOwnerDebounce);
  
  const { data: productData, isLoading: isLoadingProduct } = useGetDetailProduct(productId || "", {
    enabled: !!productId,
  });

  // API mutations
  const { mutate: createProduct } = usePostProduct();
  const { mutate: editProduct } = useEditProduct(productId || "");

  // Use product data for edit mode
  const productDataForForm = productData?.data;

  const handleScroll = (event: any, type: string) => {
    const target = event.target;
    if (
      target.scrollTop + target.offsetHeight === target.scrollHeight &&
      !isFetchingNextLocations &&
      !isFetchingNextOwners
    ) {
      if (type === "location") {
        fetchNextLocations();
      } else if (type === "owner") {
        fetchNextOwners();
      }
    }
  };

  const uploadImage = async (file: any) => {
    const file_names = [];
    for (let i = 0; i < file?.length; i++) {
      file_names.push(file?.[i].name);
    }

         const response = await axiosAuth.post("/storages/presign/list", {
       file_names: file_names,
       folder: "fleet",
     });

    for (let i = 0; i < file_names.length; i++) {
      const file_data = file;
      await axios.put(response.data[i].upload_url, file_data[i], {
        headers: {
          "Content-Type": file_data[i].type,
        },
      });
    }

    return response.data;
  };

  const defaultValues = isEdit && productDataForForm
    ? {
        name: productDataForForm.name || "",
        category: productDataForForm.category || "",
        model: productDataForForm.model || "",
        price: productDataForForm.price?.toString() || "",
        location_id: productDataForForm.location?.id?.toString() || "",
        owner_id: productDataForForm.owner?.id?.toString() || "",
        status: productDataForForm.status || "available",
        photos: productDataForForm.photos || [],
        specifications: productDataForForm.specifications ? {
          brand: productDataForForm.specifications.brand || "",
          color: productDataForForm.specifications.color || "",
          size: productDataForForm.specifications.size || "",
          weight: productDataForForm.specifications.weight || "",
          material: productDataForForm.specifications.material || "",
          warranty: productDataForForm.specifications.warranty || "",
        } : {
          brand: "",
          color: "",
          size: "",
          weight: "",
          material: "",
          warranty: "",
        },
        description: productDataForForm.description || "",
        commission: productDataForForm.commission ? {
          transgo: productDataForForm.commission.transgo || 0,
          owner: productDataForForm.commission.owner || 0,
          partner: productDataForForm.commission.partner || 0,
        } : { transgo: 0, owner: 0, partner: 0 },
      }
    : {
        name: "",
        category: "",
        model: "",
        price: "",
        location_id: "",
        owner_id: "",
        status: "available",
        photos: [],
        specifications: {
          brand: "",
          color: "",
          size: "",
          weight: "",
          material: "",
          warranty: "",
        },
        description: "",
        commission: { transgo: 0, owner: 0, partner: 0 },
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  // Reset form when product data changes (for edit mode)
  useEffect(() => {
    if (isEdit && productDataForForm) {
      form.reset({
        name: productDataForForm.name || "",
        category: productDataForForm.category || "",
        model: productDataForForm.model || "",
        price: productDataForForm.price?.toString() || "",
        location_id: productDataForForm.location?.id?.toString() || "",
        owner_id: productDataForForm.owner?.id?.toString() || "",
        status: productDataForForm.status || "available",
        photos: productDataForForm.photos || [],
        specifications: productDataForForm.specifications ? {
          brand: productDataForForm.specifications.brand || "",
          color: productDataForForm.specifications.color || "",
          size: productDataForForm.specifications.size || "",
          weight: productDataForForm.specifications.weight || "",
          material: productDataForForm.specifications.material || "",
          warranty: productDataForForm.specifications.warranty || "",
        } : {
          brand: "",
          color: "",
          size: "",
          weight: "",
          material: "",
          warranty: "",
        },
        description: productDataForForm.description || "",
        commission: productDataForForm.commission ? {
          transgo: productDataForForm.commission.transgo || 0,
          owner: productDataForForm.commission.owner || 0,
          partner: productDataForForm.commission.partner || 0,
        } : { transgo: 0, owner: 0, partner: 0 },
      });
    }
  }, [isEdit, productDataForForm, form]);

  // Commission calculation logic
  const watchOwner = form.watch("commission.owner") || 0;
  const watchPartner = form.watch("commission.partner") || 0;

  useEffect(() => {
    const ownerValue = parseFloat(watchOwner?.toString()) || 0;
    const partnerValue = parseFloat(watchPartner?.toString()) || 0;

    const remaining = 100 - ownerValue - partnerValue;
    const transgoValue = remaining >= 0 ? remaining : 0;

    form.setValue("commission.transgo", transgoValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchOwner, watchPartner]);

  const onSubmit = async (data: ProductFormValues) => {
    let isPresign: boolean = false;
    for (let i = 0; i < data?.photos?.length; i++) {
      if (data?.photos[i]?.photo) {
        isPresign = false;
        break;
      } else {
        isPresign = true;
      }
    }
    setLoading(true);
    
    try {
      if (productId) {
        let filteredURL: string[] = [];
        if (isPresign) {
          const uploadImageRes = await uploadImage(data?.photos);
          filteredURL = uploadImageRes?.map(
            (item: { download_url: string; upload_url: string }) =>
              item.download_url,
          );
        } else {
          filteredURL = data?.photos?.map((item: any) => item.photo);
        }

        const payload = {
          name: data.name,
          category: data.category,
          model: data.model,
          price: parseInt(data.price.replace(/,/g, '')),
          location_id: parseInt(data.location_id),
          owner_id: parseInt(data.owner_id),
          status: data.status,
          photos: filteredURL,
          specifications: data.specifications || {},
          description: data.description || "",
          commission: data.commission,
        };

                 editProduct(payload, {
           onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["products"] });
                          toast({
                variant: "success",
                title: "Produk berhasil diperbarui!",
              });
             router.push("/dashboard/products");
           },
           onSettled: () => {
             setLoading(false);
           },
           onError: (error: any) => {
             toast({
               variant: "destructive",
               title: "Oops! Terjadi kesalahan",
               description: `Error: ${
                 error?.response?.data?.message || error?.message
               }`,
             });
           },
         });
      } else {
        const uploadImageRes = await uploadImage(data?.photos);
        const filteredURL = uploadImageRes.map(
          (item: { download_url: string; upload_url: string }) =>
            item.download_url,
        );

        const payload = omitBy(
          {
            name: data.name,
            category: data.category,
            model: data.model,
            price: parseInt(data.price.replace(/,/g, '')),
            location_id: parseInt(data.location_id),
            owner_id: parseInt(data.owner_id),
            status: data.status,
            photos: filteredURL,
            specifications: data.specifications || {},
            description: data.description || "",
            commission: data.commission,
          },
          (value) => value == "" || value == null,
        );

                 createProduct(payload, {
           onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["products"] });
                          toast({
                variant: "success",
                title: "Produk berhasil dibuat!",
              });
             router.push("/dashboard/products");
           },
           onSettled: () => {
             setLoading(false);
           },
           onError: (error: any) => {
             toast({
               variant: "destructive",
               title: "Oops! Terjadi kesalahan",
               description: `Error: ${
                 error?.response?.data?.message || error?.message
               }`,
             });
           },
         });
      }
         } catch (error: any) {
       setLoading(false);
       toast({
         variant: "destructive",
         title: "Error",
         description: error?.response?.data?.message || "Terjadi kesalahan",
       });
     }
  };

  const categoryOptions = [
    { label: "iPhone", value: ProductCategory.IPHONE },
    { label: "Camera", value: ProductCategory.CAMERA },
    { label: "Outdoor", value: ProductCategory.OUTDOOR },
    { label: "Starlink", value: ProductCategory.STARLINK },
  ];

  const statusOptions = [
    { label: "Tersedia", value: "available" },
    { label: "Tidak Tersedia", value: "unavailable" },
  ];

  return (
    <>
      <div className="flex items-center justify-between py-3 gap-2 flex-wrap">
        <Heading title={title} description={description} />
      </div>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
               control={form.control}
               name="name"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Nama Produk</FormLabel>
                   <FormControl>
                     <Input placeholder="Masukkan nama produk" {...field} />
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
               name="model"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Model</FormLabel>
                   <FormControl>
                     <Input placeholder="Masukkan model produk" {...field} />
                   </FormControl>
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
                     <NumericFormat
                       customInput={Input}
                       thousandSeparator=","
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
               name="location_id"
               render={({ field }) => (
                 <Space size={12} direction="vertical">
                   <FormLabel className="relative label-required">
                     Lokasi
                   </FormLabel>
                   <FormControl>
                     <AntdSelect
                       showSearch
                       value={field.value}
                       placeholder="Pilih Lokasi"
                       style={{ width: "100%" }}
                       onSearch={setSearchLocation}
                       onChange={field.onChange}
                       onPopupScroll={(event) =>
                         handleScroll(event, "location")
                       }
                       filterOption={false}
                       notFoundContent={
                         isFetchingNextLocations ? (
                           <p className="px-3 text-sm">loading</p>
                         ) : null
                       }
                     >
                       {isEdit && productDataForForm?.location && (
                         <AntdSelect.Option
                           value={productDataForForm.location.id.toString()}
                         >
                           {productDataForForm.location.name}
                         </AntdSelect.Option>
                       )}
                       {locations?.pages.map((page: any, pageIndex: any) =>
                         page.data.items.map((item: any, itemIndex: any) => {
                           return (
                             <AntdSelect.Option
                               key={item.id}
                               value={item.id.toString()}
                             >
                               {item.name}
                             </AntdSelect.Option>
                           );
                         }),
                       )}

                       {isFetchingNextLocations && (
                         <AntdSelect.Option disabled>
                           <p className="px-3 text-sm">loading</p>
                         </AntdSelect.Option>
                       )}
                     </AntdSelect>
                   </FormControl>
                   <FormMessage />
                 </Space>
               )}
             />

              <FormField
               control={form.control}
               name="owner_id"
               render={({ field }) => (
                 <Space size={12} direction="vertical" className="w-full">
                   <FormLabel>Pemilik</FormLabel>
                   <FormControl>
                     <AntdSelect
                       showSearch
                       value={field.value}
                       placeholder="Pilih Owner"
                       style={{ width: "100%" }}
                       onSearch={setSearchOwner}
                       onChange={field.onChange}
                       onPopupScroll={(event) =>
                         handleScroll(event, "owner")
                       }
                       filterOption={false}
                       notFoundContent={
                         isFetchingNextOwners ? (
                           <p className="px-3 text-sm">loading</p>
                         ) : null
                       }
                     >
                       {isEdit && productDataForForm?.owner && (
                         <AntdSelect.Option
                           value={productDataForForm.owner.id.toString()}
                         >
                           {productDataForForm.owner.name}
                         </AntdSelect.Option>
                       )}
                       {owners?.pages.map((page: any) =>
                         page.data.items.map((item: any) => {
                           return (
                             <AntdSelect.Option
                               key={item.id}
                               value={item.id.toString()}
                             >
                               {item.name}
                             </AntdSelect.Option>
                           );
                         }),
                       )}

                       {isFetchingNextOwners && (
                         <AntdSelect.Option disabled>
                           <p className="px-3 text-sm">loading</p>
                         </AntdSelect.Option>
                       )}
                     </AntdSelect>
                   </FormControl>
                   <FormMessage />
                 </Space>
               )}
             />

              <FormField
               control={form.control}
               name="status"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Status</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Pilih status" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {statusOptions.map((option) => (
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
          </div>

          {/* Photo Upload */}
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="relative label-required">
                  Foto Produk
                </FormLabel>
                <FormControl className="disabled:opacity-100">
                  <MulitpleImageUpload
                    onChange={field.onChange}
                    value={field.value}
                    onRemove={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

             <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heading title="Spesifikasi" description="Spesifikasi produk" />
              </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="specifications.brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merek</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan merek" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specifications.color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warna</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan warna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specifications.size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ukuran</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan ukuran" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specifications.weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Berat</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan berat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               <FormField
                  control={form.control}
                  name="specifications.material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan material" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specifications.warranty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Garansi</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan garansi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>
           </div>

          {/* Commission Section */}
           <div className="space-y-4">
             <div className="flex items-center gap-2">
               <Heading title="Komisi" description="Pengaturan komisi produk" />
             </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="commission.owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="relative label-required">
                      Komisi Owner %
                    </FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        type="text"
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined || floatValue <= 100
                        }
                        thousandSeparator
                        allowNegative={false}
                        placeholder="Masukkan Komisi (contoh: 70 %)"
                        className="disabled:opacity-90"
                        value={field.value}
                        onValueChange={({ floatValue }) =>
                          floatValue !== undefined &&
                          field.onChange(floatValue || 0)
                        }
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commission.partner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Komisi Partner %</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        type="text"
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined || floatValue <= 100
                        }
                        thousandSeparator
                        allowNegative={false}
                        placeholder="Masukkan Komisi (contoh: 10 %)"
                        className="disabled:opacity-90"
                        value={field.value}
                        onValueChange={({ floatValue }) =>
                          floatValue !== undefined &&
                          field.onChange(floatValue || 0)
                        }
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commission.transgo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="relative label-required">
                      Komisi Transgo % (Otomatis)
                    </FormLabel>
                    <FormControl>
                      <NumericFormat
                        disabled
                        customInput={Input}
                        type="text"
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined || floatValue <= 100
                        }
                        thousandSeparator
                        allowNegative={false}
                        className="disabled:opacity-90"
                        value={field.value}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormMessage className="col-span-3">
              {/* @ts-ignore */}
              {form.formState.errors.commission?.owner?.partner?.message}
            </FormMessage>
          </div>

           <FormField
             control={form.control}
             name="description"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Deskripsi</FormLabel>
                 <FormControl>
                   <Textarea
                     placeholder="Masukkan deskripsi produk"
                     className="resize-none"
                     {...field}
                   />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />

           <div className="flex gap-4">
             <Button type="submit" disabled={loading}>
               {loading ? "Menyimpan..." : productId ? "Perbarui Produk" : "Buat Produk"}
             </Button>
             <Button
               type="button"
               variant="outline"
               onClick={() => router.push("/dashboard/products")}
             >
               Batal
             </Button>
           </div>
        </form>
      </Form>
    </>
  );
};
