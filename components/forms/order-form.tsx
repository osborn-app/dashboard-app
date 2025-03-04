"use client";
import React, { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useParams, useRouter, usePathname } from "next/navigation";
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
import { cn, convertTime, makeUrlsClickable } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useGetDetailFleet, useGetInfinityFleets } from "@/hooks/api/useFleet";
import { isEmpty, isNull, isString } from "lodash";
import { useDebounce } from "use-debounce";
import { Select as AntdSelect, ConfigProvider, DatePicker, Space } from "antd";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  useGetDetailCustomer,
  useGetInfinityCustomers,
} from "@/hooks/api/useCustomer";
import {
  useGetDetailDriver,
  useGetInfinityDrivers,
} from "@/hooks/api/useDriver";
import { Textarea } from "../ui/textarea";
import { useSidebar } from "@/hooks/useSidebar";
import dayjs, { Dayjs } from "dayjs";
import locale from "antd/locale/id_ID";
import { Switch } from "@/components/ui/switch";
import { Label } from "../ui/label";
import { useGetInsurances } from "@/hooks/api/useInsurance";
import {
  useAcceptOrder,
  useEditOrder,
  useOrderCalculate,
  usePostOrder,
  useRejectOrder,
} from "@/hooks/api/useOrder";
import { ApprovalModal } from "../modal/approval-modal";
import { NumericFormat } from "react-number-format";
import "dayjs/locale/id";
import FleetDetail from "./section/fleet-detail";
import CustomerDetail from "./section/customer-detail";
import DriverDetail from "./section/driver-detail";
import PriceDetail from "./section/price-detail";
import Spinner from "../spinner";
import { RejectModal } from "../modal/reject-modal";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { PreviewImage } from "../modal/preview-image";

import { Trash2 } from "lucide-react";
import { DetailPrice, OrderFormProps, OrderFormValues } from "./types/order";
import { generateSchema } from "./validation/orderSchema";
import {
  getPaymentStatusLabel,
  getStatusVariant,
  OrderStatus,
} from "@/app/(dashboard)/dashboard/orders/[orderId]/types/order";
import { useUser } from "@/context/UserContext";

export const IMG_MAX_LIMIT = 3;

export const OrderForm: React.FC<OrderFormProps> = ({
  initialData,
  isEdit,
}) => {
  const { user } = useUser();
  const { orderId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const pathname = usePathname();
  const splitPath = pathname.split("/");
  const lastPath = splitPath[splitPath.length - 1];

  const title =
    lastPath === "preview"
      ? "Tinjau Pesanan"
      : lastPath === "edit"
      ? "Edit Pesanan"
      : lastPath === "detail"
      ? "Detail Pesanan"
      : "Tambah Pesanan";
  const description =
    lastPath === "preview"
      ? "Tinjau pesanan baru dari pelanggan"
      : lastPath === "edit"
      ? "Edit pesanan untuk pelanggan"
      : lastPath === "detail"
      ? ""
      : "Tambah pesanan baru untuk pelanggan";
  const toastMessage = initialData
    ? "Pesanan berhasil diubah!"
    : "Pesanan berhasil dibuat";
  const action = initialData ? "Save changes" : "Create";
  const queryClient = useQueryClient();
  const { mutate: createOrder } = usePostOrder();
  const { mutate: editOrder } = useEditOrder(orderId as string);
  const { mutate: acceptOrder } = useAcceptOrder(orderId as string);

  const { mutate: rejectOrder } = useRejectOrder();
  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
  const [searchFleetTerm, setSearchFleetTerm] = useState("");
  const [searchCustomerDebounce] = useDebounce(searchCustomerTerm, 500);
  const [searchFleetDebounce] = useDebounce(searchFleetTerm, 500);
  const days: number[] = Array.from({ length: 30 });
  const [detail, setDetail] = useState<DetailPrice | null>(null);
  const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
  const [openRejectModal, setOpenRejectModal] = useState<boolean>(false);
  const [openCustomerDetail, setOpenCustomerDetail] = useState<boolean>(false);
  const [openFleetDetail, setOpenFleetDetail] = useState<boolean>(false);
  const [openDriverDetail, setOpenDriverDetail] = useState<boolean>(false);
  const [showServicePrice, setShowServicePrice] = useState<boolean>(true);
  const [type, setType] = useState<string>("");
  const [schema, setSchema] = useState(() => generateSchema(true, true));
  const [messages, setMessages] = useState<any>({});
  const detailRef = React.useRef<HTMLDivElement>(null);

  const scrollDetail = () => {
    detailRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const {
    data: customers,
    fetchNextPage: fetchNextCustomers,
    hasNextPage: hasNextCustomers,
    isFetchingNextPage: isFetchingNextCustomers,
  } = useGetInfinityCustomers(searchCustomerDebounce, "verified");

  const {
    data: fleets,
    isFetching: isFetchingFleets,
    fetchNextPage: fetchNextFleets,
    hasNextPage: hasNextFleets,
    isFetchingNextPage: isFetchingNextFleets,
  } = useGetInfinityFleets(searchFleetDebounce);

  const { data: insurances } = useGetInsurances();

  const manipulateInsurance = insurances?.data?.items?.map((item: any) => {
    let newName;

    switch (item.code) {
      case "silver":
        newName = `${item.name} (s.d. Rp 50 jt)`;
        break;
      case "gold":
        newName = `${item.name} (s.d. Rp 100 jt)`;
        break;
      case "platinum":
        newName = `${item.name} (Semua Kerusakan)`;
        break;
      default:
        newName = item.name;
        break;
    }

    return {
      ...item,
      name: newName,
    };
  });

  const { isMinimized } = useSidebar();
  const defaultValues = initialData
    ? {
        start_request: {
          is_self_pickup: initialData?.start_request?.is_self_pickup,
          address: initialData?.start_request?.address,
          distance: initialData?.start_request?.distance ?? 0,
          driver_id: initialData?.start_request?.driver?.id?.toString(),
        },
        end_request: {
          is_self_pickup: initialData?.end_request?.is_self_pickup,
          address: initialData?.end_request?.address,
          distance: initialData?.end_request?.distance ?? 0,
          driver_id: initialData?.end_request?.driver?.id?.toString(),
        },
        customer: initialData?.customer?.id?.toString(),
        fleet: initialData?.fleet?.id?.toString(),
        description: initialData?.description,
        is_with_driver: initialData?.is_with_driver,
        is_out_of_town: initialData?.is_out_of_town,
        date: initialData?.start_date,
        duration: initialData?.duration?.toString(),
        discount: initialData?.discount?.toString(),
        insurance_id: initialData?.insurance
          ? initialData?.insurance?.id.toString()
          : "0",
        service_price: initialData?.service_price.toString(),
        additionals: initialData?.additional_services,
      }
    : {
        start_request: {
          is_self_pickup: true,
          address: "",
          distance: 0,
          driver_id: "",
        },
        end_request: {
          is_self_pickup: true,
          address: "",
          distance: 0,
          driver_id: "",
        },
        customer: "",
        fleet: "",
        description: "",
        is_with_driver: false,
        is_out_of_town: false,
        date: "",
        duration: "1",
        discount: "0",
        insurance_id: "0",
        service_price: "",
        additionals: [],
      };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionals",
  });

  const customerField = form.watch("customer");
  const fleetField = form.watch("fleet");
  const dateField = form.watch("date");
  const durationField = form.watch("duration");
  const isOutOfTownField = form.watch("is_out_of_town");
  const isWithDriverField = form.watch("is_with_driver");
  const insuranceField = form.watch("insurance_id");
  const startSelfPickUpField = form.watch("start_request.is_self_pickup");
  const startDriverField = form.watch("start_request.driver_id");
  const startDistanceField = form.watch("start_request.distance");
  const startAddressField = form.watch("start_request.address");
  const endSelfPickUpField = form.watch("end_request.is_self_pickup");
  const endDriverField = form.watch("end_request.driver_id");
  const endDistanceField = form.watch("end_request.distance");
  const endAddressField = form.watch("end_request.address");
  const discountField = form.watch("discount");
  const descriptionField = form.watch("description");
  const serviceField = form.watch("service_price");
  const additionalField = form.watch("additionals");

  const watchServicePrice = !(startSelfPickUpField && endSelfPickUpField);
  const servicePrice = serviceField ?? 0;

  const { data: customerData, isFetching: isFetchingCustomer } =
    useGetDetailCustomer(form.getValues("customer"));
  const { data: fleetData, isFetching: isFetchingFleet } = useGetDetailFleet(
    form.getValues("fleet"),
  );

  const { data: driver, isFetching: isFetchingDriver } = useGetDetailDriver(
    type == "start"
      ? form.getValues("start_request.driver_id")
      : form.getValues("end_request.driver_id"),
  );

  const [end, setEnd] = useState("");
  const now = dayjs(form.getValues("date"));
  useEffect(() => {
    const end = now
      .add(+form.getValues("duration"), "day")
      .locale("id")
      .format("HH:mm:ss - dddd, DD MMMM (YYYY)");
    setEnd(end);
  }, [now, form.getValues("duration")]);

  const onSubmit = async (data: OrderFormValues) => {
    setLoading(true);

    const createPayload = (data: OrderFormValues) => ({
      start_request: {
        is_self_pickup: data.start_request.is_self_pickup == "1" ? true : false,
        driver_id: +data.start_request.driver_id,
        ...(!startSelfPickUpField && {
          address: data.start_request.address,
          distance: +data.start_request.distance,
        }),
      },
      end_request: {
        is_self_pickup: data.end_request.is_self_pickup == "1" ? true : false,
        driver_id: +data.end_request.driver_id,
        ...(!endSelfPickUpField && {
          distance: +data.end_request.distance,
          address: data.end_request.address,
        }),
      },
      customer_id: +data.customer,
      fleet_id: +data.fleet,
      description: data.description,
      is_with_driver: data.is_with_driver,
      is_out_of_town: data.is_out_of_town,
      date: data.date.toISOString(),
      duration: +data.duration,
      discount: +data.discount,
      insurance_id: +data.insurance_id === 0 ? null : +data.insurance_id,
      ...(showServicePrice &&
        data?.service_price && {
          service_price: +data.service_price.replace(/,/g, ""),
        }),
      ...(fields.length !== 0 && {
        additional_services: additionalField.map((field) => {
          return {
            name: field.name,
            price: isString(field.price)
              ? +field.price.replace(/,/g, "")
              : field.price,
          };
        }),
      }),
    });

    const handleSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        variant: "success",
        title: toastMessage,
      });
      // router.refresh();
      router.push(`/dashboard/orders`);
    };

    const handleError = (error: any) => {
      setOpenApprovalModal(false);
      toast({
        variant: "destructive",
        title: `Uh oh! ${
          //@ts-ignore
          error?.response?.data?.message == "Customer must be verified."
            ? "Customer belum diverifikasi"
            : //@ts-ignore
              error?.response?.data?.message
        }`,
      });
    };

    const handleResponse = (payload: any, action: Function) => {
      setLoading(true);
      action(payload, {
        onSuccess: handleSuccess,
        onSettled: () => setLoading(false),
        onError: handleError,
      });
    };

    const payload = createPayload(data);

    switch (lastPath) {
      case "edit":
        handleResponse(payload, editOrder);
        break;
      case "preview":
        handleResponse(payload, acceptOrder);
        break;
      default:
        handleResponse(payload, createOrder);
        break;
    }
  };

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

  const pengambilan = [
    {
      name: "Pelanggan Ambil Sendiri",
      value: "1",
    },
    {
      name: "Diantar Penanggung Jawab",
      value: "0",
    },
  ];

  const pengembalian = [
    {
      name: "Pelanggan Kembalikan Sendiri",
      value: "1",
    },
    {
      name: "Dijemput Penanggung Jawab",
      value: "0",
    },
  ];

  const { mutate: calculatePrice } = useOrderCalculate();

  useEffect(() => {
    if (startSelfPickUpField && endSelfPickUpField) {
      // Jika start_request.is_self_pickup dan end_request.is_self_pickup keduanya true
      setSchema(generateSchema(true, true));
      setShowServicePrice(false);
    } else if (startSelfPickUpField) {
      // Jika hanya start_request.is_self_pickup yang true
      setSchema(generateSchema(true, false));
      setShowServicePrice(true);
    } else if (endSelfPickUpField) {
      // Jika hanya end_request.is_self_pickup yang true
      setSchema(generateSchema(false, true));
      setShowServicePrice(true);
    } else {
      // Jika keduanya false
      setSchema(generateSchema(false, false));
      setShowServicePrice(true);
    }
  }, [startSelfPickUpField, endSelfPickUpField]);

  useEffect(() => {
    const payload = {
      customer_id: +(customerField ?? 0),
      fleet_id: +(fleetField ?? 0),
      is_out_of_town: isOutOfTownField,
      is_with_driver: isWithDriverField,
      insurance_id: +(insuranceField ?? 0),
      start_request: {
        is_self_pickup: startSelfPickUpField == "1" ? true : false,
        driver_id: +(startDriverField ?? 0),
        ...(!startSelfPickUpField && {
          distance: +(startDistanceField ?? 0),
          address: startAddressField,
        }),
      },
      end_request: {
        is_self_pickup: endSelfPickUpField == "1" ? true : false,
        driver_id: +(endDriverField ?? 0),
        ...(!endSelfPickUpField && {
          distance: +(endDistanceField ?? 0),
          address: endAddressField,
        }),
      },
      description: descriptionField,
      ...(!isEmpty(dateField) && {
        date: dateField,
        duration: +(durationField ?? 1),
      }),
      discount: +(discountField ?? 0),
      ...(watchServicePrice && {
        service_price: isString(serviceField)
          ? +serviceField.replace(/,/g, "")
          : serviceField,
      }),
      ...(fields.length !== 0 && {
        additional_services: additionalField.map((field) => {
          return {
            name: field.name,
            price: isString(field.price)
              ? +field.price.replace(/,/g, "")
              : field.price,
          };
        }),
      }),
    };

    if (fleetField) {
      calculatePrice(payload, {
        onSuccess: (data) => {
          setDetail(data.data);
        },
      });
    }
  }, [
    additionalField,
    customerField,
    fleetField,
    dateField,
    durationField,
    isOutOfTownField,
    isWithDriverField,
    insuranceField,
    startSelfPickUpField,
    startDriverField,
    startDistanceField,
    startAddressField,
    endSelfPickUpField,
    endDriverField,
    endDistanceField,
    endAddressField,
    discountField,
    descriptionField,
    showServicePrice,
    servicePrice,
    JSON.stringify(additionalField),
  ]);

  // disable date for past dates
  const disabledDate = (current: Dayjs | null): boolean => {
    // ada request untuk enable past date ketika update order
    if (lastPath === "edit") return false;

    return current ? current < dayjs().startOf("day") : false;
  };

  // function for handle reject
  const handleRejectOrder = (reason: string) => {
    setRejectLoading(true);
    rejectOrder(
      { orderId, reason },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          toast({
            variant: "success",
            title: "berhasil ditolak",
          });
          setOpenRejectModal(false);
          router.refresh();
          router.push(`/dashboard/orders`);
        },
        onSettled: () => {
          setLoading(false);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Uh oh! ada sesuatu yang error",
            //@ts-ignore
            description: `error: ${error?.response?.message}`,
          });
        },
      },
    );
  };

  const handleReset = () => {
    form.reset();
  };

  const errors = form.formState.errors;
  useEffect(() => {
    if (!isEmpty(errors)) {
      toast({
        variant: "destructive",
        title: "Harap isi semua field yang wajib diisi sebelum konfirmasi",
      });

      setOpenApprovalModal(false);
    }
  }, [errors]);

  const generateMessage = (currentValue: any, defaultValue: any) =>
    currentValue !== defaultValue ? "Data telah diubah" : "";

  useEffect(() => {
    const newMessages = {
      customer: generateMessage(customerField, defaultValues.customer),
      fleet: generateMessage(fleetField, defaultValues.fleet),
      date: generateMessage(dateField, defaultValues.date),
      duration: generateMessage(durationField, defaultValues.duration),
      is_out_of_town: generateMessage(
        isOutOfTownField,
        defaultValues.is_out_of_town,
      ),
      is_with_driver: generateMessage(
        isWithDriverField,
        defaultValues.is_with_driver,
      ),
      insurance_id: generateMessage(insuranceField, defaultValues.insurance_id),
      start_request: {
        is_self_pickup: generateMessage(
          startSelfPickUpField,
          defaultValues.start_request.is_self_pickup,
        ),
        driver_id: generateMessage(
          startDriverField,
          defaultValues.start_request.driver_id,
        ),
        distance: generateMessage(
          startDistanceField,
          defaultValues.start_request.distance,
        ),
        address: generateMessage(
          startAddressField,
          defaultValues.start_request.address,
        ),
      },
      end_request: {
        is_self_pickup: generateMessage(
          endSelfPickUpField,
          defaultValues.end_request.is_self_pickup,
        ),
        driver_id: generateMessage(
          endDriverField,
          defaultValues.end_request.driver_id,
        ),
        distance: generateMessage(
          endDistanceField,
          defaultValues.end_request.distance,
        ),
        address: generateMessage(
          endAddressField,
          defaultValues.end_request.address,
        ),
      },
      discount: generateMessage(discountField, defaultValues.discount),
      description: generateMessage(descriptionField, defaultValues.description),
      service_price: generateMessage(serviceField, defaultValues.service_price),
    };

    if (lastPath !== "create") {
      setMessages(newMessages);
    }
  }, [
    customerField,
    fleetField,
    dateField,
    durationField,
    isOutOfTownField,
    isWithDriverField,
    insuranceField,
    startSelfPickUpField,
    startDriverField,
    startDistanceField,
    startAddressField,
    endSelfPickUpField,
    endDriverField,
    endDistanceField,
    endAddressField,
    discountField,
    descriptionField,
    serviceField,
  ]);
  const approvalModalTitle =
    lastPath === "edit"
      ? "Apakah Anda Yakin Ingin Mengedit Pesanan ini?"
      : "Apakah Anda Yakin Ingin Mengonfirmasi Pesanan ini?";

  return (
    <>
      {openApprovalModal && (
        <ApprovalModal
          heading="pesanan"
          isOpen={openApprovalModal}
          onClose={() => setOpenApprovalModal(false)}
          onConfirm={form.handleSubmit(onSubmit)}
          loading={loading}
          title={approvalModalTitle}
        />
      )}
      {openRejectModal && (
        <RejectModal
          isOpen={openRejectModal}
          onClose={() => setOpenRejectModal(false)}
          onConfirm={handleRejectOrder}
          loading={rejectLoading}
        />
      )}
      <div
        className={cn("flex items-center justify-between py-3 gap-2 flex-wrap")}
        id="header"
      >
        <Heading title={title} description={description} />
        {initialData?.status !== "pending" &&
          initialData?.request_status === "pending" &&
          lastPath !== "pending" && (
            <div className="flex gap-2">
              {lastPath === "edit" && (
                <>
                  <Button
                    onClick={handleReset}
                    disabled={!form.formState.isDirty}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "text-black",
                    )}
                  >
                    Reset berdasarkan data Pelanggan
                  </Button>
                  <Button
                    onClick={() => setOpenApprovalModal(true)}
                    className={cn(buttonVariants({ variant: "main" }))}
                    type="button"
                  >
                    {loading ? <Spinner className="h-4 w-4" /> : "Selesai"}
                  </Button>
                </>
              )}
              {lastPath !== "edit" && (
                <Link
                  href={`/dashboard/orders/${orderId}/edit`}
                  onClick={(e) => {
                    if (user?.role !== "admin") {
                      e.preventDefault();
                    }
                  }}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "text-black",
                    user?.role !== "admin" &&
                      "cursor-not-allowed pointer-events-none opacity-50",
                  )}
                >
                  Edit Pesanan
                </Link>
              )}
              <div className="flex justify-between gap-3.5">
                {initialData?.order_status != OrderStatus.PENDING &&
                  initialData?.order_status != OrderStatus.WAITING && (
                    <div
                      className={cn(
                        getStatusVariant(initialData?.payment_status),
                        "text-xs font-medium flex items-center justify-center px-[10px] py-1 rounded-full text-center",
                      )}
                    >
                      {getPaymentStatusLabel(initialData?.payment_status)}
                    </div>
                  )}
                <div className="bg-red-50 text-red-500 text-xs font-medium flex items-center justify-center px-[10px] py-1 rounded-full text-center">
                  Belum kembali
                </div>
              </div>
            </div>
          )}

        {initialData?.request_status === "done" && (
          <div className="flex gap-2">
            {lastPath === "edit" && (
              <>
                <Button
                  onClick={handleReset}
                  disabled={!form.formState.isDirty}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "text-black",
                  )}
                >
                  Reset berdasarkan data Pelanggan
                </Button>
                <Button
                  onClick={() => setOpenApprovalModal(true)}
                  className={cn(buttonVariants({ variant: "main" }))}
                  type="button"
                >
                  Selesai
                </Button>
              </>
            )}

            {lastPath !== "edit" && (
              <Link
                href={`/dashboard/orders/${orderId}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "text-black",
                )}
              >
                Edit Pesanan
              </Link>
            )}
            <div className="flex justify-between gap-3.5">
              {initialData?.order_status != OrderStatus.PENDING &&
                initialData?.order_status != OrderStatus.WAITING && (
                  <div
                    className={cn(
                      getStatusVariant(initialData?.payment_status),
                      "text-xs font-medium flex items-center justify-center px-[10px] py-1 rounded-full text-center",
                    )}
                  >
                    {getPaymentStatusLabel(initialData?.payment_status)}
                  </div>
                )}
              <div className="bg-green-50 text-green-500 text-xs font-medium flex items-center justify-center px-[10px] py-1 rounded-full text-center">
                Selesai
              </div>
            </div>
          </div>
        )}
        {initialData?.status === "pending" && lastPath === "preview" && (
          <Button
            onClick={handleReset}
            disabled={!form.formState.isDirty}
            className={cn(buttonVariants({ variant: "outline" }), "text-black")}
          >
            Reset berdasarkan data Pelanggan
          </Button>
        )}
      </div>
      <div className="flex gap-4 flex-col lg:!flex-row">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-full basis-2/3"
          >
            <div className="relative space-y-8" id="parent">
              <FormField
                name="is_with_driver"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <Tabs
                          defaultValue={
                            defaultValues.is_with_driver
                              ? "dengan_supir"
                              : "lepas_kunci"
                          }
                          onValueChange={field.onChange}
                          value={field.value ? "dengan_supir" : "lepas_kunci"}
                          className="w-full lg:w-[235px]"
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger
                              disabled={!isEdit || loading}
                              value="lepas_kunci"
                              onClick={() =>
                                form.setValue("is_with_driver", false)
                              }
                            >
                              Lepas Kunci
                            </TabsTrigger>
                            <TabsTrigger
                              disabled={!isEdit || loading}
                              value="dengan_supir"
                              onClick={() =>
                                form.setValue("is_with_driver", true)
                              }
                            >
                              Dengan Supir
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </FormControl>
                      <FormMessage />
                      {messages.is_with_driver && (
                        <FormMessage className="text-main">
                          {messages.is_with_driver}
                        </FormMessage>
                      )}
                    </FormItem>
                  );
                }}
              />

              {/*
              perhitungan lebar content
              di figma dengan lebar 1440px:
                lebar 936px ====> ketika sidebar menu minimize
                lebar 700px ====> ketika sidebar menu tidak minimize

              di ukuran laya 1920px, kita perlu expand lebar si content sebesar 240px
              apabila 1 baris form terdapat 2 input field, maka kita perlu expand sebanya 120px disetiap field
              */}
              <div className={cn("lg:grid grid-cols-2 gap-[10px] items-start")}>
                <div className="flex items-end">
                  {lastPath !== "preview" && isEdit ? (
                    <FormField
                      name="customer"
                      control={form.control}
                      render={({ field }) => {
                        return (
                          <div className="space-y-2 w-full">
                            <FormLabel className="relative label-required">
                              Pelanggan
                            </FormLabel>
                            <div className="flex">
                              <FormControl>
                                <AntdSelect
                                  className={cn("mr-2 w-full")}
                                  showSearch
                                  placeholder="Pilih Pelanggan"
                                  style={{
                                    height: "40px",
                                  }}
                                  onSearch={setSearchCustomerTerm}
                                  onChange={field.onChange}
                                  onPopupScroll={handleScrollCustomers}
                                  filterOption={false}
                                  notFoundContent={
                                    isFetchingNextCustomers ? (
                                      <p className="px-3 text-sm">loading</p>
                                    ) : null
                                  }
                                  // append value attribute when field is not  empty
                                  {...(!isEmpty(field.value) && {
                                    value: field.value,
                                  })}
                                >
                                  {lastPath !== "create" && isEdit && (
                                    <Option
                                      value={initialData?.customer?.id?.toString()}
                                    >
                                      {initialData?.customer?.name}
                                    </Option>
                                  )}
                                  {customers?.pages.map(
                                    (page: any, pageIndex: any) =>
                                      page.data.items.map(
                                        (item: any, itemIndex: any) => {
                                          return (
                                            <Option
                                              key={item.id}
                                              value={item.id.toString()}
                                            >
                                              {item.name}
                                            </Option>
                                          );
                                        },
                                      ),
                                  )}

                                  {isFetchingNextCustomers && (
                                    <Option disabled>
                                      <p className="px-3 text-sm">loading</p>
                                    </Option>
                                  )}
                                </AntdSelect>
                              </FormControl>
                              <Button
                                className={cn(
                                  buttonVariants({ variant: "main" }),
                                  "w-[65px] h-[40px]",
                                )}
                                disabled={
                                  !form.getFieldState("customer").isDirty &&
                                  isEmpty(form.getValues("customer"))
                                }
                                type="button"
                                onClick={() => {
                                  setOpenCustomerDetail(true);
                                  setOpenFleetDetail(false);
                                  setOpenDriverDetail(false);
                                  scrollDetail();
                                }}
                              >
                                Lihat
                              </Button>
                            </div>
                            <FormMessage />
                          </div>
                        );
                      }}
                    />
                  ) : (
                    <FormItem>
                      <FormLabel
                        className={cn(
                          initialData?.customer?.status === "pending"
                            ? "text-destructive"
                            : "",
                        )}
                      >
                        Pelanggan
                      </FormLabel>
                      <div className="flex">
                        <FormControl className="disabled:opacity-100">
                          <Input
                            className={cn("mr-2")}
                            style={{
                              height: "40px",
                            }}
                            disabled
                            value={initialData?.customer?.name ?? "-"}
                          />
                        </FormControl>
                        <Button
                          className={cn(
                            buttonVariants({ variant: "main" }),
                            "w-[65px] h-[40px]",
                          )}
                          disabled={
                            !form.getFieldState("customer").isDirty &&
                            isEmpty(form.getValues("customer"))
                          }
                          type="button"
                          onClick={() => {
                            setOpenCustomerDetail(true);
                            setOpenFleetDetail(false);
                            setOpenDriverDetail(false);
                            scrollDetail();
                          }}
                        >
                          {initialData?.customer?.status == "pending"
                            ? "Tinjau"
                            : "Lihat"}
                        </Button>
                      </div>
                      {initialData?.customer?.status == "pending" && (
                        <p
                          className={cn(
                            "text-[0.8rem] font-medium text-destructive",
                          )}
                        >
                          Pelanggan belum verified
                        </p>
                      )}
                    </FormItem>
                  )}
                </div>
                <div className="flex items-end">
                  {isEdit ? (
                    <FormField
                      name="fleet"
                      control={form.control}
                      render={({ field }) => {
                        return (
                          <div className="space-y-2 w-full">
                            <FormLabel className="relative label-required">
                              Armada
                            </FormLabel>
                            <div className="flex">
                              <FormControl>
                                <AntdSelect
                                  className={cn("mr-2 flex-1")}
                                  showSearch
                                  placeholder="Pilih Armada"
                                  style={{
                                    height: "40px",
                                  }}
                                  onSearch={setSearchFleetTerm}
                                  onChange={field.onChange}
                                  onPopupScroll={handleScrollFleets}
                                  filterOption={false}
                                  notFoundContent={
                                    isFetchingNextFleets ? (
                                      <p className="px-3 text-sm">loading</p>
                                    ) : null
                                  }
                                  // append value attribute when field is not  empty
                                  {...(!isEmpty(field.value) && {
                                    value: field.value,
                                  })}
                                >
                                  {lastPath !== "create" && isEdit && (
                                    <Option
                                      value={initialData?.fleet?.id?.toString()}
                                    >
                                      {initialData?.fleet?.name}
                                    </Option>
                                  )}
                                  {fleets?.pages.map(
                                    (page: any, pageIndex: any) =>
                                      page.data.items.map(
                                        (item: any, itemIndex: any) => {
                                          return (
                                            <Option
                                              key={item.id}
                                              value={item.id.toString()}
                                            >
                                              {item.name}
                                            </Option>
                                          );
                                        },
                                      ),
                                  )}

                                  {isFetchingNextFleets && (
                                    <Option disabled>
                                      <p className="px-3 text-sm">loading</p>
                                    </Option>
                                  )}
                                </AntdSelect>
                              </FormControl>
                              <Button
                                className={cn(
                                  buttonVariants({ variant: "main" }),
                                  "w-[65px] h-[40px]",
                                )}
                                disabled={
                                  !form.getFieldState("fleet").isDirty &&
                                  isEmpty(form.getValues("fleet"))
                                }
                                type="button"
                                onClick={() => {
                                  setOpenFleetDetail(true);
                                  setOpenCustomerDetail(false);
                                  setOpenDriverDetail(false);
                                  scrollDetail();
                                }}
                              >
                                Lihat
                              </Button>
                            </div>
                            <FormMessage />
                            {messages.fleet && (
                              <FormMessage className="text-main">
                                {messages.fleet}
                              </FormMessage>
                            )}
                          </div>
                        );
                      }}
                    />
                  ) : (
                    <FormItem>
                      <FormLabel>Armada</FormLabel>
                      <div className="flex">
                        <FormControl className="disabled:opacity-100">
                          <Input
                            className={cn("mr-2")}
                            style={{
                              height: "40px",
                            }}
                            disabled
                            value={initialData?.fleet?.name ?? "-"}
                          />
                        </FormControl>
                        <Button
                          className={cn(
                            buttonVariants({ variant: "main" }),
                            "w-[65px] h-[40px]",
                          )}
                          disabled={
                            !form.getFieldState("fleet").isDirty &&
                            isEmpty(form.getValues("fleet"))
                          }
                          type="button"
                          onClick={() => {
                            setOpenFleetDetail(true);
                            setOpenCustomerDetail(false);
                            setOpenDriverDetail(false);
                            scrollDetail();
                          }}
                        >
                          Lihat
                        </Button>
                      </div>
                    </FormItem>
                  )}
                </div>
              </div>
              <div className={cn("gap-2 lg:gap-5 flex flex-col lg:flex-row")}>
                {isEdit ? (
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <ConfigProvider locale={locale}>
                        <Space size={8} direction="vertical" className="w-full">
                          <FormLabel className="relative label-required">
                            Tanggal Sewa
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              disabledDate={disabledDate}
                              disabled={loading}
                              className={cn("p h-[40px] w-full")}
                              style={
                                {
                                  // width: `${!isMinimized ? "340px" : "100%"}`,
                                }
                              }
                              height={40}
                              id="testing"
                              onChange={field.onChange} // send value to hook form
                              onBlur={field.onBlur} // notify when input is touched/blur
                              value={
                                field.value
                                  ? dayjs(field.value).locale("id")
                                  : undefined
                              }
                              format={"HH:mm:ss - dddd, DD MMMM (YYYY)"}
                              showTime
                              placeholder="Pilih tanggal dan waktu mulai"
                              showNow={false}
                            />
                          </FormControl>
                          <FormMessage />
                          {messages.date && (
                            <FormMessage className="text-main">
                              {messages.date}
                            </FormMessage>
                          )}
                        </Space>
                      </ConfigProvider>
                    )}
                  />
                ) : (
                  <FormItem>
                    <FormLabel>Tanggal Sewa</FormLabel>
                    <FormControl className="disabled:opacity-100">
                      <Input
                        className={cn("w-full")}
                        style={{
                          height: "40px",
                        }}
                        disabled
                        value={
                          dayjs(initialData?.start_date)
                            .locale("id")
                            .format("HH:mm:ss - dddd, DD MMMM (YYYY)") ?? "-"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="relative label-required">
                        Lama Hari
                      </FormLabel>
                      <Select
                        disabled={!isEdit || loading}
                        onValueChange={field.onChange}
                        defaultValue={defaultValues.duration}
                        value={field.value}
                      >
                        <FormControl
                          className={cn(
                            "disabled:opacity-100",
                            "w-full",
                            "h-[40px]",
                          )}
                        >
                          <SelectTrigger className="">
                            <SelectValue placeholder="asdf" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="h-36">
                          {/* @ts-ignore  */}
                          {days.map((_, index) => (
                            <SelectItem
                              key={index}
                              value={(index + 1).toString()}
                            >
                              {index + 1} Hari
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {messages.duration && (
                        <FormMessage className="text-main">
                          {messages.duration}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormItem className="flex flex-col pt-[5px]">
                  <FormLabel>Selesai sewa (otomatis)</FormLabel>
                  <FormControl>
                    <Input
                      className={cn("w-full h-[40px]")}
                      placeholder="Tanggal dan waktu selesai"
                      value={end == "Invalid Date" ? "" : end}
                      readOnly
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
              <div className={cn("lg:grid grid-cols-2 gap-5")}>
                <FormField
                  control={form.control}
                  name="is_out_of_town"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="relative label-required">
                          Pemakaian
                        </FormLabel>
                        <FormControl>
                          <Tabs
                            onValueChange={field.onChange}
                            value={
                              field.value == false ? "dalam_kota" : "luar_kota"
                            }
                          >
                            <TabsList className="grid w-full grid-cols-2 h-[40px]">
                              <TabsTrigger
                                disabled={!isEdit || loading}
                                value="dalam_kota"
                                onClick={() =>
                                  form.setValue("is_out_of_town", false)
                                }
                                className="h-[30px]"
                              >
                                Dalam Kota
                              </TabsTrigger>
                              <TabsTrigger
                                disabled={!isEdit || loading}
                                value="luar_kota"
                                onClick={() =>
                                  form.setValue("is_out_of_town", true)
                                }
                                className="h-[30px]"
                              >
                                Luar Kota
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </FormControl>
                        <FormMessage />
                        {messages.is_out_of_town && (
                          <FormMessage className="text-main">
                            {messages.is_out_of_town}
                          </FormMessage>
                        )}
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="insurance_id"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="relative label-required">
                          Asuransi
                        </FormLabel>
                        <Select
                          disabled={!isEdit || loading}
                          onValueChange={field.onChange}
                          value={field.value || "0"}
                        >
                          <FormControl className="disabled:opacity-100 h-[40px]">
                            <SelectTrigger>
                              <SelectValue defaultValue="0" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Tidak Ada</SelectItem>
                            {/* @ts-ignore  */}
                            {manipulateInsurance?.map((insurance) => (
                              <SelectItem
                                key={insurance.id}
                                value={insurance.id.toString()}
                              >
                                {insurance.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {messages.insurance_id && (
                          <FormMessage className="text-main">
                            {messages.insurance_id}
                          </FormMessage>
                        )}
                      </FormItem>
                    );
                  }}
                />
              </div>
              <Separator className={cn("mt-1")} />
              <DetailSection
                title="Detail Pengambilan"
                form={form}
                initialData={initialData}
                defaultValues={defaultValues}
                loading={loading}
                isEdit={isEdit}
                lists={pengambilan}
                type="start"
                handleButton={() => {
                  setOpenCustomerDetail(false);
                  setOpenFleetDetail(false);
                  setOpenDriverDetail(true);
                  setType("start");
                  scrollDetail();
                }}
                lastPath={lastPath}
                messages={messages}
              />
              <DetailSection
                title="Detail Pengembalian"
                form={form}
                initialData={initialData}
                defaultValues={defaultValues}
                loading={loading}
                isEdit={isEdit}
                lists={pengembalian}
                type="end"
                handleButton={() => {
                  setOpenCustomerDetail(false);
                  setOpenFleetDetail(false);
                  setOpenDriverDetail(true);
                  setType("end");
                  scrollDetail();
                }}
                lastPath={lastPath}
                messages={messages}
              />
              <div className={cn("space-y-8")}>
                {showServicePrice && (
                  <FormField
                    name="service_price"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="relative label-required">
                          Harga Layanan Driver
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
                        {messages.service_price && (
                          <FormMessage className="text-main">
                            {messages.service_price}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex flex-col">
                  {fields.map((field_item, index) => (
                    <div key={index} className="lg:flex gap-4 items-end mb-4">
                      <FormField
                        name={`additionals.${index}.name`}
                        control={form.control}
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel className="relative label-required">
                                Deskripsi Layanan
                              </FormLabel>
                              <FormControl className="disabled:opacity-100 h-[40px]">
                                <Input
                                  key={field_item.id}
                                  disabled={!isEdit || loading}
                                  placeholder="Deskripsi Layanan"
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        key={field_item.id}
                        name={`additionals.${index}.price`}
                        control={form.control}
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel className="relative label-required">
                                Harga Layanan
                              </FormLabel>
                              <FormControl className="disabled:opacity-100">
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 ">
                                    Rp.
                                  </span>
                                  <NumericFormat
                                    key={field_item.id}
                                    disabled={!isEdit || loading}
                                    customInput={Input}
                                    type="text"
                                    className="h-[40px] pl-9 disabled:opacity-90"
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
                          );
                        }}
                      />
                      {isEdit && (
                        <Button
                          type="button"
                          className={cn(
                            buttonVariants({
                              variant: "destructive",
                              size: "icon",
                            }),
                            "p-0 h-10 w-full lg:w-10 flex-none bg-red-50 mb-2 lg:mb-0",
                          )}
                          onClick={() => {
                            remove(index);

                            const updatedAdditionals = [...additionalField];
                            updatedAdditionals.splice(index, 1);
                            form.setValue("additionals", updatedAdditionals);
                          }}
                        >
                          <Trash2 className="w-5 h-5 text-red-500 hover:text-white" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {isEdit && (
                    <div className="justify-end flex">
                      <Button
                        type="button"
                        className={cn(buttonVariants({ variant: "secondary" }))}
                        onClick={() => append({ name: "", price: "0" })}
                      >
                        + Add Item
                      </Button>
                    </div>
                  )}
                </div>

                {!isEdit ? (
                  <FormItem>
                    <FormLabel>Permintaan Khusus</FormLabel>
                    <p
                      className="border border-gray-200 rounded-md px-3 break-words"
                      dangerouslySetInnerHTML={{
                        __html: !isEmpty(defaultValues?.description)
                          ? makeUrlsClickable(
                              defaultValues?.description.replace(
                                /\n/g,
                                "<br />",
                              ),
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
                        <FormLabel>Permintaan Khusus</FormLabel>
                        <FormControl className="disabled:opacity-100">
                          <Textarea
                            id="alamat"
                            placeholder="Masukkan permintaan khusus pelanggan di sini...."
                            className="col-span-3"
                            rows={3}
                            value={field.value || ""}
                            onChange={(e) => {
                              e.target.value = e.target.value.trimStart();
                              field.onChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {messages.description && (
                          <FormMessage className="text-main">
                            {messages.description}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </form>

          {/* sidebar */}

          {openCustomerDetail && isFetchingCustomer && (
            <div className="flex justify-center items-center h-[100px] w-full">
              <Spinner />
            </div>
          )}
          {openCustomerDetail && !isFetchingCustomer && (
            <CustomerDetail
              innerRef={detailRef}
              data={customerData?.data}
              onClose={() => setOpenCustomerDetail(false)}
            />
          )}
          {openFleetDetail && isFetchingFleet && (
            <div className="flex justify-center items-center h-[100px] w-full">
              <Spinner />
            </div>
          )}

          {openFleetDetail && !isFetchingFleet && (
            <FleetDetail
              innerRef={detailRef}
              data={fleetData?.data}
              onClose={() => setOpenFleetDetail(false)}
            />
          )}

          {openDriverDetail && isFetchingDriver && (
            <div className="flex justify-center items-center h-[100px] w-full">
              <Spinner />
            </div>
          )}

          {openDriverDetail && !isFetchingDriver && (
            <DriverDetail
              innerRef={detailRef}
              data={driver?.data}
              onClose={() => setOpenDriverDetail(false)}
            />
          )}

          {!openCustomerDetail && !openFleetDetail && !openDriverDetail && (
            <PriceDetail
              innerRef={detailRef}
              initialData={initialData}
              isEdit={isEdit ?? false}
              showServicePrice={showServicePrice}
              showAdditional={additionalField?.length !== 0}
              form={form}
              detail={detail}
              handleOpenApprovalModal={() => setOpenApprovalModal(true)}
              handleOpenRejectModal={() => setOpenRejectModal(true)}
              confirmLoading={loading}
              type={lastPath}
              messages={messages}
            />
          )}
        </Form>
      </div>
    </>
  );
};

interface List {
  name: string;
  value: string;
}

interface DetailSectionProps {
  title: string;
  form: any;
  isEdit?: boolean | null;
  initialData: any;
  defaultValues: any;
  loading: boolean;
  lists: List[];
  type: "start" | "end";
  handleButton: () => void;
  lastPath: string;
  messages?: any;
}

const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  form,
  isEdit,
  initialData,
  defaultValues,
  loading,
  lists,
  type,
  handleButton,
  lastPath,
  messages,
}) => {
  const [searchDriverTerm, setSearchDriverTerm] = useState("");
  const [searchDriverDebounce] = useDebounce(searchDriverTerm, 500);
  const { isMinimized } = useSidebar();
  const [switchValue, setSwitchValue] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);

  const onHandlePreview = (file: any) => {
    setContent(file);
    setOpen(true);
  };

  const {
    data: drivers,
    fetchNextPage: fetchNextDrivers,
    hasNextPage: hasNextDrivers,
    isFetchingNextPage: isFetchingNextDrivers,
  } = useGetInfinityDrivers(searchDriverDebounce);

  const handleScrollDrivers = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      fetchNextDrivers();
    }
  };
  const startRequest = initialData?.start_request;
  const startRequestLog = initialData?.start_request?.logs?.filter(
    (log: any) => log.type === "end",
  );
  const endRequest = initialData?.end_request;
  const endRequestLog = initialData?.end_request?.logs?.filter(
    (log: any) => log.type === "end",
  );

  const typeRequestLog = type === "start" ? startRequestLog : endRequestLog;
  const typeRequest = type === "start" ? startRequest : endRequest;

  const detailMessages =
    type === "start" ? messages?.start_request : messages?.end_request;

  const watchedFields = form.watch([
    "start_request.is_self_pickup",
    "start_request.driver_id",
    "start_request.distance",
    "start_request.address",
    "end_request.is_self_pickup",
    "end_request.driver_id",
    "end_request.distance",
    "end_request.address",
  ]);

  const Option = AntdSelect;
  useEffect(() => {
    if (switchValue) {
      form.setValue("end_request.is_self_pickup", watchedFields[0]);
      form.setValue("end_request.driver_id", watchedFields[1]);
      form.setValue("end_request.distance", watchedFields[2]);
      form.setValue("end_request.address", watchedFields[3]);
    }
  }, [...watchedFields, switchValue]);

  return (
    <>
      <div className="space-y-4">
        <div className="lg:flex justify-between">
          <h3 className="mb-4">{title}</h3>
          {type === "end" && lastPath !== "detail" && (
            <div className="flex gap-2">
              <Label htmlFor="same-field" className="font-normal text-sm">
                Samakan data seperti Pengambilan
              </Label>
              <Switch
                id="same-field"
                checked={switchValue}
                onCheckedChange={() => setSwitchValue(!switchValue)}
              />
            </div>
          )}
        </div>
        {/* Layanan */}
        <div className={cn("gap-5")}>
          <FormField
            control={form.control}
            name={`${type}_request.is_self_pickup`}
            render={({ field }) => {
              return (
                <FormItem className="flex flex-col">
                  <FormLabel className="relative label-required w-fit">
                    Layanan
                  </FormLabel>
                  <FormControl>
                    <Tabs
                      defaultValue={field.value == true ? "1" : "0"}
                      value={field.value == true ? "1" : "0"}
                      onValueChange={field.onChange}
                    >
                      <TabsList className="grid w-full grid-rows-2 lg:grid-cols-2 lg:grid-rows-none h-[100px] lg:h-[40px]">
                        {lists.map((list, index) => {
                          return (
                            <TabsTrigger
                              disabled={!isEdit || loading || switchValue}
                              key={index}
                              value={list.value}
                              onClick={() => {
                                form.setValue(
                                  `${type}_request.is_self_pickup`,
                                  list.value == "0" ? false : true,
                                );
                              }}
                              className="h-[40px] lg:h-[30px]"
                            >
                              {list.name}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                  {detailMessages?.is_self_pickup && (
                    <FormMessage className="text-main">
                      {detailMessages?.is_self_pickup}
                    </FormMessage>
                  )}
                </FormItem>
              );
            }}
          />
        </div>
        {/* Penanggung Jawab */}
        <div className="flex gap-2">
          {isEdit ? (
            <FormField
              name={`${type}_request.driver_id`}
              control={form.control}
              render={({ field }) => (
                <Space size={12} direction="vertical" className="w-full">
                  <FormLabel className="relative label-required">
                    Penanggung Jawab
                  </FormLabel>
                  <div className="flex">
                    <FormControl>
                      <AntdSelect
                        defaultValue={
                          type === "start"
                            ? initialData?.start_request?.driver?.name
                            : initialData?.end_request?.driver?.name
                        }
                        showSearch
                        placeholder="Pilih Penanggung Jawab"
                        className={cn("mr-2 w-full")}
                        style={{
                          // width: `${isMinimized ? "385px" : "267px"}`,
                          height: "40px",
                        }}
                        onSearch={setSearchDriverTerm}
                        onChange={field.onChange}
                        onPopupScroll={handleScrollDrivers}
                        filterOption={false}
                        notFoundContent={
                          isFetchingNextDrivers ? (
                            <p className="px-3 text-sm">loading</p>
                          ) : null
                        }
                        // append value attribute when field is not  empty
                        {...(!isEmpty(field.value) && {
                          value: field.value,
                        })}
                        disabled={switchValue}
                      >
                        {lastPath !== "preview" &&
                          lastPath !== "create" &&
                          isEdit && (
                            <Option
                              value={
                                type == "start"
                                  ? initialData?.start_request?.driver?.id?.toString()
                                  : initialData?.end_request?.driver?.id?.toString()
                              }
                            >
                              {type == "start"
                                ? initialData?.start_request?.driver?.name
                                : initialData?.end_request?.driver?.name}
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
                    <Button
                      className={cn(
                        buttonVariants({ variant: "main" }),
                        "max-w-[65px] h-[40px]",
                      )}
                      disabled={
                        !form.getFieldState(`${type}_request.driver_id`)
                          .isDirty &&
                        isEmpty(form.getValues(`${type}_request.driver_id`))
                      }
                      type="button"
                      onClick={handleButton}
                    >
                      Lihat
                    </Button>
                  </div>
                  <FormMessage />
                  {detailMessages?.driver_id && (
                    <FormMessage className="text-main">
                      {detailMessages?.driver_id}
                    </FormMessage>
                  )}
                </Space>
              )}
            />
          ) : (
            <FormItem>
              <FormLabel>Penanggung Jawab</FormLabel>
              <div className="flex">
                <FormControl className="disabled:opacity-100">
                  <Input
                    className={cn("mr-2")}
                    style={{
                      // width: `${isMinimized ? "385px" : "267px"}`,
                      height: "40px",
                    }}
                    disabled={!isEdit || loading}
                    value={
                      type === "start"
                        ? initialData?.start_request?.driver?.name
                        : initialData?.end_request?.driver?.name
                    }
                  />
                </FormControl>
                <Button
                  className={cn(
                    buttonVariants({ variant: "main" }),
                    "max-w-[65px] h-[40px]",
                  )}
                  disabled={
                    !form.getFieldState(`${type}_request.driver_id`).isDirty &&
                    isEmpty(form.getValues(`${type}_request.driver_id`))
                  }
                  type="button"
                  onClick={handleButton}
                >
                  Lihat
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        </div>
        {!form.getValues(`${type}_request.is_self_pickup`) && (
          <div className={cn("flex gap-2 items-end")}>
            <FormField
              name={`${type}_request.distance`}
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="relative label-required">
                      Jarak
                    </FormLabel>
                    <FormControl>
                      <Input
                        min={0}
                        disabled={!isEdit || loading || switchValue}
                        type="number"
                        placeholder="Masukkan jarak (contoh 10 Km)"
                        className={cn("h-[40px]")}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        // append value attribute when this field is not empty
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                    {detailMessages?.distance && (
                      <FormMessage className="text-main">
                        {detailMessages?.distance}
                      </FormMessage>
                    )}
                  </FormItem>
                );
              }}
            />
          </div>
        )}
        {/* Alamat */}
        <div>
          {!isEdit ? (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <p
                className="border border-gray-200 rounded-md px-3 py-1 break-words"
                dangerouslySetInnerHTML={{
                  __html: !isEmpty(
                    type === "start"
                      ? defaultValues?.start_request?.address
                      : defaultValues?.end_request?.address,
                  )
                    ? makeUrlsClickable(
                        type === "start"
                          ? defaultValues?.start_request?.address.replace(
                              /\n/g,
                              "<br />",
                            )
                          : defaultValues?.end_request?.address.replace(
                              /\n/g,
                              "<br />",
                            ),
                      )
                    : "-",
                }}
              />
            </FormItem>
          ) : (
            !form.getValues(`${type}_request.is_self_pickup`) && (
              <FormField
                control={form.control}
                name={`${type}_request.address`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="relative label-required">
                      Alamat
                    </FormLabel>
                    <FormControl className="disabled:opacity-100">
                      <Textarea
                        id="alamat"
                        placeholder="Masukkan alamat lengkap...."
                        className="col-span-3"
                        rows={3}
                        disabled={!isEdit || loading || switchValue}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                    {detailMessages?.address && (
                      <FormMessage className="text-main">
                        {detailMessages?.address}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />
            )
          )}
        </div>
        {lastPath === "detail" && (
          <>
            {/* Bukti Serah Terima */}
            <div>
              <FormItem>
                <FormLabel>Bukti Serah Terima</FormLabel>
                <Carousel>
                  <CarouselContent className="-ml-1">
                    {isEmpty(typeRequestLog?.[0]?.photos) && (
                      <div className="ml-1">
                        <p className="text-base font-normal">
                          Belum selesai dilakukan
                        </p>
                      </div>
                    )}
                    {typeRequestLog?.[0]?.photos?.length > 0 &&
                      typeRequestLog?.[0]?.photos?.map(
                        (photo: any, index: any) => (
                          <CarouselItem
                            key={index}
                            className="pl-1 md:basis-1/2 lg:basis-1/3"
                          >
                            <div className="p-1">
                              {/* <Card>
                              <CardContent className="flex aspect-square items-center justify-center p-6 relative  w-[300px] h-[202px]">
                                <Image
                                  className="border object-cover cursor-pointer rounded-lg"
                                  alt={"test"}
                                  src={photo?.photo}
                                  fill
                                />
                              </CardContent>
                            </Card> */}
                              <div
                                key={index}
                                className=" w-full h-[300px] flex-shrink-0 flex aspect-square items-center justify-center relative "
                              >
                                <img
                                  src={photo.photo}
                                  alt={`Slide ${index}`}
                                  className="border object-cover cursor-pointer rounded-lg w-full h-full"
                                  onClick={() => {
                                    setOpen(true);
                                    onHandlePreview(photo?.photo);
                                  }}
                                />
                              </div>
                            </div>
                          </CarouselItem>
                        ),
                      )}
                  </CarouselContent>
                  {typeRequestLog?.[0]?.photos?.length > 2 && (
                    <>
                      <CarouselPrevious
                        type="button"
                        className="-left-1 top-1/2 -translate-y-1/2 bg-accent"
                      />
                      <CarouselNext
                        type="button"
                        className="-right-1 top-1/2 -translate-y-1/2 bg-accent"
                      />
                    </>
                  )}
                </Carousel>
              </FormItem>
            </div>
            {/* Durasi */}
            <div>
              <FormItem>
                <FormLabel>Durasi</FormLabel>
                <FormControl>
                  <Input
                    className={cn("w-full")}
                    placeholder="Tanggal dan waktu selesai"
                    value={
                      typeRequest?.progress_duration_second
                        ? convertTime(typeRequest?.progress_duration_second)
                        : "--"
                    }
                    readOnly
                    disabled
                  />
                </FormControl>
              </FormItem>
            </div>
            {/* Catatan Driver */}
            <div>
              <FormItem>
                <FormLabel>Catatan Driver</FormLabel>
                <FormControl>
                  <Input
                    className={cn("w-full")}
                    placeholder="Tanggal dan waktu selesai"
                    value={typeRequestLog?.[0]?.description ?? "-"}
                    readOnly
                    disabled
                  />
                </FormControl>
              </FormItem>
            </div>
          </>
        )}
      </div>

      <Separator className={cn("mt-1")} />

      <PreviewImage
        isOpen={open}
        onClose={() => setOpen(false)}
        content={content}
      />
    </>
  );
};
