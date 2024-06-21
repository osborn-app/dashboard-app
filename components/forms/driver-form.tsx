"use client";
import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { useEditDriver, usePostDriver } from "@/hooks/api/useDriver";
import { useQueryClient } from "@tanstack/react-query";
import ImageUpload, { ImageUploadResponse } from "../image-upload";
import axios from "axios";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import { ConfigProvider, DatePicker, Space } from "antd";
import dayjs from "dayjs";
import { isEmpty, omitBy } from "lodash";
import { convertEmptyStringsToNull } from "@/lib/utils";

const fileSchema = z.custom<File>(
  (val: any) => {
    if (!val) return false;
    if (!(val.data instanceof File)) return false;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(val.data.type)) return false; // Limit file types
    return true;
  },
  {
    message:
      "Foto kosong. Pastikan file yang kamu pilih adalah tipe JPEG, PNG dan ukurannya kurang dari 2MB.",
  },
);
const editFileSchema = z.custom<File>(
  (val: any) => {
    if (!val) return false;

    if (!(val.data instanceof File) && isEmpty(val)) return false;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (isEmpty(val) && !allowedTypes.includes(val.data.type)) return false; // Limit file types
    return true;
  },
  {
    message:
      "Foto kosong. Pastikan file yang kamu pilih adalah tipe JPEG, PNG dan ukurannya kurang dari 2MB.",
  },
);
const formSchema = z.object({
  name: z
    .string({ required_error: "Nama diperlukan" })
    .min(3, { message: "Nama minimal harus 3 karakter" }),
  // imgUrl: z.array(ImgSchema),
  // nik: z.string().min(16, { message: "NIK minimal harus 16 karakter" }),
  email: z
    .string({ required_error: "Email diperlukan" })
    .email({ message: "Email harus valid" }),
  gender: z.string().optional().nullable(),
  password: z
    .string({ required_error: "Password diperlukan" })
    .min(5, { message: "Password minimal harus 5" }),
  date_of_birth: z.any().optional().nullable(),
  photo_profile: fileSchema,
  phone_number: z
    .string({ required_error: "Nomor telepon diperlukan" })
    .min(10, { message: "Nomor Emergency minimal harus 10 digit" }),
});

const formEditSchema = z.object({
  name: z
    .string({ required_error: "Nama diperlukan" })
    .min(3, { message: "Nama minimal harus 3 karakter" }),
  // imgUrl: z.array(ImgSchema),
  // nik: z.string().min(16, { message: "NIK minimal harus 16 karakter" }),
  email: z
    .string({ required_error: "Email diperlukan" })
    .email({ message: "Email harus valid" }),
  date_of_birth: z.any().optional(),
  photo_profile: editFileSchema,
  phone_number: z
    .string({ required_error: "Nomor telepon diperlukan" })
    .min(10, { message: "Nomor Emergency minimal harus 10 digit" }),
  password: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val !== undefined && val !== null && val !== "") {
          return val.length >= 5;
        }

        return true;
      },
      { message: "Password minimal harus 5 karakter" },
    ),
  gender: z.string().optional().nullable(),
});

type DriverFormValues = z.infer<typeof formSchema> & {
  photo_profile: ImageUploadResponse;
};

interface DriverFormProps {
  initialData: any | null;
  categories: any;
  isEdit?: boolean;
}

export const DriverForm: React.FC<DriverFormProps> = ({
  initialData,
  categories,
  isEdit,
}) => {
  const { driverId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const title = !isEdit
    ? "Detail Driver"
    : initialData
    ? "Edit Driver"
    : "Create Driver";
  const description = !isEdit
    ? ""
    : initialData
    ? "Edit a Driver"
    : "Add a new driver";
  const toastMessage = initialData
    ? "Driver changed successfully!"
    : "Driver created successfully!";
  const action = initialData ? "Save changes" : "Create";
  const queryClient = useQueryClient();

  const axiosAuth = useAxiosAuth();
  const { mutate: createDriver } = usePostDriver();
  const { mutate: updateDriver } = useEditDriver(driverId as string);

  const defaultValues = initialData
    ? {
        name: initialData?.name,
        // nik: initialData?.nik,
        email: initialData?.email,
        date_of_birth: initialData?.date_of_birth,
        gender: initialData?.gender,
        photo_profile: initialData?.photo_profile,
        phone_number: initialData?.phone_number,
      }
    : {
        date_of_birth: null,
      };

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(!initialData ? formSchema : formEditSchema),
    defaultValues,
  });

  const uploadImage = async (file: ImageUploadResponse | undefined) => {
    if (!file?.data) {
      return undefined;
    }

    const presignQuery = {
      file_name: file?.data?.name,
      folder: "user",
    };

    const response = await axiosAuth.get("/storages/presign", {
      params: presignQuery,
    });
    await axios.put(response.data.upload_url, file?.data, {
      headers: {
        "Content-Type": file?.data?.type,
      },
    });

    return response.data;
  };

  const onSubmit = async (data: DriverFormValues) => {
    setLoading(true);
    if (initialData) {
      const uploadImageResponse = await uploadImage(data?.photo_profile);
      const newData: any = { ...data };
      newData.date_of_birth = data?.date_of_birth
        ? dayjs(data?.date_of_birth).format("YYYY-MM-DD")
        : "";

      if (uploadImageResponse) {
        newData.photo_profile = uploadImageResponse.download_url;
      }
      const newPayload = convertEmptyStringsToNull(
        omitBy(newData, (val) => val === undefined),
      );

      updateDriver(newPayload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["drivers"] });
          toast({
            variant: "success",
            title: toastMessage,
          });
          router.push(`/dashboard/drivers`);
        },
        onSettled: () => {
          setLoading(false);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Uh oh! ada sesuatu yang error",
            // @ts-ignore
            description: `error: ${error?.response?.data?.message}`,
          });
        },
      });
    } else {
      const uploadImageResponse = await uploadImage(data?.photo_profile);
      const payload = {
        ...data,
        photo_profile: uploadImageResponse.download_url,
        date_of_birth: data?.date_of_birth
          ? dayjs(data?.date_of_birth).format("YYYY-MM-DD")
          : "",
      };
      const newPayload = omitBy(
        payload,
        (value) => value === "" || value === undefined || value === null,
      );
      createDriver(newPayload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["drivers"] });
          toast({
            variant: "success",
            title: toastMessage,
          });
          // router.refresh();
          router.push(`/dashboard/drivers`);
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
                      placeholder="Nama Driver"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Email
                  </FormLabel>
                  <FormControl className="disabled:opacity-100">
                    <Input
                      disabled={!isEdit || loading}
                      placeholder="Email"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="relative label-required">
                      Password
                    </FormLabel>
                    <FormControl className="disabled:opacity-100">
                      <Input
                        // type="password"
                        disabled={!isEdit || loading}
                        placeholder="Password"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Nomor Telepon
                  </FormLabel>
                  <FormControl className="disabled:opacity-100">
                    <Input
                      disabled={!isEdit || loading}
                      placeholder="Nomor Telepon"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEdit ? (
              <FormItem>
                <FormLabel>Jenis Kelamin</FormLabel>
                <FormControl className="disabled:opacity-100">
                  <Input
                    disabled
                    value={
                      initialData?.gender === "male"
                        ? "Laki-Laki"
                        : initialData?.gender === "female"
                        ? "Perempuan"
                        : "-"
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <Select
                      disabled={!isEdit || loading}
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      defaultValue={field.value ?? ""}
                    >
                      <FormControl className="disabled:opacity-100">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* @ts-ignore  */}
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!isEdit ? (
              <FormItem>
                <FormLabel>Tanggal Lahir</FormLabel>
                <FormControl className="disabled:opacity-100">
                  <Input disabled value={initialData?.date_of_birth ?? "-"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            ) : (
              <Controller
                control={form.control}
                name="date_of_birth"
                render={({ field: { onChange, onBlur, value, ref } }) => {
                  return (
                    <ConfigProvider>
                      <Space size={12} direction="vertical">
                        <FormLabel>Tanggal Lahir</FormLabel>
                        <DatePicker
                          style={{ width: "100%" }}
                          disabled={!isEdit || loading}
                          height={40}
                          className="p"
                          onChange={onChange} // send value to hook form
                          onBlur={onBlur}
                          value={value ? dayjs(value, "YYYY-MM-DD") : undefined}
                          format={"YYYY-MM-DD"}
                        />
                      </Space>
                    </ConfigProvider>
                  );
                }}
              />
            )}
          </div>
          <FormField
            control={form.control}
            name="photo_profile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="relative label-required">
                  Foto Driver
                </FormLabel>
                <FormControl className="disabled:opacity-100">
                  <ImageUpload
                    disabled={!isEdit || loading}
                    onChange={field.onChange}
                    value={field.value}
                    onRemove={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isEdit && (
            <Button
              disabled={loading}
              className="ml-auto bg-main hover:bg-main/90"
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
