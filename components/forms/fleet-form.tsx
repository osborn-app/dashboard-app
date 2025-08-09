"use client";
import * as z from "zod";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { cn, convertEmptyStringsToNull } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEditFleet, usePostFleet } from "@/hooks/api/useFleet";
import MulitpleImageUpload, {
  MulitpleImageUploadResponse,
} from "../multiple-image-upload";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import axios from "axios";
import { isEmpty, omitBy } from "lodash";
import { useGetInfinityLocation } from "@/hooks/api/useLocation";
import { useDebounce } from "use-debounce";
import { Select as AntdSelect, Space } from "antd";
import { NumericFormat } from "react-number-format";
import { useGetDetailOwner, useGetInfinityOwners } from "@/hooks/api/useOwner";
import OwnerDetail from "./section/owner-detail";
import { useUser } from "@/context/UserContext";

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
      "Foto kosong. Pastikan file yang kamu pilih adalah tipe JPEG, PNG.",
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
      "Foto kosong. Pastikan file yang kamu pilih adalah tipe JPEG, PNG.",
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
  price: z.coerce.string({ required_error: "price is required" }).min(1, {
    message: "price is required",
  }),
  location_id: z.string().min(1, { message: "Tolong pilih lokasi" }),
  owner_id: z.number().nullable(),
  status: z.string().min(1, { message: "status is required" }),
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
  price: z.coerce.string({ required_error: "price is required" }).min(1, {
    message: "price is required",
  }),
  location_id: z.string().min(1, { message: "Tolong pilih lokasi" }),
  owner_id: z.number().nullable(),
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
  status: z.string().min(1, { message: "status is required" }),
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
  statusOptions: { id: string; name: string }[];
  isEdit?: boolean | null;
}

export const FleetForm: React.FC<FleetFormProps> = ({
  initialData,
  type,
  isEdit,
  statusOptions,
}) => {
  const { fleetId } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDetailOwner, setShowDetailOwner] = useState(false);
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
  const [searchLocation, setSearchLocation] = useState("");
  const [searchOwner, setSearchOwner] = useState("");
  const [searchLocationDebounce] = useDebounce(searchLocation, 500);
  const [searchOwnerDebounce] = useDebounce(searchOwner, 500);

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

  const defaultValues = initialData
    ? {
        name: initialData?.name,
        type: initialData?.type,
        plate_number: initialData?.plate_number,
        photos: initialData?.photos,
        price: initialData?.price,
        location_id: initialData?.location?.id?.toString(),
        color: initialData?.color,
        owner_id: initialData?.owner?.id,
        commission: initialData?.commission,
        status: initialData?.status,
      }
    : {
        name: "",
        type: "car",
        plate_number: "",
        photos: [],
        price: "",
        location_id: "",
        color: "",
        owner_id: null,
        commission: { transgo: 0, owner: 0, partner: 0 },
        status: "available",
      };

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(!initialData ? formSchema : editFormSchema),
    defaultValues,
  });

  const formErrors = form.formState.errors;

  const { data: ownerData, isFetching: isFetchingOwner } = useGetDetailOwner(
    form.getValues("owner_id") || 0,
  );

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
        price: Number(data.price.replace(/,/g, "")),
        location_id: Number(data?.location_id),
        owner_id: data?.owner_id,
      });

      editFleet(newPayload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["fleets"] });
          toast({
            variant: "success",
            title: toastMessage,
          });
          router.refresh();
          router.push("/dashboard/fleets");
        },
        onSettled: () => {
          setLoading(false);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Uh oh! ada sesuatu yang error",
            description: `error: ${
              // @ts-ignore
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

      const newPayload = omitBy(
        {
          ...data,
          photos: filteredURL,
          price: Number(data.price.replace(/,/g, "")),
          location_id: Number(data.location_id),
          owner_id: data.owner_id,
        },
        (value) => value == "" || value == null,
      );
      createFleet(newPayload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["fleets"] });
          toast({
            variant: "success",
            title: toastMessage,
          });
          router.refresh();
          router.push("/dashboard/fleets");
        },
        onSettled: () => {
          setLoading(false);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Uh oh! ada sesuatu yang error",
            description: `error: ${
              // @ts-ignore
              error?.response?.data?.message || error?.message
            }`,
          });
        },
      });
    }
  };

  const Option = AntdSelect;
  const handleScroll = (
    event: React.UIEvent<HTMLDivElement>,
    type: "location" | "owner",
  ) => {
    const target = event.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      type === "location" ? fetchNextLocations() : fetchNextOwners();
    }
  };

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
                      value={field.value ?? ""}
                      onChange={(e) => {
                        e.target.value = e.target.value.trimStart();
                        field.onChange(e.target.value);
                      }}
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
                      value={field.value ?? ""}
                      onChange={(e) => {
                        e.target.value = e.target.value.trimStart();
                        field.onChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Status
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
                          placeholder="Pilih status"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        onChange={(e) => {
                          e.target.value = e.target.value.trimStart();
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!isEdit ? (
              <FormItem>
                <FormLabel>Harga</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 ">
                      Rp.
                    </span>
                    <NumericFormat
                      disabled={!isEdit || loading}
                      customInput={Input}
                      type="text"
                      className="pl-9 disabled:opacity-90"
                      allowLeadingZeros
                      thousandSeparator=","
                      value={initialData?.price}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="relative label-required">
                      Harga
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 ">
                          Rp.
                        </span>
                        <NumericFormat
                          disabled={!isEdit || loading}
                          customInput={Input}
                          type="text"
                          className="pl-9 disabled:opacity-90"
                          allowLeadingZeros
                          thousandSeparator=","
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!isEdit ? (
              <FormItem>
                <FormLabel>Lokasi</FormLabel>
                <FormControl className="disabled:opacity-100">
                  <Input
                    disabled={!isEdit || loading}
                    value={initialData?.location?.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ) : (
              <FormField
                name="location_id"
                control={form.control}
                render={({ field }) => {
                  return (
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
                          {isEdit && (
                            <Option
                              value={initialData?.location?.id?.toString()}
                            >
                              {initialData?.location?.name}
                            </Option>
                          )}
                          {locations?.pages.map((page: any, pageIndex: any) =>
                            page.data.items.map((item: any, itemIndex: any) => {
                              return (
                                <Option
                                  key={item.id}
                                  value={item.id.toString()}
                                >
                                  {item.name}
                                </Option>
                              );
                            }),
                          )}

                          {isFetchingNextLocations && (
                            <Option disabled>
                              <p className="px-3 text-sm">loading</p>
                            </Option>
                          )}
                        </AntdSelect>
                      </FormControl>
                      <FormMessage />
                    </Space>
                  );
                }}
              />
            )}
          </div>

          {!isEdit ? (
            <FormItem>
              <FormLabel>Owner</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl className="disabled:opacity-100">
                  <Input
                    disabled={!isEdit || loading}
                    value={initialData?.owner?.name}
                  />
                </FormControl>
                {user?.role !== "owner" && (
                  <Button
                    className={cn(
                      buttonVariants({ variant: "main" }),
                      "w-[65px] h-[36px] !py-1.5",
                    )}
                    disabled={
                      !form.getFieldState("owner_id").isDirty &&
                      isEmpty(form.getValues("owner_id")?.toString())
                    }
                    type="button"
                    onClick={() => setShowDetailOwner(true)}
                  >
                    Lihat
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          ) : (
            <FormField
              name="owner_id"
              control={form.control}
              render={({ field }) => {
                return (
                  <Space size={12} direction="vertical" className="w-full">
                    <FormLabel>Owner</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <AntdSelect
                          showSearch
                          value={field.value}
                          placeholder="Pilih Owner"
                          style={{ width: "100%", height: "36px" }}
                          onSearch={setSearchOwner}
                          onChange={(value) => {
                            if (value === undefined) {
                              field.onChange(null);
                            } else {
                              field.onChange(value);
                            }
                          }}
                          allowClear
                          onPopupScroll={(event) =>
                            handleScroll(event, "owner")
                          }
                          filterOption={false}
                          notFoundContent={
                            isFetchingNextLocations ? (
                              <p className="px-3 text-sm">loading</p>
                            ) : null
                          }
                        >
                          {isEdit && (
                            <Option value={initialData?.owner?.id}>
                              {initialData?.owner?.name}
                            </Option>
                          )}
                          {owners?.pages.map((page: any) =>
                            page.data.items.map((item: any) => {
                              return (
                                <Option key={item.id} value={item.id}>
                                  {item.name}
                                </Option>
                              );
                            }),
                          )}

                          {isFetchingNextOwners && (
                            <Option disabled>
                              <p className="px-3 text-sm">loading</p>
                            </Option>
                          )}
                        </AntdSelect>
                      </FormControl>
                      {user?.role !== "owner" && (
                        <Button
                          className={cn(
                            buttonVariants({ variant: "main" }),
                            "w-[65px] h-[36px] !py-1.5",
                          )}
                          disabled={
                            !form.getFieldState("owner_id").isDirty &&
                            isEmpty(form.getValues("owner_id")?.toString())
                          }
                          type="button"
                          onClick={() => setShowDetailOwner(true)}
                        >
                          Lihat
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </Space>
                );
              }}
            />
          )}

          {user?.role !== "owner" &&
            !isEmpty(form.getValues("owner_id")?.toString()) && (
              <div className="md:grid md:grid-cols-3 gap-5">
                {!isEdit ? (
                  <FormItem>
                    <FormLabel>Komisi Owner %</FormLabel>
                    <FormControl>
                      <NumericFormat
                        disabled={!isEdit || loading}
                        customInput={Input}
                        type="text"
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined || floatValue <= 100
                        }
                        thousandSeparator
                        allowNegative={false}
                        className="disabled:opacity-90"
                        placeholder="Masukkan Komisi (contoh: 70 %)"
                        value={initialData?.commission?.owner}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ) : (
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
                            disabled={!isEdit || loading}
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
                      </FormItem>
                    )}
                  />
                )}
                {!isEdit ? (
                  <FormItem>
                    <FormLabel>Komisi Partner %</FormLabel>
                    <FormControl>
                      <NumericFormat
                        disabled={!isEdit || loading}
                        customInput={Input}
                        type="text"
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined || floatValue <= 100
                        }
                        thousandSeparator
                        allowNegative={false}
                        placeholder="Masukkan Komisi (contoh: 70 %)"
                        className="disabled:opacity-90"
                        value={initialData?.commission?.partner}
                      />
                    </FormControl>
                  </FormItem>
                ) : (
                  <FormField
                    control={form.control}
                    name="commission.partner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Komisi Partner %</FormLabel>
                        <FormControl>
                          <NumericFormat
                            disabled={!isEdit || loading}
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
                )}

                {!isEdit ? (
                  <FormItem>
                    <FormLabel>Komisi Transgo % (Otomatis)</FormLabel>
                    <FormControl>
                      <NumericFormat
                        disabled={!isEdit || loading}
                        customInput={Input}
                        type="text"
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined || floatValue <= 100
                        }
                        thousandSeparator
                        allowNegative={false}
                        placeholder="Masukkan Komisi (contoh: 70 %)"
                        className="disabled:opacity-90"
                        value={initialData?.commission?.transgo}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ) : (
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
                )}

                <FormMessage className="col-span-3">
                  {/* @ts-ignore */}
                  {formErrors.commission?.owner?.partner?.message}
                </FormMessage>
              </div>
            )}

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

      {showDetailOwner && !isFetchingOwner && (
        <OwnerDetail
          data={ownerData?.data}
          onClose={() => setShowDetailOwner(false)}
        />
      )}
    </>
  );
};
