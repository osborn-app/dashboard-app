"use client";

import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfigProvider, DatePicker, Space } from "antd";
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
import { usePostCustomer, usePatchCustomer } from "@/hooks/api/useCustomer";
import { useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import axios from "axios";
import dayjs from "dayjs";
import MulitpleImageUpload, {
  MulitpleImageUploadResponse,
} from "../multiple-image-upload";
import { omitBy } from "lodash";
import { convertEmptyStringsToNull } from "@/lib/utils";
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
const formSchema = z.object({
  name: z
    .string({ required_error: "Nama diperlukan" })
    .min(3, { message: "Nama minimal harus 3 karakter" }),
  nik: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (val !== undefined && val !== null && val !== "") {
          return val.length == 16;
        }

        return true;
      },
      { message: "NIK harus 16 karakter" },
    ),
  email: z
    .string({ required_error: "Email diperlukan" })
    .email({ message: "Email harus valid" }),
  gender: z.string().optional().nullable(),
  password: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (val !== undefined && val !== null && val !== "") {
          return val.length >= 5;
        }

        return true;
      },
      { message: "Password minimal harus 5 karakter" },
    ),
  date_of_birth: z.any().optional().nullable(),
  emergency_phone_number: z
    .string({
      required_error: "Nomor Emergency diperlukan",
    })
    .min(10, { message: "Nomor Emergency minimal harus 10 digit" }),
  id_cards: fileSchema,
  phone_number: z
    .string({ required_error: "Nomor telepon diperlukan" })
    .min(10, { message: "Nomor Telepon minimal harus 10 digit" }),
});

const formEditSchema = z.object({
  name: z
    .string({ required_error: "Nama diperlukan" })
    .min(3, { message: "Nama minimal harus 3 karakter" }),
  // imgUrl: z.array(ImgSchema),
  nik: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (val !== undefined && val !== null && val !== "") {
          return val.length == 16;
        }

        return true;
      },
      { message: "NIK harus 16 karakter" },
    ),
  email: z
    .string({ required_error: "Email diperlukan" })
    .email({ message: "Email harus valid" }),
  gender: z.string().optional().nullable(),
  date_of_birth: z.any().optional().nullable(),
  emergency_phone_number: z
    .string({
      required_error: "Nomor Emergency diperlukan",
    })
    .min(10, { message: "Nomor Emergency minimal harus 10 digit" }),
  id_cards: editFileSchema,
  phone_number: z
    .string({ required_error: "Nomor telepon diperlukan" })
    .min(10, { message: "Nomor Emergency minimal harus 10 digit" }),
});

type CustomerFormValues = z.infer<typeof formSchema> & {
  id_cards: MulitpleImageUploadResponse;
};

interface CustomerFormProps {
  initialData: any | null;
  categories: any;
  isEdit?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  categories,
  isEdit,
}) => {
  const { customerId } = useParams();

  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const title = !isEdit
    ? "Detail Customer"
    : initialData
    ? "Edit Customer"
    : "Create Customer";
  const description = !isEdit
    ? ""
    : initialData
    ? "Edit a customer"
    : "Add a new customer";
  const toastMessage = initialData
    ? "Customer changed successfully!"
    : "Customer created successfully!";
  const action = initialData ? "Save changes" : "Create";
  const queryClient = useQueryClient();

  const { mutate: createCustomer } = usePostCustomer();
  const { mutate: updateCustomer } = usePatchCustomer(customerId as string);
  const axiosAuth = useAxiosAuth();

  const defaultValues = initialData
    ? {
        name: initialData?.name,
        nik: initialData?.nik,
        email: initialData?.email,
        date_of_birth: initialData?.date_of_birth,
        gender: initialData?.gender,
        id_cards: initialData?.id_cards,
        phone_number: initialData?.phone_number,
        emergency_phone_number: initialData?.emergency_phone_number,
      }
    : {
        name: "",
        nik: "",
        email: "",
        date_of_birth: "",
        gender: "",
        id_cards: [],
        phone_number: "",
        emergency_phone_number: "",
      };

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(!initialData ? formSchema : formEditSchema),
    defaultValues,
  });

  const uploadImage = async (file: any) => {
    const file_names = [];
    for (let i = 0; i < file?.length; i++) {
      file_names.push(file?.[i].name);
    }

    const response = await axiosAuth.post("/storages/presign/list", {
      file_names: file_names,
      folder: "user",
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
    for (let i = 0; i < data?.id_cards?.length; i++) {
      if (data?.id_cards[i]?.photo) {
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
        const uploadImageRes = await uploadImage(data?.id_cards);

        filteredURL = uploadImageRes?.map(
          (item: { download_url: string; upload_url: string }) =>
            item.download_url,
        );
      } else {
        filteredURL = data?.id_cards?.map((item: any) => item.photo);
      }
      const newData: any = { ...data };
      newData.date_of_birth = data?.date_of_birth
        ? dayjs(data?.date_of_birth).format("YYYY-MM-DD")
        : "";

      const newPayload = convertEmptyStringsToNull({
        ...newData,
        id_cards: filteredURL,
      });

      updateCustomer(newPayload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["customers"] });
          toast({
            variant: "success",
            title: toastMessage,
          });
          router.refresh();
          router.push(`/dashboard/customers`);
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
      const uploadImageRes = await uploadImage(data?.id_cards);
      const filteredURL = uploadImageRes.map(
        (item: { download_url: string; upload_url: string }) =>
          item.download_url,
      );
      const payload = {
        ...data,
        date_of_birth: data?.date_of_birth
          ? dayjs(data?.date_of_birth).format("YYYY-MM-DD")
          : "",
        id_cards: filteredURL,
      };

      const newPayload = omitBy(
        payload,
        (value) => value === undefined || value === null || value === "",
      );
      createCustomer(newPayload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["customers"] });
          toast({
            variant: "success",
            title: toastMessage,
          });
          router.refresh();
          router.push(`/dashboard/customers`);
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
                      placeholder="Nama Customer"
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
            {!initialData && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl className="disabled:opacity-100">
                      <Input
                        // type="password"
                        disabled={loading}
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
            <FormField
              control={form.control}
              name="emergency_phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Nomor Emergency
                  </FormLabel>
                  <FormControl className="disabled:opacity-100">
                    <Input
                      disabled={!isEdit || loading}
                      placeholder="Nomor Emergency"
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
                <FormLabel>NIK</FormLabel>
                <FormControl className="disabled:opacity-100">
                  <Input disabled value={initialData?.nik ?? "-"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="nik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIK</FormLabel>
                    <FormControl className="disabled:opacity-100">
                      <Input
                        disabled={!isEdit || loading}
                        placeholder="NIK"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
                          <SelectValue
                            defaultValue={field.value ?? ""}
                            placeholder="Pilih jenis kelamin"
                          />
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
            name="id_cards"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="relative label-required">
                  Foto KTP
                </FormLabel>
                <FormControl className="disabled:opacity-100">
                  <MulitpleImageUpload
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
