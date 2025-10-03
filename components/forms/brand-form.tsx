"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBrand, useUpdateBrand } from "@/hooks/api/useBrand";
import { toast } from "@/components/ui/use-toast";

interface BrandFormProps {
  brand?: any;
  onSuccess?: () => void;
}

interface BrandFormData {
  name: string;
}

export default function BrandForm({ brand, onSuccess }: BrandFormProps) {
  const [loading, setLoading] = useState(false);
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BrandFormData>({
    defaultValues: {
      name: brand?.name || ""
    }
  });

  // Reset form when brand changes
  useEffect(() => {
    if (brand) {
      reset({ name: brand.name });
    } else {
      reset({ name: "" });
    }
  }, [brand, reset]);

  const onSubmit = async (data: BrandFormData) => {
    setLoading(true);
    
    try {
      if (brand) {
        // Update existing brand
        updateBrand(
          { id: brand.id, data },
          {
            onSuccess: () => {
              toast({
                variant: "success",
                title: "Brand berhasil diupdate!",
              });
              onSuccess?.();
            },
            onError: (error: any) => {
              toast({
                variant: "destructive",
                title: "Error!",
                description: error?.response?.data?.message || error.message || "Something went wrong",
              });
            },
            onSettled: () => {
              setLoading(false);
            }
          }
        );
      } else {
        // Create new brand
        createBrand(data, {
          onSuccess: () => {
            toast({
              variant: "success",
              title: "Brand berhasil dibuat!",
            });
            onSuccess?.();
          },
          onError: (error: any) => {
            toast({
              variant: "destructive",
              title: "Error!",
              description: error?.response?.data?.message || error.message || "Something went wrong",
            });
          },
          onSettled: () => {
            setLoading(false);
          }
        });
      }
    } catch (error) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Something went wrong",
      });
    }
  };

  const isLoading = loading || isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Brand</Label>
        <Input
          id="name"
          {...register("name", { 
            required: "Nama brand harus diisi",
            minLength: {
              value: 2,
              message: "Nama brand minimal 2 karakter"
            },
            maxLength: {
              value: 50,
              message: "Nama brand maksimal 50 karakter"
            }
          })}
          placeholder="Masukkan nama brand"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="submit" 
          disabled={isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? "Loading..." : brand ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
