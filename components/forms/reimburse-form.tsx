"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/UserContext";

import {
  useGetDetailDriver,
  useGetInfinityDrivers,
} from "@/hooks/api/useDriver";
import { useGetInfinityLocation } from "@/hooks/api/useLocation";
import {
  useAcceptReimburse,
  useEditReimburse,
  usePostReimburse,
  useRejectReimburse,
} from "@/hooks/api/useReimburse";
import { useSidebar } from "@/hooks/useSidebar";
import { cn, makeUrlsClickable } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Select as AntdSelect, ConfigProvider, DatePicker, Space } from "antd";
import locale from "antd/locale/id_ID";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/id";
import { isEmpty, isString } from "lodash";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { useDebounce } from "use-debounce";
import { ApprovalModal } from "../modal/approval-modal";
import { RejectModal } from "../modal/reject-modal";
import Spinner from "../spinner";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { ReimburseFormProps, ReimburseFormValues } from "./types/reimburse";
import { generateSchema } from "./validation/orderSchema";
import { editSchema, formSchema } from "./validation/reimburseSchema";

import ImagePreview from "../imagePreview";
import UploadFile from "../uploud-file";
import { useGetInfinityFleets } from "@/hooks/api/useFleet";
import DriverReimburseDetail from "./section/driverReimburse-detail";
// import "@uploadthing/react/styles.css";

export const IMG_MAX_LIMIT = 3;

export const ReimburseForm: React.FC<ReimburseFormProps> = ({
  initialData,
  isEdit,
}) => {
  const { user } = useUser();
  const { reimburseid } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const pathname = usePathname();
  const splitPath = pathname.split("/");
  const lastPath = splitPath[splitPath.length - 1];
  const title =
    lastPath === "preview"
      ? "Tinjau Reimburse"
      : lastPath === "edit"
      ? "Edit Reimburse"
      : lastPath === "detail"
      ? "Detail Reimburse"
      : "Tambah Reimburse";
  const description =
    lastPath === "preview"
      ? "Tinjau reimburse baru dari driver"
      : lastPath === "edit"
      ? "Edit status reimburse"
      : lastPath === "detail"
      ? ""
      : "Tambah reimburse baru untuk driver";
  const toastMessage = initialData
    ? "Reimburse berhasil diubah!"
    : "Reimburse berhasil dibuat";

  const action = initialData ? "Save changes" : "Create";
  const queryClient = useQueryClient();
  const { mutate: createReimburse } = usePostReimburse();
  const { mutate: editReimburse } = useEditReimburse(reimburseid as string);
  const { mutate: acceptReimburse } = useAcceptReimburse(reimburseid as string);
  const { mutate: rejectReimburse } = useRejectReimburse();
  const [searchLocation, setSearchLocation] = useState("");
  const [searchDriverTerm, setSearchDriverTerm] = useState("");
  const [searchFleetTerm, setSearchFleetTerm] = useState("");
  // const [searchLocationTerm, setSearchLocationTerm] = useState("");
  const [searchDriverDebounce] = useDebounce(searchDriverTerm, 500);
  const [searchFleetDebounce] = useDebounce(searchFleetTerm, 500);
  const [searchLocationDebounce] = useDebounce(searchLocation, 500);
  // const [detail, setDetail] = useState<DriverDetail | null>(null);
  const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
  const [openRejectModal, setOpenRejectModal] = useState<boolean>(false);
  const [openDriverDetail, setOpenDriverDetail] = useState<boolean>(false);
  const [type, setType] = useState<string>("");
  const [schema, setSchema] = useState(() => generateSchema(true, true));
  const [messages, setMessages] = useState<any>({});
  const detailRef = React.useRef<HTMLDivElement>(null);
  // const [banks, setBanks] = useState(["BRI", "BCA", "Mandiri", "BNI", "DKI"]);

  // const saveBanksToDatabase = async (newBanks: string[]) => {
  //   try {
  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_URL}/driver-reimburses`,
  //       { banks: newBanks },
  //     );

  //     setBanks([...banks, ...newBanks]);

  //     console.log("data berhasil di simpan", response.data);
  //   } catch (error) {
  //     console.error("Terjadi kesalahan saat menyimpan data:", error);
  //   }
  // };

  // const handleBankChange = (value: string[], field: any) => {
  //   setBanks(value); // Simpan nilai terpilih ke state
  //   saveBanksToDatabase(value); // Kirim data ke API
  //   field.onChange(value);
  // };

  const scrollDetail = () => {
    detailRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { isMinimized } = useSidebar();
  const defaultValues = initialData
    ? {
        driver: initialData?.driver?.id?.toString(), // Mengambil nama driver
        fleet: initialData?.fleet?.id?.toString(), // Mengambil nama driver
        nominal: initialData?.nominal?.toString() || "", // Nominal reimburse
        bank: initialData?.bank || "", // Nama bank
        location: initialData?.location?.id?.toString(), // Lokasi reimburse
        noRekening: initialData?.noRekening || "", // Nomor rekening
        date: initialData?.date || "", // Tanggal reimburse
        description: initialData?.description || "", // Keterangan tambahan
        transaction_proof_url: initialData?.transactionProofUrl || null,
        transfer_proof_url: initialData?.transferProofUrl || null,
      }
    : {
        driver: "", // Nama driver kosong
        fleet: "", // Nama fleet kosong
        nominal: "", // Nominal default 0
        bank: "", // Nama bank kosong
        location: "", // Lokasi kosong
        noRekening: "", // Nomor rekening kosong
        date: "", // Tanggal kosong
        description: "", // Keterangan kosong
        transaction_proof_url: null,
        transfer_proof_url: null,
      };

  const form = useForm<ReimburseFormValues>({
    resolver: zodResolver(!initialData ? formSchema : editSchema),
    defaultValues,
  });
  // Reimburse Fields
  const driverNameField = form.watch("driver"); // Nama driver
  const fleetField = form.watch("fleet"); // Nama driver
  const nominalField = form.watch("nominal"); // Nominal/jumlah reimburse
  const bankNameField = form.watch("bank"); // Nama bank
  const locationField = form.watch("location"); // Lokasi reimburse
  const transactionProofUrlField = form.watch("transaction_proof_url"); // Lokasi reimburse
  const transferProofUrlField = form.watch("transfer_proof_url"); // Lokasi reimburse
  const accountNumberField = form.watch("noRekening"); // Nomor rekening
  const dateField = form.watch("date"); // Tanggal reimburse
  const descriptionField = form.watch("description"); // Keterangan tambahan (opsional)

  const { data: driverData, isFetching: isFetchingDriver } = useGetDetailDriver(
    form.getValues("driver"),
  );

  const [end, setEnd] = useState("");
  const now = dayjs(form.getValues("date"));
  useEffect(() => {
    const end = now
      // .add(+form.getValues("duration"), "day")
      .locale("id")
      .format("HH:mm:ss - dddd, DD MMMM (YYYY)");
    setEnd(end);
  }, [now]);

  // , form.getValues("duration")

  const onSubmit = async (data: ReimburseFormValues) => {
    setLoading(true);

    const createPayload = (data: ReimburseFormValues) => {
      const basedPayload = {
        driver_id: data.driver, // Menggunakan nama driver
        fleet_id: data.fleet, // Menggunakan nama driver
        nominal: data.nominal, // Mengubah nominal ke number, menghapus koma jika ada
        bank: data.bank, // Nama bank
        location_id: data.location, // Lokasi reimburse
        noRekening: data.noRekening, // Nomor rekening
        date: data.date, // Format tanggal (YYYY-MM-DD)
        description: data.description || "", // Keterangan opsional
      };

      const fileFields = {
        ...(data.transaction_proof_url && {
          transaction_proof_url: data.transaction_proof_url,
        }),
        ...(data.transfer_proof_url && {
          transfer_proof_url: data.transfer_proof_url,
        }),
      };

      // 3. Menggabungkan basePayload dan fileFields
      return {
        ...basedPayload,
        ...fileFields,
      };
    };

    const handleSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ["reimburse"] });
      toast({
        variant: "success",
        title: toastMessage,
      });
      router.refresh();
      router.push(`/dashboard/reimburse`);
    };

    const handleError = (error: any) => {
      setOpenApprovalModal(false);
      toast({
        variant: "destructive",
        title: `Uh oh! ${
          //@ts-ignore
          error?.response?.data?.message == "Driver must be verified."
            ? "Driver belum diverifikasi"
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
        handleResponse(payload, editReimburse);
        break;
      case "preview":
        handleResponse(payload, acceptReimburse);
        break;
      default:
        handleResponse(payload, createReimburse);
        break;
    }
  };

  const Option = AntdSelect;

  const {
    data: drivers,
    fetchNextPage: fetchNextDrivers,
    hasNextPage: hasNextDrivers,
    isFetchingNextPage: isFetchingNextDrivers,
  } = useGetInfinityDrivers(searchDriverDebounce);
  const {
    data: locations,
    fetchNextPage: fetchNextLocations,
    hasNextPage: hasNextLocations,
    isFetchingNextPage: isFetchingNextLocations,
  } = useGetInfinityLocation(searchLocationDebounce);
  const {
    data: fleets,
    fetchNextPage: fetchNextFleets,
    hasNextPage: hasNextFleets,
    isFetchingNextPage: isFetchingNextFleets,
  } = useGetInfinityFleets(searchFleetDebounce);

  const handleScrollDrivers = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      fetchNextDrivers();
    }
  };
  const handleScrollFleets = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      fetchNextFleets();
    }
  };

  const handleScroll = (
    event: React.UIEvent<HTMLDivElement>,
    type: "location",
  ) => {
    const target = event.target as HTMLDivElement;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      fetchNextLocations();
    }
  };

  useEffect(() => {
    const payload = {
      driver_id: driverNameField, // Nama driver
      fleet_id: fleetField, // Nama fleet
      nominal: isString(nominalField) // Nominal/jumlah reimburse
        ? +nominalField
        : nominalField,
      location_id: locationField, // Lokasi reimburse
      transaction_proof_url: transactionProofUrlField,
      transfer_proof_url: transferProofUrlField,
      bank: bankNameField, // Nama bank
      noRekening: accountNumberField, // Nomor rekening
      date: dateField, // Tanggal reimburse (format: YYYY-MM-DD)
      description: descriptionField || "",
    };
  }, [
    fleetField,
    transferProofUrlField,
    transactionProofUrlField,
    driverNameField,
    nominalField,
    locationField,
    bankNameField,
    accountNumberField,
    dateField,
    descriptionField,
  ]);

  //   // disable date for past dates
  const disabledDate = (current: Dayjs | null): boolean => {
    // ada request untuk enable past date ketika update order
    if (lastPath === "edit") return false;

    return current ? current < dayjs().startOf("day") : false;
  };

  // function for handle reject
  const handleRejectReimburse = (reason: string) => {
    setRejectLoading(true);
    rejectReimburse(
      { reimburseid, reason },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["reimburse"] });
          toast({
            variant: "success",
            title: "berhasil ditolak",
          });
          setOpenRejectModal(false);
          router.refresh();
          router.push(`/dashboard/reimburse`);
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
      // console.log(errors);
      toast({
        variant: "destructive",
        title: "Harap isi semua field yang wajib diisi sebelum konfirmasi",
      });
    }
    setOpenApprovalModal(false);
  }, [errors]);

  const generateMessage = (currentValue: any, defaultValue: any) =>
    currentValue !== defaultValue ? "Data telah diubah" : "";

  useEffect(() => {
    const newMessages = {
      driver: generateMessage(driverNameField, defaultValues?.driver), // Nama Driver
      fleet: generateMessage(fleetField, defaultValues?.fleet), // Nama Driver
      nominal: generateMessage(nominalField, defaultValues?.nominal), // Nominal/Jumlah Reimburse
      location: generateMessage(locationField, defaultValues?.location), // Lokasi Reimburse
      transaction_proof_url: generateMessage(
        transactionProofUrlField,
        defaultValues?.transaction_proof_url,
      ), // Lokasi Reimburse
      transfer_proof_url: generateMessage(
        transferProofUrlField,
        defaultValues?.transfer_proof_url,
      ), // Lokasi Reimburse

      bank: generateMessage(bankNameField, defaultValues?.bank), // Nama Bank
      noRekening: generateMessage(
        accountNumberField,
        defaultValues?.noRekening,
      ), // Nomor Rekening
      date: generateMessage(dateField, defaultValues?.date), // Tanggal Reimburse
      description: generateMessage(
        descriptionField,
        defaultValues?.description,
      ), // Keterangan Tambahan
    };
    if (lastPath !== "create") {
      setMessages(newMessages);
    }
  }, [
    fleetField,
    transferProofUrlField,
    transactionProofUrlField,
    driverNameField,
    nominalField,
    locationField,
    bankNameField,
    accountNumberField,
    dateField,
    descriptionField,
  ]);

  const approvalModalTitle =
    lastPath === "edit"
      ? "Apakah Anda Yakin Ingin Mengedit Reimburse ini?"
      : "Apakah Anda Yakin Ingin Mengonfirmasi Reimburse ini?";

  return (
    <>
      {openApprovalModal && (
        <ApprovalModal
          heading="reimburse"
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
          onConfirm={handleRejectReimburse}
          loading={rejectLoading}
        />
      )}
      <div
        className={cn("flex items-center justify-between py-3 gap-2 flex-wrap")}
        id="header"
      >
        <Heading title={title} description={description} />
        {initialData?.status !== "pending" &&
          initialData?.status === "pending" &&
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
                    Reset berdasarkan data driver
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
                  href={`/dashboard/reimburse/${reimburseid}/edit`}
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
                <div className="bg-red-50 text-red-500 text-xs font-medium flex items-center justify-center px-[10px] py-1 rounded-full text-center">
                  Belum kembali
                </div>
              </div>
            </div>
          )}

        {initialData?.status === "confirmed" && (
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
                  Reset berdasarkan data Driver
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
                href={`/dashboard/reimburse/${reimburseid}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "text-black",
                )}
              >
                Edit Pesanan
              </Link>
            )}
            <div className="flex justify-between gap-3.5">
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
            Reset berdasarkan data Driver
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
              <div className={cn("lg:grid grid-cols-3 gap-[10px] items-start")}>
                <div className="flex items-end">
                  {lastPath !== "preview" && isEdit ? (
                    <FormField
                      name="driver"
                      control={form.control}
                      render={({ field }) => {
                        return (
                          <div className="space-y-2 w-full">
                            <FormLabel className="relative label-required">
                              Nama Pengemudi
                            </FormLabel>
                            <div className="flex">
                              <FormControl>
                                <AntdSelect
                                  className={cn("mr-2 w-full")}
                                  showSearch
                                  placeholder="Nama Pengemudi..."
                                  style={{
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
                                >
                                  {lastPath !== "create" && isEdit && (
                                    <Option
                                      value={initialData?.driver?.id?.toString()}
                                    >
                                      {initialData?.driver?.name}
                                    </Option>
                                  )}
                                  {drivers?.pages.map(
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

                                  {isFetchingNextDrivers && (
                                    <Option disabled>
                                      <p className="px-3 text-sm">loading</p>
                                    </Option>
                                  )}
                                </AntdSelect>
                              </FormControl>
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
                          initialData?.driver?.status === "pending"
                            ? "text-destructive"
                            : "",
                        )}
                      >
                        Nama Pengemudi
                      </FormLabel>
                      <div className="flex">
                        {" "}
                        <FormControl className="disabled:opacity-100">
                          <Input
                            className={cn("mr-2")}
                            style={{
                              height: "40px",
                            }}
                            disabled
                            value={initialData?.driver?.name ?? "-"}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                </div>
                <div className="flex items-end">
                  {lastPath !== "preview" && isEdit ? (
                    <FormField
                      control={form.control}
                      name="nominal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="relative label-required">
                            Nominal
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
                                value={initialData?.nominal}
                                // thousandSeparator=","
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormItem>
                      <FormLabel>Nominal</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 ">
                            Rp.
                          </span>

                          <NumericFormat
                            disabled={isEdit || loading}
                            customInput={Input}
                            type="text"
                            className="pl-9 disabled:opacity-90"
                            allowLeadingZeros
                            value={initialData?.nominal ?? "-"}
                            // thousandSeparator=","
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                </div>
                <div className="flex items-end">
                  {isEdit ? (
                    <FormField
                      name="bank"
                      control={form.control}
                      render={({ field }) => {
                        return (
                          <div className="space-y-2 w-full">
                            <FormLabel className="relative label-required">
                              Nama Bank / Pembayaran
                            </FormLabel>
                            <div className="flex">
                              <FormControl>
                                <AntdSelect
                                  className={cn("mr-2 w-full")}
                                  showSearch
                                  mode="tags" // Aktifkan kembali mode tags untuk input manual
                                  maxTagCount={1} // Batasi hanya 1 tag yang ditampilkan
                                  disabled={lastPath === "preview"}
                                  value={field.value || initialData?.bank}
                                  placeholder="Nama Bank..."
                                  onChange={(value) => {
                                    // Ambil nilai terakhir jika ada multiple values
                                    const lastValue = Array.isArray(value)
                                      ? value[value.length - 1]
                                      : value;
                                    field.onChange(lastValue);
                                  }}
                                  style={{
                                    height: "40px",
                                  }}
                                >
                                  {[
                                    { value: "BCA", label: "BCA" },
                                    { value: "BRI", label: "BRI" },
                                    { value: "BNI", label: "BNI" },
                                    { value: "MANDIRI", label: "MANDIRI" },
                                    { value: "DKI", label: "DKI" },
                                  ].map((bank) => (
                                    <Option key={bank.value} value={bank.value}>
                                      {bank.label}
                                    </Option>
                                  ))}
                                </AntdSelect>
                              </FormControl>
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
                          initialData?.bank?.status === "pending"
                            ? "text-destructive"
                            : "",
                        )}
                      >
                        Nama Bank / Pembayaran
                      </FormLabel>
                      <div className="flex">
                        {" "}
                        <FormControl className="disabled:opacity-100">
                          <Input
                            className={cn("mr-2")}
                            style={{
                              height: "40px",
                            }}
                            // disabled
                            value={initialData?.bank}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                </div>
              </div>
              <div className={cn("lg:grid grid-cols-3 gap-[10px] items-start")}>
                <div className="flex items-end">
                  {lastPath !== "preview" && isEdit ? (
                    <FormField
                      name="fleet"
                      control={form.control}
                      render={({ field }) => {
                        return (
                          <div className="space-y-2 w-full">
                            <FormLabel className="relative label-required">
                              Pilih Unit
                            </FormLabel>
                            <div className="flex">
                              <FormControl>
                                <AntdSelect
                                  className={cn("mr-2 w-full")}
                                  showSearch
                                  placeholder="Pilih kendaraan anda..."
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
                          initialData?.fleet?.status === "pending"
                            ? "text-destructive"
                            : "",
                        )}
                      >
                        Pilih Unit
                      </FormLabel>
                      <div className="flex">
                        {" "}
                        <FormControl className="disabled:opacity-100">
                          <Input
                            className={cn("mr-2")}
                            style={{
                              height: "40px",
                            }}
                            disabled
                            value={initialData?.fleet.name ?? "-"}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                </div>

                <div className="flex items-end">
                  {isEdit ? (
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <ConfigProvider locale={locale}>
                          <Space
                            size={8}
                            direction="vertical"
                            className="w-full"
                          >
                            <FormLabel className="relative label-required">
                              Tanggal
                            </FormLabel>
                            <FormControl>
                              <DatePicker
                                disabledDate={disabledDate}
                                disabled={lastPath === "preview"}
                                className={cn("p h-[40px] w-full")}
                                style={
                                  {
                                    // width: `${!isMinimized ? "340px" : "100%"}`,
                                  }
                                }
                                height={40}
                                id="testing"
                                // onChange={() => {}}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                value={
                                  field.value
                                    ? dayjs(field.value).locale("id")
                                    : undefined
                                }
                                format={"HH:mm:ss - dddd, DD MMMM (YYYY)"}
                                showTime
                                placeholder="Pilih tanggal dan waktu mulai"
                                showNow={false}
                                inputReadOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </Space>
                        </ConfigProvider>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <ConfigProvider locale={locale}>
                          <Space
                            size={8}
                            direction="vertical"
                            className="w-full"
                          >
                            <FormLabel className="relative label-required">
                              Tanggal
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
                          </Space>
                        </ConfigProvider>
                      )}
                    />
                  )}
                </div>
                <div className="flex items-end">
                  {!isEdit ? (
                    <FormItem>
                      <FormLabel>No. Rekening</FormLabel>
                      <FormControl className="disabled:opacity-100">
                        <Input
                          disabled={!isEdit || loading}
                          value={initialData?.noRekening ?? "-"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <FormField
                      control={form.control}
                      name="noRekening"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Rekening / No. Pembayaran</FormLabel>
                          <FormControl className="disabled:opacity-100">
                            <Input
                              disabled={lastPath === "preview"}
                              placeholder="Masukan no rekening / no pembayaran"
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
                </div>
              </div>
              <div className={cn("lg:grid grid-cols-3 gap-[10px] items-start")}>
                <div className="flex items-end">
                  {!isEdit ? (
                    <FormItem>
                      <FormLabel>Keterangan</FormLabel>
                      <p
                        className="border border-gray-200 rounded-md px-3 py-1 break-words"
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
                          <FormLabel className="relative label-required">
                            Keterangan
                          </FormLabel>
                          <FormControl className="disabled:opacity-100">
                            <Textarea
                              id="keterangan"
                              placeholder="Isi keterangan anda dengan lengkap..."
                              className="col-span-4"
                              rows={6}
                              disabled={lastPath === "preview"}
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
                </div>
                <div className="flex items-end">
                  {lastPath !== "preview" && isEdit ? (
                    <FormField
                      name="location"
                      control={form.control}
                      render={({ field }) => {
                        return (
                          <div className="space-y-2 w-full">
                            <FormLabel className="relative label-required">
                              Lokasi
                            </FormLabel>
                            <div className="flex">
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
                                  // filterOption={false}
                                  notFoundContent={
                                    isFetchingNextLocations ? (
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
                                      value={initialData?.location?.id?.toString()}
                                    >
                                      {initialData?.location?.name}
                                    </Option>
                                  )}
                                  {locations?.pages.map(
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
                                  {isFetchingNextLocations && (
                                    <Option disabled>
                                      <p className="px-3 text-sm">loading</p>
                                    </Option>
                                  )}
                                </AntdSelect>
                              </FormControl>
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
                          initialData?.location?.status === "pending"
                            ? "text-destructive"
                            : "",
                        )}
                      >
                        Lokasi
                      </FormLabel>
                      <div className="flex">
                        {" "}
                        <FormControl className="disabled:opacity-100">
                          <Input
                            className={cn("mr-2")}
                            style={{
                              height: "40px",
                            }}
                            disabled
                            value={initialData?.location?.name ?? "-"}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                </div>
              </div>
              <div className={cn("lg:grid grid-cols-3 gap-[10px] items-start")}>
                <div className="flex items-end ">
                  {lastPath !== "create" ? (
                    <FormField
                      control={form.control}
                      name="transaction_proof_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="relative label-required">
                            Bukti Transaksi
                          </FormLabel>
                          <FormControl className="disabled:opacity-100">
                            <>
                              <UploadFile
                                initialData={initialData}
                                lastPath={lastPath}
                                form={form}
                                name="transaction_proof_url"
                              />
                            </>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormItem>
                      <FormLabel className="relative label-required">
                        Bukti Transaksi
                      </FormLabel>
                      <FormControl className="disabled:opacity-100">
                        <>
                          <UploadFile
                            initialData={initialData}
                            lastPath={lastPath}
                            form={form}
                            name="transaction_proof_url"
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                </div>
                {/* <div className="flex items-center ml-[5px]">
                  {lastPath !== "create" && lastPath !== "preview" && (
                    <FormField
                      control={form.control}
                      name="transfer_proof_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="relative label-required">
                            Bukti Transfer
                          </FormLabel>
                          <FormControl className="disabled:opacity-100">
                            <>
                              <UploadFile
                                initialData={initialData}
                                lastPath={lastPath}
                                form={form}
                                name="transfer_proof_url"
                              />
                              {lastPath !== "preview" &&
                                initialData?.transfer_proof_url && (
                                  <div className="p-2 ml-3 relative border-opacity-25 border-gray-800 border border-dashed -ml-[5px] gap-2  md:h-[200px]   md:w-[300px] :w-[500px] h-[300px] flex flex-col justify-center items-center">
                                    <img
                                      width={500}
                                      height={300}
                                      style={{ border: "none" }}
                                      src={
                                        initialData?.transfer_proof_url ?? ""
                                      }
                                    />
                                  </div>
                                )}
                            </>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div> */}
              </div>
              <Separator className={cn("mt-1")} />
            </div>
          </form>
          {/* sidebar */}

          <DriverReimburseDetail
            innerRef={detailRef}
            data={driverData?.data}
            handleOpenApprovalModal={() => setOpenApprovalModal(true)}
            handleOpenRejectModal={() => setOpenRejectModal(true)}
            confirmLoading={loading}
            initialData={initialData}
            type={lastPath}
            onClose={() => setOpenDriverDetail(false)}
          />
        </Form>
      </div>
    </>
  );
};
