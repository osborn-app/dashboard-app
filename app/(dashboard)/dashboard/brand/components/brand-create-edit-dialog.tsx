"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBrand, useUpdateBrand } from "@/hooks/api/useBrand";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";

interface BrandCreateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: any;
}

interface BrandFormData {
  name: string;
}

export default function BrandCreateEditDialog({ 
  open, 
  onOpenChange, 
  brand 
}: BrandCreateEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const { mutate: createBrand } = useCreateBrand();
  const { mutate: updateBrand } = useUpdateBrand();
  
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
              onOpenChange(false);
            },
            onError: (error) => {
              toast({
                variant: "destructive",
                title: "Error!",
                description: error.message,
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
            onOpenChange(false);
          },
          onError: (error) => {
            toast({
              variant: "destructive",
              title: "Error!",
              description: error.message,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {brand ? "Edit Brand" : "Create Brand"}
          </DialogTitle>
        </DialogHeader>
        
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
                }
              })}
              placeholder="Masukkan nama brand"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : brand ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
