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
import { cn, convertTime, makeUrlsClickable, formatRupiah } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useGetDetailProduct, useGetAvailableProducts } from "@/hooks/api/useProduct";
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
import { useGetProductAddons } from "@/hooks/api/useAddons";
import {
  useEditProductOrder,
  usePostProductOrder,
  useAcceptProductOrder,
  useRejectProductOrder,
} from "@/hooks/api/useProductOrder";
import { useProductOrderCalculate } from "@/hooks/api/useProductOrder";
import { ApprovalModal } from "../modal/approval-modal";
import { NumericFormat } from "react-number-format";
import "dayjs/locale/id";
import CustomerDetail from "./section/customer-detail";
import DriverDetail from "./section/driver-detail";
import ProductPriceDetail from "./section/product-price";
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
import { DetailPrice, ProductOrderFormProps, ProductOrderFormValues, productOrderSchema } from "@/components/forms/types/product-order";
import {
  getPaymentStatusLabel,
  getStatusVariant,
  OrderStatus,
} from "@/app/(dashboard)/dashboard/orders/[orderId]/types/order";
import { useUser } from "@/context/UserContext";
import { HistoryModal } from "@/components/modal/history-modal";
import { Clock } from "lucide-react";
import { ProductDetail } from "@/components/product-detail";

export const IMG_MAX_LIMIT = 3;

export const ProductOrderForm: React.FC<ProductOrderFormProps> = ({
  initialData,
  isEdit,
  isPreview,
  productOrderId,
  showHistoryButton = false,
  onHistoryClick,
}) => {
  const { user } = useUser();
  const { orderId } = useParams();
  const finalOrderId = productOrderId || orderId;
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
  const { mutate: createProductOrder } = usePostProductOrder();
  const { mutate: editProductOrder } = useEditProductOrder(finalOrderId && finalOrderId !== "undefined" ? (Array.isArray(finalOrderId) ? finalOrderId[0] : finalOrderId) : "" as string);
  const { mutate: acceptProductOrder } = useAcceptProductOrder(finalOrderId && finalOrderId !== "undefined" ? (Array.isArray(finalOrderId) ? finalOrderId[0] : finalOrderId) : "" as string);
  const { mutate: rejectProductOrder } = useRejectProductOrder();
  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
  const [searchProductTerm, setSearchProductTerm] = useState("");
  const [searchCustomerDebounce] = useDebounce(searchCustomerTerm, 500);
  const [searchProductDebounce] = useDebounce(searchProductTerm, 500);
  const days: number[] = Array.from({ length: 30 });
  const [detail, setDetail] = useState<DetailPrice | null>(null);
  const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
  const [openRejectModal, setOpenRejectModal] = useState<boolean>(false);
  const [openCustomerDetail, setOpenCustomerDetail] = useState<boolean>(false);
  const [openProductDetail, setOpenProductDetail] = useState<boolean>(false);
  const [openDriverDetail, setOpenDriverDetail] = useState<boolean>(false);
  const [showServicePrice, setShowServicePrice] = useState<boolean>(true);
  const [type, setType] = useState<string>("");
  const [schema, setSchema] = useState(() => productOrderSchema);
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
    data: products,
    isFetching: isFetchingProducts,
  } = useGetAvailableProducts({ q: searchProductDebounce });

  const { data: insurances } = useGetInsurances();
  const { mutate: calculatePrice } = useProductOrderCalculate();
  
  // Addons state and API
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{addonId: number, quantity: number}>>([]);

  // Calculate price on component mount with initialData (like in detailorder-form.tsx)
  useEffect(() => {
    if (initialData) {
      const payload = {
        ...(initialData?.product?.id ? { product_id: +initialData?.product?.id } : { fleet_id: +initialData?.fleet?.id }),
        customer_id: +initialData?.customer?.id,
        description: initialData?.description,
        is_out_of_town: initialData?.is_out_of_town,
        is_with_driver: initialData?.is_with_driver,
        insurance_id: +initialData?.insurance?.id,
        start_request: {
          is_self_pickup: initialData?.start_request?.is_self_pickup,
          address: initialData?.start_request?.address,
          distance: +initialData?.start_request?.distance,
          driver_id: +initialData?.start_request?.driver_id,
        },
        end_request: {
          is_self_pickup: initialData?.end_request?.is_self_pickup,
          address: initialData?.end_request?.address,
          distance: +initialData?.end_request?.distance,
          driver_id: +initialData?.end_request?.driver_id,
        },
        date: initialData?.start_date,
        duration: +initialData?.duration,
        discount: +initialData?.discount,
        service_price: +initialData?.service_price,
        out_of_town_price: +initialData?.out_of_town_price,
        out_of_town_price_description: initialData?.out_of_town_price_description,
        other_price: +initialData?.other_price,
        other_price_description: initialData?.other_price_description,
        ...(initialData?.additional_services && {
          additional_services: initialData?.additional_services.map(
            (field: { name: string; price: string }) => {
              return {
                name: field.name,
                price: isString(field.price)
                  ? +field.price.replace(/,/g, '')
                  : field.price,
              };
            },
          ),
        }),
        ...(initialData?.addons && {
          addons: initialData?.addons.map(
            (addon: any) => {
              return {
                addon_id: Number(addon.addon_id),
                name: String(addon.name),
                price: Number(addon.price),
                quantity: Number(addon.quantity),
              };
            },
          ),
        }),
      };

      calculatePrice(payload, {
        onSuccess: (data) => {
          setDetail(data.data);
        },
      });
    }
  }, [
    initialData?.product?.id,
    initialData?.fleet?.id,
    initialData?.description,
    initialData?.is_out_of_town,
    initialData?.is_with_driver,
    initialData?.insurance?.id,
    initialData?.start_request?.is_self_pickup,
    initialData?.start_request?.address,
    initialData?.end_request?.is_self_pickup,
    initialData?.end_request?.address,
    initialData?.start_date,
    initialData?.duration,
    initialData?.addons,
  ]);

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
        product: initialData?.product?.id?.toString(),
        description: initialData?.description,
        is_with_driver: initialData?.is_with_driver,
        is_out_of_town: initialData?.is_out_of_town,
        date: initialData?.start_date,
        duration: initialData?.duration?.toString(),
        discount: initialData?.discount?.toString(),
        insurance_id: initialData?.insurance
          ? initialData?.insurance?.id.toString()
          : "0",
        service_price: initialData?.service_price?.toString() || "0",
        rental_type: initialData?.rental_type || {
          is_daily: true,
          is_weekly: false,
          is_monthly: false,
        },
        selected_price_type: initialData?.selected_price_type || "daily",
        additionals: initialData?.additional_services?.map((service: any) => ({
          name: service.name,
          price: service.price?.toString() || "",
        })) || [],
        voucher_code: initialData?.applied_voucher_code || "",
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
        customer: undefined,
        product: undefined,
        description: "",
        is_with_driver: false,
        is_out_of_town: false,
        date: "",
        duration: "1",
        discount: "0",
        insurance_id: "0",
        service_price: "0",
        rental_type: {
          is_daily: true,
          is_weekly: false,
          is_monthly: false,
        },
        selected_price_type: "daily",
        additionals: [],
        voucher_code: "",
      };

  const form = useForm<ProductOrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionals",
  });



  const customerField = form.watch("customer");
  const productField = form.watch("product");
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
  const rentalTypeField = form.watch("rental_type");
  const selectedPriceTypeField = form.watch("selected_price_type");
  const voucherCodeField = form.watch("voucher_code");



  const watchServicePrice = !(startSelfPickUpField && endSelfPickUpField);
  const servicePrice = serviceField ?? 0;

  const { data: customerData, isFetching: isFetchingCustomer } =
    useGetDetailCustomer(form.getValues("customer") || "");
  const { data: productData, isFetching: isFetchingProduct } = useGetDetailProduct(
    form.getValues("product") || "",
  );

  const driverId =
    type === "start"
      ? form.getValues("start_request.driver_id")
      : form.getValues("end_request.driver_id");

  const { data: driver, isFetching: isFetchingDriver } = useGetDetailDriver(
    driverId || ""
  );

  // Get product category for addons filtering
  const productCategory = useMemo(() => {
    if (productData?.data?.category) {
      return productData.data.category.toLowerCase();
    }
    return null;
  }, [productData?.data?.category]);
  
  // Calculate date range for addons availability
  const addonDateRange = useMemo(() => {
    if (dateField && durationField) {
      const startDate = dayjs(dateField).format('YYYY-MM-DD');
      const endDate = dayjs(dateField).add(Number(durationField) - 1, 'day').format('YYYY-MM-DD');
      return { startDate, endDate };
    }
    return null;
  }, [dateField, durationField]);
  
  // Get addons with category and date filtering
  const { data: addOnsData } = useGetProductAddons({
    category: productCategory,
    start_date: addonDateRange?.startDate,
    end_date: addonDateRange?.endDate,
    page: 1,
    limit: 100
  });
  
  // Use API data or fallback to empty array, show all available addons
  const addOns = useMemo(() => {
    const data = addOnsData?.items || [];
    const filteredAddons = Array.isArray(data) ? data.filter((addon: any) => {
      // Only filter by is_available, show all addons regardless of available_quantity
      return addon.is_available === true;
    }) : [];
    return filteredAddons;
  }, [addOnsData?.items, addonDateRange]);
  
  // Initialize selectedAddOns from initialData
  useEffect(() => {
    if (initialData?.addons && addOns.length > 0) {
      const initialAddons = initialData.addons.map((addon: any) => ({
        addonId: addon.addon_id,
        quantity: addon.quantity,
      }));
      setSelectedAddOns(initialAddons);
    }
  }, [initialData?.addons, addOns]);

  const [end, setEnd] = useState("");
  const now = dayjs(form.getValues("date"));
  useEffect(() => {
    const end = now
      .add(+form.getValues("duration"), "day")
      .locale("id")
      .format("HH:mm:ss - dddd, DD MMMM (YYYY)");
    setEnd(end);
  }, [now, form.getValues("duration")]);

  const createPayload = (data: ProductOrderFormValues) => {
    console.log('🔍 createPayload data:', data);
    console.log('🔍 createPayload rental_type:', data.rental_type);
    console.log('🔍 createPayload selected_price_type:', data.selected_price_type);
    
    return {
    start_request: {
      is_self_pickup: data.start_request.is_self_pickup,
      driver_id: data.start_request.driver_id && data.start_request.driver_id !== "" ? +data.start_request.driver_id : undefined,
      distance: data.start_request.distance && data.start_request.distance !== "" ? +data.start_request.distance : undefined,
      address: data.start_request.address,
      ...(data.start_request.status && { status: data.start_request.status }),
    },
    end_request: {
      is_self_pickup: data.end_request.is_self_pickup,
      driver_id: data.end_request.driver_id && data.end_request.driver_id !== "" ? +data.end_request.driver_id : undefined,
      distance: data.end_request.distance && data.end_request.distance !== "" ? +data.end_request.distance : undefined,
      address: data.end_request.address,
      ...(data.end_request.status && { status: data.end_request.status }),
    },
    customer_id: data.customer ? Number(data.customer) : undefined,
    product_id: data.product ? Number(data.product) : undefined,
    description: data.description,
    is_with_driver: false, // Product orders don't use driver
    is_out_of_town: false, // Product orders don't use out of town
    date: data.date,
    duration: data.duration ? Number(data.duration) : undefined,
    discount: data.discount ? (isString(data.discount) 
      ? Number(data.discount.replace(/,/g, "")) 
      : Number(data.discount)) : undefined,
    insurance_id: data.insurance_id && data.insurance_id !== "0" && data.insurance_id !== "" ? +data.insurance_id : undefined,
    service_price: data.service_price ? (isString(data.service_price) 
      ? Number(data.service_price.replace(/,/g, "")) 
      : Number(data.service_price)) : undefined,
    rental_type: data.rental_type,
    selected_price_type: data.selected_price_type,
    ...(data.additionals && data.additionals.length > 0 && {
      additional_services: data.additionals.map((service: any) => {
        let price: number;
        if (typeof service.price === 'string') {
          const cleanPrice = service.price.replace(/,/g, "");
          price = Number(cleanPrice);
        } else {
          price = Number(service.price);
        }
        
        if (isNaN(price)) {
          throw new Error("Harga harus berupa angka yang valid");
        }
        
        return {
          name: service.name,
          price: price,
        };
      }),
    }),
    ...(selectedAddOns && selectedAddOns.length > 0 && addOns && addOns.length > 0 && {
      addons: (() => {
        const validAddons = selectedAddOns
          .map((selection: any) => {
            const addon = addOns.find((a: any) => a.id === selection.addonId);
            // Only include addon if it exists and has valid data
            if (addon && addon.id && addon.name && addon.price !== undefined && addon.price !== null) {
              return {
                addon_id: Number(addon.id),
                name: String(addon.name),
                price: Number(addon.price),
                quantity: Number(selection.quantity),
              };
            }
            return null;
          })
          .filter(Boolean); // Remove null values
        
        return validAddons.length > 0 ? validAddons : undefined;
      })(),
    }),
    ...(data.voucher_code ? { voucher_code: data.voucher_code } : {}),
   }
  };

  const onSubmit = async (data: ProductOrderFormValues) => {
    setLoading(true);

    // Validate required fields
    if (!data.customer || !data.product) {
      toast({
        variant: "destructive",
        title: "Customer and Product are required",
      });
      setLoading(false);
      return;
    }

    const handleSuccess = () => {
      // Invalidate all relevant queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "product"] });
      if (finalOrderId) {
        queryClient.invalidateQueries({ queryKey: ["orders", "product", finalOrderId] });
        queryClient.invalidateQueries({ queryKey: ["orders", finalOrderId] });
      }
      toast({
        variant: "success",
        title: toastMessage,
      });
      // router.refresh();
      router.push(`/dashboard/product-orders`);
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
        if (!finalOrderId || finalOrderId === "undefined") {
          toast({
            variant: "destructive",
            title: "Order ID tidak valid",
          });
          setLoading(false);
          return;
        }
        handleResponse(payload, editProductOrder);
        break;
      case "preview":
        if (!finalOrderId || finalOrderId === "undefined") {
          toast({
            variant: "destructive",
            title: "Order ID tidak valid",
          });
          setLoading(false);
          return;
        }
        handleResponse(payload, acceptProductOrder);
        break;
      default:
                  handleResponse(payload, createProductOrder);
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

  const handleScrollProducts = (event: React.UIEvent<HTMLDivElement>) => {
    // Products dropdown uses regular query, no infinite scroll needed
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

  // /const { mutate: calculatePrice } = useOrderCalculate();

  useEffect(() => {
    if (startSelfPickUpField && endSelfPickUpField) {
      // Jika start_request.is_self_pickup dan end_request.is_self_pickup keduanya true
      setSchema(productOrderSchema);
      setShowServicePrice(false);
    } else if (startSelfPickUpField) {
      // Jika hanya start_request.is_self_pickup yang true
              setSchema(productOrderSchema);
      setShowServicePrice(true);
    } else if (endSelfPickUpField) {
      // Jika hanya end_request.is_self_pickup yang true
              setSchema(productOrderSchema);
      setShowServicePrice(true);
    } else {
      // Jika keduanya false
      setSchema(productOrderSchema);
      setShowServicePrice(true);
    }
  }, [startSelfPickUpField, endSelfPickUpField]);

  useEffect(() => {
    const payload = {
      customer_id: Number(customerField ?? 0),
      product_id: Number(productField ?? 0),
      is_out_of_town: isOutOfTownField,
      is_with_driver: isWithDriverField,
              insurance_id: Number(insuranceField ?? 0),
      start_request: {
        is_self_pickup: startSelfPickUpField == true ? true : false,
                  driver_id: Number(startDriverField ?? 0),
        ...(!startSelfPickUpField && {
                      distance: Number(startDistanceField ?? 0),
          address: startAddressField,
        }),
      },
      end_request: {
        is_self_pickup: endSelfPickUpField == true ? true : false,
                  driver_id: Number(endDriverField ?? 0),
        ...(!endSelfPickUpField && {
                      distance: Number(endDistanceField ?? 0),
          address: endAddressField,
        }),
      },
      description: descriptionField,
      ...(!isEmpty(dateField) && {
        date: dateField,
        duration: Number(durationField ?? 1),
      }),
      discount: isString(discountField) 
        ? Number(discountField.replace(/,/g, "")) 
        : Number(discountField ?? 0),
      ...(watchServicePrice && {
        service_price: isString(serviceField)
          ? +serviceField.replace(/,/g, "")
          : serviceField,
      }),
      rental_type: rentalTypeField,
      selected_price_type: selectedPriceTypeField,
      ...(additionalField && additionalField.length !== 0 && {
        additional_services: (additionalField ?? []).map((field: any) => {
          return {
            name: field.name,
            price: (() => {
              const price = typeof field.price === 'string' ? Number(field.price.replace(/,/g, "")) : Number(field.price);
              if (isNaN(price)) {
                return 0; // fallback value
              }
              return price;
            })(),
          };
        }),
      }),
      ...(selectedAddOns && selectedAddOns.length !== 0 && addOns && addOns.length > 0 && {
        addons: (() => {
          const validAddons = selectedAddOns
            .map((selection: any) => {
              const addon = addOns.find((a: any) => a.id === selection.addonId);
              // Only include addon if it exists and has valid data
              if (addon && addon.id && addon.name && addon.price !== undefined && addon.price !== null) {
                return {
                  addon_id: Number(addon.id),
                  name: String(addon.name),
                  price: Number(addon.price),
                  quantity: Number(selection.quantity),
                };
              }
              return null;
            })
            .filter(Boolean); // Remove null values
            
          return validAddons.length > 0 ? validAddons : undefined;
        })(),
      }),
      ...(voucherCodeField ? { voucher_code: voucherCodeField } : {}),
    };

    // Calculate price for product orders
    if (productField && customerField && dateField && durationField) {
      calculatePrice(payload, {
        onSuccess: (data: any) => {
          setDetail(data.data);
        },
        onError: (error: any) => {
          console.error('Calculate price error:', error);
        },
      });
    }
  }, [
    additionalField,
    selectedAddOns,
    addOns,
    customerField,
    productField,
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
    rentalTypeField,
    selectedPriceTypeField,
    voucherCodeField,
    JSON.stringify(additionalField),
    JSON.stringify(selectedAddOns),
  ]);

  // disable date for past dates
  const disabledDate = (current: Dayjs | null): boolean => {
    // ada request untuk enable past date ketika update order
    if (lastPath === "edit") return false;

    return current ? current < dayjs().startOf("day") : false;
  };

  // function for handle reject
  const handleRejectOrder = (reason: string) => {
    console.log("handleRejectOrder called with reason:", reason);
    console.log("finalOrderId:", finalOrderId);
    
    if (!finalOrderId || finalOrderId === "undefined") {
      toast({
        variant: "destructive",
        title: "Order ID tidak valid",
      });
      setRejectLoading(false);
      return;
    }

    if (!reason || !reason.trim()) {
      toast({
        variant: "destructive",
        title: "Alasan penolakan harus diisi",
      });
      return;
    }

    setRejectLoading(true);
    console.log("Calling rejectProductOrder with:", { orderId: finalOrderId, reason });
    
    rejectProductOrder(
      { 
        orderId: finalOrderId, 
        reason 
      },
      {
        onSuccess: () => {
          console.log("Reject success");
          // Invalidate all relevant queries for real-time updates
          queryClient.invalidateQueries({ queryKey: ["orders", "product"] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          if (finalOrderId) {
            queryClient.invalidateQueries({ queryKey: ["orders", "product", finalOrderId] });
            queryClient.invalidateQueries({ queryKey: ["orders", finalOrderId] });
          }
          toast({
            variant: "success",
            title: "Pesanan berhasil ditolak",
          });
          router.push(`/dashboard/product-orders`);
        },
        onSettled: () => {
          console.log("Reject settled");
          setRejectLoading(false);
          setOpenRejectModal(false);
        },
        onError: (error: any) => {
          console.log("Reject error:", error);
          toast({
            variant: "destructive",
            title: "Uh oh! ada sesuatu yang error",
            description: `error: ${error?.response?.data?.message}`,
          });
        },
      }
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
              customer_id: generateMessage(customerField, defaultValues.customer),
        product: generateMessage(productField, defaultValues.product),
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
    productField,
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
      : lastPath === "create"
      ? "Apakah Anda Yakin Ingin Membuat Pesanan ini?"
      : "Apakah Anda Yakin Ingin Mengonfirmasi Pesanan ini?";

  return (
    <>
      {openApprovalModal && (
        <ApprovalModal
          heading="pesanan"
          isOpen={openApprovalModal}
          onClose={() => setOpenApprovalModal(false)}
          onConfirm={() => {
            setLoading(true);
            const currentData = form.getValues();
            const payload = createPayload(currentData);
            
            // Determine which action to take based on the context
            if (lastPath === "create") {
              // For create flow, use createProductOrder
              createProductOrder(payload, {
                onSuccess: () => {
                  // Invalidate all relevant queries for real-time updates
                  queryClient.invalidateQueries({ queryKey: ["orders"] });
                  queryClient.invalidateQueries({ queryKey: ["orders", "product"] });
                  if (finalOrderId) {
                    queryClient.invalidateQueries({ queryKey: ["orders", "product", finalOrderId] });
                    queryClient.invalidateQueries({ queryKey: ["orders", finalOrderId] });
                  }
                  toast({
                    variant: "success",
                    title: "Pesanan berhasil dibuat!",
                  });
                  router.push(`/dashboard/product-orders`);
                },
                onSettled: () => setLoading(false),
                onError: (error: any) => {
                  setLoading(false);
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
                },
              });
            } else {
              // For edit/preview flow, use acceptProductOrder
              acceptProductOrder(payload, {
                onSuccess: () => {
                  // Invalidate all relevant queries for real-time updates
                  queryClient.invalidateQueries({ queryKey: ["orders"] });
                  queryClient.invalidateQueries({ queryKey: ["orders", "product"] });
                  if (finalOrderId) {
                    queryClient.invalidateQueries({ queryKey: ["orders", "product", finalOrderId] });
                    queryClient.invalidateQueries({ queryKey: ["orders", finalOrderId] });
                  }
                  toast({
                    variant: "success",
                    title: "Pesanan berhasil dikonfirmasi!",
                  });
                  router.push(`/dashboard/product-orders`);
                },
                onSettled: () => setLoading(false),
                onError: (error: any) => {
                  setLoading(false);
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
                },
              });
            }
          }}
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
        {lastPath === "create" && (
          <Button
            onClick={() => setOpenApprovalModal(true)}
            className={cn(buttonVariants({ variant: "main" }))}
            type="button"
            disabled={loading}
          >
            {loading ? <Spinner className="h-4 w-4" /> : "Create"}
          </Button>
        )}
              {lastPath !== "edit" && (
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/product-orders/${finalOrderId}/edit`}
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
                  {showHistoryButton && (
                    <Button
                      onClick={onHistoryClick}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      History
                    </Button>
                  )}
                </div>
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
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/orders/${finalOrderId}/edit`}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "text-black",
                  )}
                >
                  Edit Pesanan
                </Link>
                {showHistoryButton && (
                  <Button
                    onClick={onHistoryClick}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    History
                  </Button>
                )}
              </div>
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
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              disabled={!form.formState.isDirty}
              className={cn(buttonVariants({ variant: "outline" }), "text-black")}
            >
              Reset berdasarkan data Pelanggan
            </Button>
            <Button
              onClick={() => setOpenApprovalModal(true)}
              className={cn(buttonVariants({ variant: "main" }))}
              type="button"
              disabled={loading}
            >
              {loading ? <Spinner className="h-4 w-4" /> : "Konfirmasi Pesanan"}
            </Button>
          </div>
        )}
      </div>
      <div className="flex gap-4 flex-col lg:!flex-row">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-full basis-2/3"
          >
            <div className="relative space-y-8" id="parent">

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
                  {(lastPath !== "preview" && isEdit) || isPreview ? (
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
                                  {((lastPath !== "create" && isEdit) || isPreview) && (
                                    <Option
                                      value={initialData?.customer?.id?.toString()}
                                    >
                                      {initialData?.customer?.name}
                                    </Option>
                                  )}
                                  {customers?.pages?.map(
                                    (page: any, pageIndex: any) =>
                                      page.data?.items?.map(
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
                                      ) || []
                                  ) || []}

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
                                  setOpenProductDetail(false);
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
                            setOpenProductDetail(false);
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
                  {(lastPath !== "preview" && isEdit) || isPreview ? (
                    <FormField
                      name="product"
                      control={form.control}
                      render={({ field }) => {
                        return (
                          <div className="space-y-2 w-full">
                            <FormLabel className="relative label-required">
                              Produk
                            </FormLabel>
                            <div className="flex">
                              <FormControl>
                                <AntdSelect
                                  className={cn("mr-2 flex-1")}
                                  showSearch
                                  placeholder="Pilih Produk"
                                  style={{
                                    height: "40px",
                                  }}
                                  onSearch={setSearchProductTerm}
                                  onChange={field.onChange}
                                  onPopupScroll={handleScrollProducts}
                                  filterOption={false}
                                  notFoundContent={
                                    isFetchingProducts ? (
                                      <p className="px-3 text-sm">loading</p>
                                    ) : null
                                  }
                                  // append value attribute when field is not  empty
                                  {...(!isEmpty(field.value) && {
                                    value: field.value,
                                  })}
                                >
                                  {((lastPath !== "create" && isEdit) || isPreview) && (
                                    <Option
                                      value={initialData?.product?.id?.toString()}
                                    >
                                      {initialData?.product?.name}
                                    </Option>
                                  )}
                                  {products?.pages?.map(
                                    (page: any, pageIndex: any) =>
                                      page.data?.items?.map(
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
                                      ) || []
                                  ) || []}

                                  {isFetchingProducts && (
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
                                  !form.getFieldState("product").isDirty &&
                                  isEmpty(form.getValues("product"))
                                }
                                type="button"
                                onClick={() => {
                                  setOpenProductDetail(true);
                                  setOpenCustomerDetail(false);
                                  setOpenDriverDetail(false);
                                  scrollDetail();
                                }}
                              >
                                Lihat
                              </Button>
                            </div>
                            <FormMessage />
                            {messages.product && (
                              <FormMessage className="text-main">
                                {messages.product}
                              </FormMessage>
                            )}
                          </div>
                        );
                      }}
                    />
                  ) : (
                    <FormItem>
                      <FormLabel>Produk</FormLabel>
                      <div className="flex">
                        <FormControl className="disabled:opacity-100">
                          <Input
                            className={cn("mr-2")}
                            style={{
                              height: "40px",
                            }}
                            disabled
                            value={initialData?.product?.name ?? "-"}
                          />
                        </FormControl>
                        <Button
                          className={cn(
                            buttonVariants({ variant: "main" }),
                            "w-[65px] h-[40px]",
                          )}
                          disabled={
                            !form.getFieldState("product").isDirty &&
                            isEmpty(form.getValues("product"))
                          }
                          type="button"
                          onClick={() => {
                            setOpenProductDetail(true);
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
                {lastPath !== "preview" && isEdit ? (
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
                        disabled={(!isEdit && !isPreview) || loading}
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

                {/* Rental Type Selection */}
                <FormField
                  control={form.control}
                  name="selected_price_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="relative label-required">
                        Jenis Sewa
                      </FormLabel>
                      <Select
                        disabled={(!isEdit && !isPreview) || loading}
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Update rental_type based on selection
                          const rentalType = {
                            is_daily: value === "daily",
                            is_weekly: value === "weekly", 
                            is_monthly: value === "monthly",
                          };
                          form.setValue("rental_type", rentalType);
                        }}
                        defaultValue={defaultValues.selected_price_type || "daily"}
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
                            <SelectValue placeholder="Pilih jenis sewa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">
                            Harian
                          </SelectItem>
                          <SelectItem value="weekly">
                            Mingguan (Hemat 25%)
                          </SelectItem>
                          <SelectItem value="monthly">
                            Bulanan (Hemat 50%)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
              <Separator className={cn("mt-1")} />
              <DetailSection
                title="Detail Pengambilan"
                form={form}
                initialData={initialData}
                defaultValues={defaultValues}
                loading={loading}
                isEdit={isEdit}
                isPreview={isPreview}
                lists={pengambilan}
                type="start"
                handleButton={() => {
                  setOpenCustomerDetail(false);
                  setOpenProductDetail(false);
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
                isPreview={isPreview}
                lists={pengembalian}
                type="end"
                handleButton={() => {
                  setOpenCustomerDetail(false);
                  setOpenProductDetail(false);
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
                              disabled={(!isEdit && !isPreview) || loading}
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
                                  disabled={(!isEdit && !isPreview) || loading}
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
                                    disabled={(!isEdit && !isPreview) || loading}
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
                      {(isEdit || isPreview) && (
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
                        onClick={() => append({ name: "", price: "" } as any)}
                      >
                        + Add Item
                      </Button>
                    </div>
                  )}
                </div>

                {/* Addon Selection */}
                {addOns && addOns.length > 0 && (
                  <section className="pt-5">
                    <div className="mx-auto w-full">
                      <div className='mb-4 font-gabarito'>
                        <p className="text-xl font-semibold">Aksesoris Tambahan</p>
                      </div>

                      <div className="rounded-md p-4 shadow-md border border-[#1B18181A]">
                        <div className="space-y-3">
                          {addOns.map((addon: any) => {
                            const currentSelection = selectedAddOns.find(s => s.addonId === addon.id);
                            const selectedQuantity = currentSelection?.quantity || 0;
                            // Jika ada start_date dan end_date, gunakan available_quantity dari API
                            // Jika belum ada, hitung manual: stock_quantity - reserved_quantity
                            const availableQuantity = addonDateRange?.startDate && addonDateRange?.endDate 
                              ? (addon.available_quantity || 0)
                              : (addon.stock_quantity || 0) - (addon.reserved_quantity || 0);
                            
                            return (
                              <div key={addon.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-medium text-gray-900">{addon.name}</h5>
                                      <p className="text-sm text-blue-600 font-medium">{formatRupiah(addon.price)}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">
                                        Stock: <span className={`font-medium ${availableQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {availableQuantity > 0 ? availableQuantity : 'Habis untuk tgl ini'}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    type="button"
                                    className="w-7 h-7 rounded bg-gray-200 flex items-center justify-center disabled:opacity-50 text-sm font-medium hover:bg-gray-300"
                                    disabled={selectedQuantity <= 0}
                                    onClick={() => {
                                      if (selectedQuantity > 0) {
                                        if (selectedQuantity === 1) {
                                          setSelectedAddOns(prev => {
                                            const newState = prev.filter(s => s.addonId !== addon.id);
                                            return newState;
                                          });
                                        } else {
                                          setSelectedAddOns(prev => {
                                            const newState = prev.map(s => 
                                              s.addonId === addon.id 
                                                ? { ...s, quantity: s.quantity - 1 }
                                                : s
                                            );
                                            return newState;
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    -
                                  </button>
                                  
                                  <span className="w-8 text-center font-medium text-sm">
                                    {selectedQuantity}
                                  </span>
                                  
                                  <button
                                    type="button"
                                    className="w-7 h-7 rounded bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 text-sm font-medium hover:bg-blue-600"
                                    disabled={selectedQuantity >= availableQuantity}
                                    onClick={() => {
                                      if (selectedQuantity < availableQuantity) {
                                        if (selectedQuantity === 0) {
                                          setSelectedAddOns(prev => {
                                            const newState = [...prev, { addonId: addon.id, quantity: 1 }];
                                            return newState;
                                          });
                                        } else {
                                          setSelectedAddOns(prev => {
                                            const newState = prev.map(s => 
                                              s.addonId === addon.id 
                                                ? { ...s, quantity: s.quantity + 1 }
                                                : s
                                            );
                                            return newState;
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {!isEdit ? (
                  <FormItem>
                    <FormLabel>Permintaan Khusus</FormLabel>
                    <p
                      className="border border-gray-200 rounded-md px-3 break-words"
                      dangerouslySetInnerHTML={{
                                              __html: !isEmpty(initialData?.description)
                        ? makeUrlsClickable(
                            initialData?.description.replace(
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
          {openProductDetail && isFetchingProduct && (
            <div className="flex justify-center items-center h-[100px] w-full">
              <Spinner />
            </div>
          )}

          {openProductDetail && !isFetchingProduct && (
            <ProductDetail
              innerRef={detailRef}
              data={productData?.data}
              onClose={() => setOpenProductDetail(false)}
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

          {!openCustomerDetail && !openProductDetail && !openDriverDetail && (
            <ProductPriceDetail
              innerRef={detailRef}
              initialData={initialData}
              isEdit={isEdit ?? false}
              showServicePrice={showServicePrice}
              showAdditional={additionalField?.length !== 0 || selectedAddOns?.length !== 0}
              form={form}
              detail={detail}
              handleOpenApprovalModal={() => setOpenApprovalModal(true)}
              handleOpenRejectModal={() => setOpenRejectModal(true)}
              confirmLoading={loading}
              rejectLoading={rejectLoading}
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
  isPreview?: boolean;
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
  isPreview,
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
    "start_request.status",
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
      form.setValue("end_request.status", watchedFields[4]);
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
                  <FormLabel className="relative w-fit">
                    Layanan
                  </FormLabel>
                  <FormControl>
                    <Tabs
                      defaultValue={field.value === true ? "1" : "0"}
                      value={field.value === true ? "1" : "0"}
                      onValueChange={(value) => {
                        field.onChange(value === "1" ? true : false);
                      }}
                    >
                      <TabsList className="grid w-full grid-rows-2 lg:grid-cols-2 lg:grid-rows-none h-[100px] lg:h-[40px]">
                        {lists.map((list, index) => {
                          return (
                            <TabsTrigger
                              disabled={(!isEdit && !isPreview) || loading || switchValue}
                              key={index}
                              value={list.value}
                              onClick={() => {
                                form.setValue(
                                  `${type}_request.is_self_pickup`,
                                  list.value === "0" ? false : true,
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
          {(isEdit || isPreview) ? (
            <FormField
              name={`${type}_request.driver_id`}
              control={form.control}
              render={({ field }) => (
                <Space size={12} direction="vertical" className="w-full">
                  <FormLabel className="relative">
                    Penanggung Jawab
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <AntdSelect
                        defaultValue={
                          type === "start"
                            ? initialData?.start_request?.driver?.name
                            : initialData?.end_request?.driver?.name
                        }
                        showSearch
                        placeholder="Pilih Penanggung Jawab"
                        className={cn("w-full")}
                        style={{
                          // width: `${isMinimized ? "385px" : "267px"}`,
                          height: "40px",
                        }}
                        onSearch={setSearchDriverTerm}
                        onChange={(value) => {
                          field.onChange(value);
                          // Auto set status to pending when driver is selected
                          if (value) {
                            form.setValue(`${type}_request.status`, "pending");
                          }
                        }}
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
                          (isEdit || isPreview) && (
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
                        {drivers?.pages?.map((page: any, pageIndex: any) =>
                          page.data?.items?.map((item: any, itemIndex: any) => {
                            return (
                              <Option key={item.id} value={item.id.toString()}>
                                {item.name}
                              </Option>
                            );
                          }) || []
                        ) || []}

                        {isFetchingNextDrivers && (
                          <Option disabled>
                            <p className="px-3 text-sm">loading</p>
                          </Option>
                        )}
                      </AntdSelect>
                    </FormControl>
                    {!isEmpty(field.value) && (
                      <Button
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "h-[40px] px-3 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600",
                        )}
                        type="button"
                        disabled={switchValue}
                        onClick={() => {
                          field.onChange("");
                          form.setValue(`${type}_request.status`, "belum_diatur");
                        }}
                      >
                        Cancel
                      </Button>
                    )}
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
        
        {/* Status Request */}
        {(isEdit || isPreview) && (
          <div className="space-y-2">
            <FormField
              name={`${type}_request.status`}
              control={form.control}
              render={({ field }) => {
                // Get current driver value
                const currentDriverId = form.getValues(`${type}_request.driver_id`);
                const hasDriver = currentDriverId && currentDriverId !== "";
                
                return (
                  <FormItem>
                    <FormLabel className="relative">
                      Status Request
                    </FormLabel>
                    <Select
                      disabled={(!isEdit && !isPreview) || loading || switchValue || hasDriver}
                      onValueChange={field.onChange}
                      value={field.value || typeRequest?.status || "belum_diatur"}
                    >
                      <FormControl className="disabled:opacity-100 h-[40px]">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Status Request" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="belum_diatur">Belum Diatur</SelectItem>
                        <SelectItem 
                          value="pending" 
                          disabled={!hasDriver}
                        >
                          PIC Driver {!hasDriver && "(Pilih driver terlebih dahulu)"}
                        </SelectItem>
                        <SelectItem value="extend">Extend</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {hasDriver && (
                      <p className="text-sm text-muted-foreground">
                        Lepas driver terlebih dahulu untuk mengubah status
                      </p>
                    )}
                    {detailMessages?.status && (
                      <FormMessage className="text-main">
                        {detailMessages?.status}
                      </FormMessage>
                    )}
                  </FormItem>
                );
              }}
            />
          </div>
        )}
        
        {!form.getValues(`${type}_request.is_self_pickup`) && (
          <div className={cn("flex gap-2 items-end")}>
            <FormField
              name={`${type}_request.distance`}
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="relative">
                      Jarak
                    </FormLabel>
                    <FormControl>
                      <Input
                        min={0}
                        disabled={(!isEdit && !isPreview) || loading || switchValue}
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
          {(!isEdit && !isPreview) ? (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <p
                className="border border-gray-200 rounded-md px-3 py-1 break-words"
                dangerouslySetInnerHTML={{
                  __html: !isEmpty(
                    type === "start"
                      ? initialData?.start_request?.address
                      : initialData?.end_request?.address,
                  )
                    ? makeUrlsClickable(
                        type === "start"
                          ? initialData?.start_request?.address.replace(
                              /\n/g,
                              "<br />",
                            )
                          : initialData?.end_request?.address.replace(
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
                    <FormLabel className="relative">
                      Alamat
                    </FormLabel>
                    <FormControl className="disabled:opacity-100">
                      <Textarea
                        id="alamat"
                        placeholder="Masukkan alamat lengkap...."
                        className="col-span-3"
                        rows={3}
                        disabled={(!isEdit && !isPreview) || loading || switchValue}
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
