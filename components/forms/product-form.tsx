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
import { useGetLocation } from "@/hooks/api/useLocation";
import { useGetInfinityOwners } from "@/hooks/api/useOwner";
import { NumericFormat } from "react-number-format";
import { ProductCategory } from "@/app/(dashboard)/dashboard/product-orders/[productOrderId]/types/product-order";

// Product Form Schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  model: z.string().min(1, "Model is required"),
  price: z.string().min(1, "Price is required"),
  location_id: z.string().min(1, "Location is required"),
  owner_id: z.string().min(1, "Owner is required"),
  status: z.string().min(1, "Status is required"),
  specifications: z.object({
    brand: z.string().optional(),
    color: z.string().optional(),
    size: z.string().optional(),
    weight: z.string().optional(),
    material: z.string().optional(),
    warranty: z.string().optional(),
  }).optional(),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

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
  const [searchOwner, setSearchOwner] = useState("");
  const queryClient = useQueryClient();

  const title = productId ? "Edit Product" : "Create Product";
  const description = productId ? "Edit product details" : "Create a new product";

  // Fetch data
  const { data: locationsData, isLoading: isLoadingLocations } = useGetLocation({}, {}, "location");
  const {
    data: owners,
    fetchNextPage: fetchNextOwners,
    isFetchingNextPage: isFetchingNextOwners,
  } = useGetInfinityOwners(searchOwner);
  const { data: productData, isLoading: isLoadingProduct } = useGetDetailProduct(productId || "", {
    enabled: !!productId,
  });

  // API mutations
  const { mutate: createProduct } = usePostProduct();
  const { mutate: editProduct } = useEditProduct(productId || "");

  const locations = locationsData?.data?.items || locationsData?.data || [];

  // Use product data for edit mode
  const productDataForForm = productData?.data;


  const defaultValues = isEdit && productDataForForm
    ? {
        name: productDataForForm.name || "",
        category: productDataForForm.category || "",
        model: productDataForForm.model || "",
        price: productDataForForm.price?.toString() || "",
        location_id: productDataForForm.location_id?.toString() || "",
        owner_id: productDataForForm.owner_id?.toString() || "",
        status: productDataForForm.status || "available",
        specifications: productDataForForm.specifications || {
          brand: "",
          color: "",
          size: "",
          weight: "",
          material: "",
          warranty: "",
        },
        description: productDataForForm.description || "",
      }
    : {
        name: "",
        category: "",
        model: "",
        price: "",
        location_id: "",
        owner_id: "",
        status: "available",
        specifications: {
          brand: "",
          color: "",
          size: "",
          weight: "",
          material: "",
          warranty: "",
        },
        description: "",
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
        location_id: productDataForForm.location_id?.toString() || "",
        owner_id: productDataForForm.owner_id?.toString() || "",
        status: productDataForForm.status || "available",
        specifications: productDataForForm.specifications || {
          brand: "",
          color: "",
          size: "",
          weight: "",
          material: "",
          warranty: "",
        },
        description: productDataForForm.description || "",
      });
    }
  }, [isEdit, productDataForForm, form]);

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);

    const payload = {
      name: data.name,
      category: data.category,
      model: data.model,
      price: parseInt(data.price),
      location_id: parseInt(data.location_id),
      owner_id: parseInt(data.owner_id),
      status: data.status,
      specifications: data.specifications || {},
      description: data.description || "",
    };

    const handleSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        variant: "success",
        title: productId ? "Product updated successfully!" : "Product created successfully!",
      });
      router.push("/dashboard/products");
    };

    const handleError = (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
      });
    };

    try {
      if (productId) {
        editProduct(payload, {
          onSuccess: handleSuccess,
          onError: handleError,
        });
      } else {
        createProduct(payload, {
          onSuccess: handleSuccess,
          onError: handleError,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { label: "iPhone", value: ProductCategory.IPHONE },
    { label: "Camera", value: ProductCategory.CAMERA },
    { label: "Outdoor", value: ProductCategory.OUTDOOR },
    { label: "Starlink", value: ProductCategory.STARLINK },
  ];

  const statusOptions = [
    { label: "Available", value: "available" },
    { label: "Unavailable", value: "unavailable" },
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
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
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
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                    <Input placeholder="Enter product model" {...field} />
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
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator=","
                      placeholder="Enter price"
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
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                                         <SelectContent>
                       {isLoadingLocations ? (
                         <div className="p-2 text-center">Loading locations...</div>
                       ) : !Array.isArray(locations) ? (
                         <div className="p-2 text-center text-red-500">Error: Invalid data format</div>
                       ) : locations.length === 0 ? (
                         <div className="p-2 text-center">No locations found</div>
                       ) : (
                         locations.map((location: any) => (
                           <SelectItem key={location.id} value={location.id.toString()}>
                             {location.name}
                           </SelectItem>
                         ))
                       )}
                     </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="owner_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                    </FormControl>
                                         <SelectContent>
                       {!owners?.pages ? (
                         <div className="p-2 text-center">Loading owners...</div>
                       ) : owners.pages.length === 0 ? (
                         <div className="p-2 text-center">No owners found</div>
                       ) : (
                         owners.pages.map((page: any) =>
                           page?.data?.items?.map((owner: any) => (
                             <SelectItem key={owner.id} value={owner.id.toString()}>
                               {owner.name}
                             </SelectItem>
                           ))
                         )
                       )}
                     </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
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
                        <SelectValue placeholder="Select status" />
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

                     <div className="space-y-4">
             <div className="flex items-center gap-2">
               <Heading title="Specifications" description="Product specifications" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                 control={form.control}
                 name="specifications.brand"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Brand</FormLabel>
                     <FormControl>
                       <Input placeholder="Enter brand" {...field} />
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
                     <FormLabel>Color</FormLabel>
                     <FormControl>
                       <Input placeholder="Enter color" {...field} />
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
                     <FormLabel>Size</FormLabel>
                     <FormControl>
                       <Input placeholder="Enter size" {...field} />
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
                     <FormLabel>Weight</FormLabel>
                     <FormControl>
                       <Input placeholder="Enter weight" {...field} />
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
                       <Input placeholder="Enter material" {...field} />
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
                     <FormLabel>Warranty</FormLabel>
                     <FormControl>
                       <Input placeholder="Enter warranty" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
           </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
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
              {loading ? "Saving..." : productId ? "Update Product" : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
