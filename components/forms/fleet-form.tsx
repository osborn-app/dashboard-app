"use client";
import * as z from "zod";
import { useState } from "react";
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
import { useToast } from "../ui/use-toast";
import { convertEmptyStringsToNull } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEditFleet, usePostFleet } from "@/hooks/api/useFleet";
import MulitpleImageUpload, {
  MulitpleImageUploadResponse,
} from "../multiple-image-upload";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import axios from "axios";
import { omitBy } from "lodash";
const fileSchema = z.custom<any>(
  (val: any) => {
    // if (!(val instanceof FileList)) return false;
    if (val.length == 0) return false;
    for (let i = 0; i < val.length; i++) {
      const file = val[i];
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) return false; // Limit file types
    }
    return true;
  },
  {
    message:
      "Foto kosong. Pastikan file yang kamu pilih adalah tipe JPEG, PNG dan ukurannya kurang dari 2MB",
  },
);
const editFileSchema = z.custom<any>(
  (val: any) => {
    // if (!(val instanceof FileList)) return false;
    if (val.length == 0) return false;
    return true;
  },
  {
    message:
      "Foto kosong. Pastikan file yang kamu pilih adalah tipe JPEG, PNG dan ukurannya kurang dari 2MB",
  },
);
export const IMG_MAX_LIMIT = 3;
const formSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(3, { message: "Name must be at least 3 characters" }),
  photos: fileSchema,
  color: z
    .string({
      required_error: "Color is required",
      invalid_type_error: "Color must be a string",
    })
    .optional()
    .nullable(),
  plate_number: z
    .string({
      required_error: "plate number is required",
      invalid_type_error: "plate number must be a string",
    })
    .min(1, { message: "plate number is required" }),
  type: z.string({ required_error: "type is required" }).min(1, {
    message: "type is required",
  }),
});

const editFormSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(3, { message: "Name must be at least 3 characters" }),
  photos: editFileSchema,
  color: z
    .string({
      required_error: "Color is required",
      invalid_type_error: "Color must be a string",
    })
    .optional()
    .nullable(),
  plate_number: z
    .string({
      required_error: "plate number is required",
      invalid_type_error: "plate number must be a string",
    })
    .min(1, { message: "plate number is required" }),
  type: z.string({ required_error: "type is required" }).min(1, {
    message: "type is required",
  }),
});

type CustomerFormValues = z.infer<typeof formSchema> & {
  photos: MulitpleImageUploadResponse;
};
type FleetType = {
  id: string;
  name: string;
};
interface FleetFormProps {
  initialData: any | null;
  type: FleetType[];
  isEdit?: boolean | null;
}

export const FleetForm: React.FC<FleetFormProps> = ({
  initialData,
  type,
  isEdit,
}) => {
  const { fleetId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const title = !isEdit
    ? "Detail Fleet"
    : initialData
    ? "Edit Fleet"
    : "Create Fleet";
  const description = !isEdit
    ? ""
    : initialData
    ? "Edit a fleet"
    : "Add a new fleet";
  const toastMessage = initialData
    ? "fleet changed successfully!"
    : "fleet successfully created!";
  const action = initialData ? "Save changes" : "Create";
  const queryClient = useQueryClient();
  const { mutate: createFleet } = usePostFleet();
  const { mutate: editFleet } = useEditFleet(fleetId as string);
  const axiosAuth = useAxiosAuth();

  const defaultValues = initialData
    ? initialData
    : {
        name: "",
        type: "car",
        plate_number: "",
        photos: [],
      };

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(!initialData ? formSchema : editFormSchema),
    defaultValues,
  });

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

  const onSubmit = async (data: CustomerFormValues) => {
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
    if (initialData) {
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
      const newPayload = convertEmptyStringsToNull({
        ...data,
        photos: filteredURL,
      });

      editFleet(newPayload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["fleets"] });
          toast({
            variant: "success",
            title: toastMessage,
          });
          router.push(`/dashboard/fleets`);
        },
        onSettled: () => {
          setLoading(false);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Uh oh! ada sesuatu yang error",
            //@ts-ignore
            description: `error: ${error?.response?.data?.message}`,
          });
        },
      });
    } else {
      const uploadImageRes = await uploadImage(data?.photos);
      const filteredURL = uploadImageRes.map(
        (item: { download_url: string; upload_url: string }) =>
          item.download_url,
      );

      const newPayload = omitBy(
        { ...data, photos: filteredURL },
        (value) => value == "" || value == null,
      );
      createFleet(newPayload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["fleets"] });
          toast({
            variant: "success",
            title: toastMessage,
          });
          // router.refresh();
          router.push(`/dashboard/fleets`);
        },
        onSettled: () => {
          setLoading(false);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Uh oh! ada sesuatu yang error",
            //@ts-ignore
            description: `error: ${error?.response?.data?.message}`,
          });
        },
      });
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
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Nama
                  </FormLabel>
                  <FormControl className="disabled:opacity-100">
                    <Input
                      disabled={!isEdit || loading}
                      placeholder="Nama Fleet"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Tipe
                  </FormLabel>
                  <Select
                    disabled={!isEdit || loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl className="disabled:opacity-100">
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Pilih tipe"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* @ts-ignore  */}
                      {type.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
              name="plate_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Plat Nomor
                  </FormLabel>
                  <FormControl className="disabled:opacity-100">
                    <Input
                      disabled={!isEdit || loading}
                      placeholder="Plat Nomor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEdit ? (
              <FormItem>
                <FormLabel>Warna</FormLabel>
                <FormControl className="disabled:opacity-100">
                  <Input
                    disabled={!isEdit || loading}
                    value={initialData?.color ?? "-"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warna</FormLabel>
                    <FormControl className="disabled:opacity-100">
                      <Input
                        disabled={!isEdit || loading}
                        placeholder="Warna"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="relative label-required">
                  Foto fleet
                </FormLabel>
                <FormControl className="disabled:opacity-100">
                  <MulitpleImageUpload
                    onChange={field.onChange}
                    value={field.value}
                    onRemove={field.onChange}
                    disabled={!isEdit || loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isEdit && (
            <Button
              disabled={loading}
              className="ml-auto  bg-main hover:bg-main/90"
              type="submit"
            >
              {action}
            </Button>
          )}
        </form>
      </Form>
    </>
  );
};
