"use client";
import * as z from "zod";
import dayjs from "dayjs";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ConfigProvider, DatePicker, Space } from "antd";
import { PencilLine } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import isEmpty from "lodash/isEmpty";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "../ui/use-toast";
import { useGetInfinityCustomers } from "@/hooks/api/useCustomer";
import { useQueryClient } from "@tanstack/react-query";
import { useGetInfinityFleets } from "@/hooks/api/useFleet";
import { Textarea } from "@/components/ui/textarea";
import { useGetInfinityDrivers } from "@/hooks/api/useDriver";
import { useEditRequest, usePostRequest } from "@/hooks/api/useRequest";
import locale from "antd/locale/id_ID";
import "dayjs/locale/id";
import { Select as AntdSelect } from "antd";

import { PreviewImage } from "../modal/preview-image";
import { useDebounce } from "use-debounce";
import { convertTime } from "@/lib/utils";
import CustomImage from "../custom-image";
dayjs.locale("id");

// perlu dipisah
const formSchema = z.object({
  fleet: z.string().min(1, { message: "Tolong pilih fleet" }),
  // imgUrl: z.array(ImgSchema),
  customer: z.string().min(1, { message: "Tolong pilih customer" }),
  pic: z.string().min(1, { message: "Tolong pilih pic" }),
  time: z.coerce.date({ required_error: "Tolong masukkan Waktu" }),
  type: z.string().min(1, { message: "Tipe diperlukan" }),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  is_self_pickup: z.boolean(),
  distance: z.coerce.number().gte(0, "Jarak minimal 0 KM"),
});

type RequestFormValues = z.infer<typeof formSchema>;

interface RequestFormProps {
  initialData: any | null;
  isEdit?: boolean;
}

export const RequestForm: React.FC<RequestFormProps> = ({
  initialData,
  isEdit,
}) => {
  const { requestId } = useParams();

  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
  const [searchFleetTerm, setSearchFleetTerm] = useState("");
  const [searchDriverTerm, setSearchDriverTerm] = useState("");
  const [searchCustomerDebounce] = useDebounce(searchCustomerTerm, 500);
  const [searchFleetDebounce] = useDebounce(searchFleetTerm, 500);
  const [searchDriverDebounce] = useDebounce(searchDriverTerm, 500);

  const {
    data: customers,
    fetchNextPage: fetchNextCustomers,
    hasNextPage: hasNextCustomers,
    isFetchingNextPage: isFetchingNextCustomers,
  } = useGetInfinityCustomers(searchCustomerDebounce);

  const {
    data: fleets,
    fetchNextPage: fetchNextFleets,
    hasNextPage: hasNextFleets,
    isFetchingNextPage: isFetchingNextFleets,
  } = useGetInfinityFleets(searchFleetDebounce);

  // const { data: fleets } = useGetFleets({ limit: 10, page: 1 });
  const {
    data: drivers,
    fetchNextPage: fetchNextDrivers,
    hasNextPage: hasNextDrivers,
    isFetchingNextPage: isFetchingNextDrivers,
  } = useGetInfinityDrivers(searchDriverDebounce);

  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = !isEdit
    ? "Detail Request"
    : initialData
    ? "Edit Request"
    : "Create Request";
  const description = !isEdit
    ? ""
    : initialData
    ? "Edit a request for driver"
    : "Add a new request for driver";
  const toastMessage = initialData
    ? "Request Task berhasil diubah!"
    : "Request Task berhasil dibuat!";
  const action = initialData ? "Save changes" : "Create";
  const queryClient = useQueryClient();
  const [checked, setChecked] = useState(false);
  const type = [
    { id: "delivery", name: checked ? "Pengambilan" : "Pengantaran" },
    { id: "pick_up", name: checked ? "Pengembalian" : "Penjemputan" },
  ];
  const [content, setContent] = useState(null);

  const { mutate: createRequest } = usePostRequest();
  const { mutate: updateRequest } = useEditRequest(requestId as string);

  const predefinedDesc = `Jumlah penagihan ke Customer: Rp. xxx.xxx \n\n\n*tolong tambahkan detail lainnya jika ada...
`;
  const predefinedAddress = `Tuliskan alamat disini: \n\n\nLink Google Maps:`;
  const defaultValues = initialData
    ? {
        customer: initialData?.customer?.id?.toString(),
        pic: initialData?.driver?.id?.toString(),
        fleet: initialData?.fleet?.id?.toString(),
        time: initialData?.start_date,
        type: initialData?.type,
        address: initialData?.address,
        description: initialData?.description,
        is_self_pickup: initialData?.is_self_pickup,
        distance: initialData?.distance,
      }
    : {
        customer: "",
        pic: "",
        fleet: "",
        type: "",
        address: predefinedAddress,
        description: predefinedDesc,
        is_self_pickup: false,
        distance: 0,
      };
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  let wording = "";
  if (initialData?.type === "delivery") {
    if (initialData?.is_self_pickup) {
      wording = "Pengambilan";
    } else {
      wording = "Pengantaran";
    }
  } else if (initialData?.type === "pick_up") {
    if (initialData?.is_self_pickup) {
      wording = "Pengembalian";
    } else {
      wording = "Penjemputan";
    }
  }

  const endlogs = initialData?.logs?.filter((log: any) => log.type === "end");

  const onSubmit = async (data: RequestFormValues) => {
    setLoading(true);
    const payload = {
      customer_id: Number(data?.customer),
      fleet_id: Number(data?.fleet),
      driver_id: Number(data?.pic),
      start_date: dayjs(data?.time).toISOString(),
      type: data?.type,
      address: data?.address,
      description: data?.description,
      is_self_pickup: data?.is_self_pickup,
      distance: data?.distance,
    };
    // const newPayload = omitBy(
    //   payload,
    //   (value) =>
    //     value == predefinedAddress ||
    //     value == predefinedDesc ||
    //     value == "" ||
    //     value == null,
    // );

    if (initialData) {
      updateRequest(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["requests"] });
          toast({
            variant: "success",
            title: toastMessage,
          });
          router.refresh();
          router.push(`/dashboard/requests`);
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
      createRequest(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["requests"] });
          toast({
            variant: "success",
            title: toastMessage,
            description: "Driver akan menerima notifikasi request ini.",
          });
          router.refresh();
          router.push(`/dashboard/requests`);
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
  const onHandlePreview = (file: any) => {
    setContent(file);
    setOpen(true);
  };

  // const triggerImgUrlValidation = () => form.trigger("imgUrl");
  function makeUrlsClickable(str: string) {
    const urlRegex = /(\bhttps?:\/\/[^\s]+(\.[^\s]+)*(\/[^\s]*)?\b)/g;
    return str.replace(
      urlRegex,
      (url: any) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:blue">${url}</a>`,
    );
  }

  const Option = AntdSelect;
  const handleScrollCustomers = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      fetchNextCustomers();
    }
  };

  const handleScrollFleets = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      fetchNextFleets();
    }
  };

  const handleScrollDrivers = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      fetchNextDrivers();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {!isEdit && (
          <Button
            disabled={loading}
            size="default"
            variant="main"
            onClick={() => router.push(`/dashboard/requests/${requestId}/edit`)}
          >
            <PencilLine />
            Edit
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
            {!isEdit ? (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <FormControl className="disabled:opacity-100">
                  <Input
                    disabled={!isEdit || loading}
                    value={initialData?.customer?.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ) : (
              <FormField
                name="customer"
                control={form.control}
                render={({ field }) => (
                  <Space size={12} direction="vertical">
                    <FormLabel className="relative label-required">
                      Customer
                    </FormLabel>
                    <FormControl>
                      <AntdSelect
                        showSearch
                        value={field.value}
                        placeholder="Pilih Customer"
                        style={{ width: "100%" }}
                        onSearch={setSearchCustomerTerm}
                        onChange={field.onChange}
                        onPopupScroll={handleScrollCustomers}
                        filterOption={false}
                        notFoundContent={
                          isFetchingNextCustomers ? (
                            <p className="px-3 text-sm">loading</p>
                          ) : null
                        }
                      >
                        {isEdit && (
                          <Option value={initialData?.customer?.id?.toString()}>
                            {initialData?.customer?.name}
                          </Option>
                        )}
                        {customers?.pages.map((page: any, pageIndex: any) =>
                          page.data.items.map((item: any, itemIndex: any) => {
                            return (
                              <Option key={item.id} value={item.id.toString()}>
                                {item.name}
                              </Option>
                            );
                          }),
                        )}

                        {isFetchingNextCustomers && (
                          <Option disabled>
                            <p className="px-3 text-sm">loading</p>
                          </Option>
                        )}
                      </AntdSelect>
                    </FormControl>
                    <FormMessage />
                  </Space>
                )}
              />
            )}
            {!isEdit ? (
              <FormItem>
                <FormLabel>Fleet</FormLabel>
                <FormControl className="disabled:opacity-100">
                  <Input
                    disabled={!isEdit || loading}
                    value={initialData?.fleet?.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ) : (
              <FormField
                name="fleet"
                control={form.control}
                render={({ field }) => (
                  <Space size={12} direction="vertical">
                    <FormLabel className="relative label-required">
                      Fleet
                    </FormLabel>
                    <FormControl>
                      <AntdSelect
                        showSearch
                        value={field.value}
                        placeholder="Pilih Fleet"
                        style={{ width: "100%" }}
                        onSearch={setSearchFleetTerm}
                        onChange={field.onChange}
                        onPopupScroll={handleScrollFleets}
                        filterOption={false}
                        notFoundContent={
                          isFetchingNextFleets ? (
                            <p className="px-3 text-sm">loading</p>
                          ) : null
                        }
                      >
                        {isEdit && (
                          <Option value={initialData?.fleet?.id?.toString()}>
                            {initialData?.fleet?.name}
                          </Option>
                        )}
                        {fleets?.pages.map((page: any, pageIndex: any) =>
                          page.data.items.map((item: any, itemIndex: any) => {
                            return (
                              <Option key={item.id} value={item.id.toString()}>
                                {item.name}
                              </Option>
                            );
                          }),
                        )}

                        {isFetchingNextFleets && (
                          <Option disabled>
                            <p className="px-3 text-sm">loading</p>
                          </Option>
                        )}
                      </AntdSelect>
                    </FormControl>
                    <FormMessage />
                  </Space>
                )}
              />
            )}

            {!isEdit ? (
              <FormItem>
                <FormLabel>PIC</FormLabel>
                <FormControl className="disabled:opacity-100">
                  <Input
                    disabled={!isEdit || loading}
                    value={initialData?.driver?.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ) : (
              <FormField
                name="pic"
                control={form.control}
                render={({ field }) => (
                  <Space size={12} direction="vertical">
                    <FormLabel className="relative label-required">
                      PIC
                    </FormLabel>
                    <FormControl>
                      <AntdSelect
                        showSearch
                        value={field.value}
                        placeholder="Pilih PIC"
                        style={{ width: "100%" }}
                        onSearch={setSearchDriverTerm}
                        onChange={field.onChange}
                        onPopupScroll={handleScrollDrivers}
                        filterOption={false}
                        notFoundContent={
                          isFetchingNextDrivers ? (
                            <p className="px-3 text-sm">loading</p>
                          ) : null
                        }
                      >
                        {isEdit && (
                          <Option value={initialData?.driver?.id?.toString()}>
                            {initialData?.driver?.name}
                          </Option>
                        )}
                        {drivers?.pages.map((page: any, pageIndex: any) =>
                          page.data.items.map((item: any, itemIndex: any) => {
                            return (
                              <Option key={item.id} value={item.id.toString()}>
                                {item.name}
                              </Option>
                            );
                          }),
                        )}

                        {isFetchingNextDrivers && (
                          <Option disabled>
                            <p className="px-3 text-sm">loading</p>
                          </Option>
                        )}
                      </AntdSelect>
                    </FormControl>
                    <FormMessage />
                  </Space>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="is_self_pickup"
              render={({ field }) => {
                if (field.value === true) {
                  setChecked(true);
                } else {
                  setChecked(false);
                }
                return (
                  <FormItem className="flex space-x-2 items-center space-y-0">
                    <FormControl className="disabled:opacity-100">
                      <Checkbox
                        disabled={!isEdit || loading}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Oleh Customer
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative label-required">
                    Tipe Task
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
                          placeholder="Select a type"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* @ts-ignore  */}
                      {type.map((item: Type) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
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
                <FormLabel>Waktu</FormLabel>
                <FormControl className="disabled:opacity-100">
                  <Input
                    disabled={!isEdit || loading}
                    value={dayjs(defaultValues?.time)
                      .locale("id")
                      .format("HH:mm:ss - dddd, DD MMMM (YYYY)")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="time"
                render={({ field: { onChange, onBlur, value, ref } }) => {
                  return (
                    <ConfigProvider locale={locale}>
                      <Space size={12} direction="vertical">
                        <FormLabel className="relative label-required">
                          Waktu
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            disabled={loading}
                            style={{ width: "100%" }}
                            height={40}
                            className="p"
                            onChange={onChange} // send value to hook form
                            onBlur={onBlur} // notify when input is touched/blur
                            value={
                              value ? dayjs(value).locale("id") : undefined
                            }
                            format={"HH:mm:ss - dddd, DD MMMM (YYYY)"}
                            showTime
                          />
                        </FormControl>
                        <FormMessage />
                      </Space>
                    </ConfigProvider>
                  );
                }}
              />
            )}
          </div>
          {!isEdit && initialData?.customer.id_cards && (
            <div className="">
              <FormItem>
                <FormLabel>KTP Customer</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {initialData?.customer.id_cards?.map((image: any) => (
                    <>
                      <div
                        key={image?.id}
                        className="relative w-full h-[300px] cursor-pointer sm:w-1/3 lg:w-1/4 xl:w-1/5"
                      >
                        <CustomImage
                          className="w-full h-full object-contain"
                          onClick={() => {
                            setOpen(true);
                            onHandlePreview(image?.photo);
                          }}
                          srcSet={`${image?.photo} 500w,${image?.photo} 1000w`}
                          sizes="(max-width: 600px) 480px, 800px"
                          src={image?.photo}
                          alt={image.id}
                        />
                      </div>
                    </>
                  ))}
                </div>
              </FormItem>
            </div>
          )}
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="distance"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="relative label-required">
                      Jarak (dalam KM)
                    </FormLabel>
                    <FormControl className="disabled:opacity-100">
                      <Input
                        disabled={!isEdit || loading}
                        placeholder="Jarak"
                        value={field.value}
                        onChange={(e) => {
                          let inputValue = e.target.value;
                          if (inputValue === "" || inputValue == undefined) {
                            field.onChange(0);
                            return;
                          }
                          // Remove leading zeroes
                          inputValue = inputValue.replace(/^0+(?!$)/, "");
                          field.onChange(inputValue);
                        }}
                        type="number"
                        step={0.1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            {!isEdit ? (
              <FormItem>
                <FormLabel>Alamat</FormLabel>
                <p
                  className="border border-gray-200 rounded-md px-3 py-1 break-words"
                  dangerouslySetInnerHTML={{
                    __html: !isEmpty(defaultValues?.address)
                      ? makeUrlsClickable(
                          defaultValues?.address?.replace(/\n/g, "<br />"),
                        )
                      : "-",
                  }}
                />
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl className="disabled:opacity-100">
                      <Textarea
                        id="address"
                        placeholder="Alamat..."
                        className="col-span-4"
                        rows={8}
                        value={field.value ?? predefinedAddress}
                        disabled={!isEdit || loading}
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
                <FormLabel>Deskripsi</FormLabel>
                <p
                  className="border border-gray-200 rounded-md px-3 py-1 break-words"
                  dangerouslySetInnerHTML={{
                    __html: !isEmpty(defaultValues?.description)
                      ? makeUrlsClickable(
                          defaultValues?.description?.replace(/\n/g, "<br />"),
                        )
                      : "-",
                  }}
                />
              </FormItem>
            ) : (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl className="disabled:opacity-100">
                      <Textarea
                        value={field.value ?? predefinedDesc}
                        id="description"
                        placeholder="Deskripsi..."
                        className="col-span-4"
                        rows={8}
                        disabled={!isEdit || loading}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          {!isEdit && (
            <div className="md:grid md:grid-cols-3 gap-8">
              <FormItem>
                <FormLabel>Durasi</FormLabel>
                <FormControl className="disabled:opacity-100">
                  <Input
                    disabled={!isEdit || loading}
                    value={convertTime(initialData?.progress_duration_second)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
          )}

          {!isEdit && (
            <div className="">
              <FormLabel>Foto Bukti Serah terima</FormLabel>
              {(initialData?.status === "pending" ||
                initialData?.status === "on_progress") && (
                <p className="text-sm">{`Request ${wording} belum selesai dilakukan `}</p>
              )}
              {initialData?.status === "done" &&
                endlogs?.map((log: any) => (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {log?.photos?.map((photo: any) => (
                        <div
                          key={photo.id}
                          className="relative w-full h-[300px] cursor-pointer sm:w-1/3 lg:w-1/4 xl:w-1/5"
                        >
                          <CustomImage
                            className="w-full h-full object-contain"
                            srcSet={`${photo?.photo} 500w,${photo?.photo} 1000w`}
                            sizes="(max-width: 600px) 480px, 800px"
                            onClick={() => {
                              setOpen(true);
                              onHandlePreview(photo?.photo);
                            }}
                            key={photo.id}
                            src={photo.photo}
                            alt="photo"
                          />
                        </div>
                      ))}
                    </div>

                    <div
                      className="md:grid md:grid-cols-3 gap-8  mt-6"
                      key={log.id}
                    >
                      <FormItem>
                        <FormLabel>Catatan Driver</FormLabel>
                        <div
                          className="border border-gray-200 rounded-md px-2 py-1 break-words"
                          dangerouslySetInnerHTML={{
                            __html: !isEmpty(log?.description)
                              ? log?.description
                              : "-",
                          }}
                        />
                      </FormItem>
                    </div>
                  </>
                ))}
            </div>
          )}

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
      <PreviewImage
        isOpen={open}
        onClose={() => setOpen(false)}
        content={content}
      />
    </>
  );
};
