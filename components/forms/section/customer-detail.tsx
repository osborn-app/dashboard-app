"use client";
import CommentDialog from "@/app/(dashboard)/dashboard/verification/table/detail/comment-dialog";
import { ConfirmModal } from "@/components/modal/confirm-modal";
import { ConfirmModalWithInput } from "@/components/modal/confirm-modal-input";
import { PreviewImage } from "@/components/modal/preview-image";
import { RejectCustomerModal } from "@/components/modal/reject-customer-modal";
import Spinner from "@/components/spinner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useToast } from "@/components/ui/use-toast";
import { useApproveCustomer, useRejectCustomer } from "@/hooks/api/useCustomer";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import {
  Cake,
  Mail,
  PersonStanding,
  Phone,
  PhoneCall,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IDCard {
  id: number;
  created_at: string;
  updated_at: string;
  photo: string;
}

interface User {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  gender: string;
  date_of_birth: string;
  nik: string;
  photo_profile: string | null;
  emergency_phone_number: string;
  status: string;
  id_cards: IDCard[];
  additional_data_status: string;
  additional_data: IDCard[];
}

interface CustomerDetailProps {
  onClose: () => void;
  data?: User;
  innerRef?: any;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  onClose,
  data,
  innerRef,
}) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);

  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openApprovalModalWithInput, setOpenApprovalModalWithInput] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { mutate: approveCustomer } = useApproveCustomer();
  const { mutate: rejectCustomer } = useRejectCustomer();
  const onHandlePreview = (file: any) => {
    setContent(file);
    setOpen(true);
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const axiosAuth = useAxiosAuth();
  const [dialogData, setDialogData] = useState([]);

  const handleApproveCustomer = (reason?: string) => {
    setLoading(true);
    approveCustomer(
      {
      id: String(data?.id),
      reason,
      },
      {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });

        toast({
          variant: "success",
          title: "Customer berhasil disetujui",
        });
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
    });
  };

  const handleRejectCustomer = (reason: string) => {
    setLoading(true);
    rejectCustomer(
      {
        id: data?.id as unknown as string,
        reason,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["customers"] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          toast({
            variant: "success",
            title: "Customer berhasil ditolak",
          });
          router.push(`/dashboard/orders`);
        },
        onSettled: () => {
          setLoading(false);
        },
        onError: (error: any) => {
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

  const openCommentDialog = async () => {
    setIsDialogOpen(true);
    setDialogLoading(true);

    try {
      const res = await axiosAuth.get(`/customers/${data?.id}/comments`);
      setDialogData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setDialogLoading(false);
    }
  };

  return (
    <>
      {openApprovalModal && (
        <ConfirmModal
          isOpen={openApprovalModal}
          onClose={() => setOpenApprovalModal(false)}
          onConfirm={handleApproveCustomer}
          loading={loading}
        />
      )}

      {openRejectModal && (
        <RejectCustomerModal
          isOpen={openRejectModal}
          onClose={() => setOpenRejectModal(false)}
          onConfirm={handleRejectCustomer}
          loading={loading}
        />
      )}

      {openApprovalModalWithInput && (
      <ConfirmModalWithInput
        isOpen={openApprovalModalWithInput}
        onClose={() => setOpenApprovalModalWithInput(false)}
        onConfirm={handleApproveCustomer}
        loading={loading}
      />
    )}

      <div
        className="p-5 top-10 border rounded-md w-full basis-1/3"
        id="detail-sidebar"
        ref={innerRef}
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-center font-semibold text-xl">
            Pelanggan Detail
          </h4>
          <Button
            type="button"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "w-[65px] h-[40px]",
            )}
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>
        <div className="flex flex-col justify-between h-screen">
          <div>
            <div className="mb-5 gap-2 grid">
              <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
                <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100">
                  <User />
                </div>
                <div className="flex flex-col ml-4">
                  <span className="font-normal text-xs text-neutral-500">
                    Nama Pelanggan
                  </span>
                  <span className="font-medium text-sm text-black">
                    {data?.name ?? "-"}
                  </span>
                </div>
              </div>
              <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
                <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                  <Mail />
                </div>
                <div className="flex flex-col ml-4">
                  <span className="font-normal text-xs text-neutral-500">
                    Email
                  </span>
                  <span className="font-medium text-sm text-black">
                    {data?.email ?? "-"}
                  </span>
                </div>
              </div>
              <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
                <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                  <Phone />
                </div>
                <div className="flex flex-col ml-4">
                  <span className="font-normal text-xs text-neutral-500">
                    Kontak
                  </span>
                  <span className="font-medium text-sm text-black">
                    {data?.phone_number ?? "-"}
                  </span>
                </div>
              </div>
              <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
                <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                  <PhoneCall />
                </div>
                <div className="flex flex-col ml-4">
                  <span className="font-normal text-xs text-neutral-500">
                    Kontak Darurat
                  </span>
                  <span className="font-medium text-sm text-black">
                    {data?.emergency_phone_number ?? "-"}
                  </span>
                </div>
              </div>
              <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
                <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                  <PersonStanding />
                </div>
                <div className="flex flex-col ml-4">
                  <span className="font-normal text-xs text-neutral-500">
                    Jenis Kelamin
                  </span>
                  <span className="font-medium text-sm text-black">
                    {data?.gender === "male"
                      ? "Laki-Laki"
                      : data?.gender === "female"
                      ? "Perempuan"
                      : "-"}
                  </span>
                </div>
              </div>
              <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
                <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                  <Cake />
                </div>
                <div className="flex flex-col ml-4">
                  <span className="font-normal text-xs text-neutral-500">
                    Tanggal Ulang tahun
                  </span>
                  <span className="font-medium text-sm text-black">
                    {data?.date_of_birth
                      ? dayjs(data?.date_of_birth).format("D MMMM YYYY")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
            {isEmpty(data?.id_cards) ? (
              <p>Belum ada Foto</p>
            ) : (
              <Carousel className="max-w-xs mx-auto">
                <CarouselContent>
                  {data?.id_cards.map((photo: any, index: any) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card className="w-[310px] h-[300px] flex-shrink-0 flex aspect-square items-center justify-center relative ">
                          {/* <CardContent className="flex aspect-square items-center justify-center p-6">

                      </CardContent> */}
                          <img
                            src={photo.photo}
                            alt={`Slide ${index}`}
                            className="object-cover cursor-pointer rounded-lg w-full h-full"
                            onClick={() => {
                              setOpen(true);
                              onHandlePreview(photo?.photo);
                            }}
                          />
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {data?.id_cards && data?.id_cards?.length > 1 && (
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
            )}
           {(() => {
              if (data?.additional_data_status === "pending") {
                return (
                  <div
                    className="p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 flex flex-col items-center justify-between gap-4 mt-3 mb-3 hover:bg-yellow-100 cursor-pointer"
                    onClick={() => openCommentDialog()}
                  >
                    <p className="text-sm font-medium">
                      Customer memiliki riwayat upload data tambahan yang belum diverifikasi.
                    </p>
                  </div>
                );
              } else if (data?.additional_data_status === "required") {
                return (
                  <div
                    className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800 flex flex-col items-center justify-between gap-4 mt-3 mb-3 hover:bg-red-100 cursor-pointer"
                    onClick={() => openCommentDialog()}
                  >
                    <p className="text-sm font-medium">
                      Customer memiliki riwayat upload data yang belum dipenuhi.
                    </p>
                  </div>
                );
              } else if (data?.additional_data_status === "not_required" && data?.additional_data && data?.additional_data.length > 0) {
                return (
                  <div
                    className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800 flex flex-col items-center justify-between gap-4 mt-3 mb-3 hover:bg-green-100 cursor-pointer"
                    onClick={() => openCommentDialog()}
                  >
                    <p className="text-sm font-medium">
                      Customer memiliki riwayat upload data tambahan.
                    </p>
                  </div>
                );
              } else if (data?.additional_data_status === "not_required" && (!data?.additional_data || data?.additional_data.length === 0)) {
                return (
                  <div className="p-4 rounded-md bg-gray-100 text-gray-700 mt-3">
                    <p className="text-sm">Customer tidak memiliki riwayat upload data tambahan.</p>
                  </div>
                );
              } else {
                return null;
              }
            })()}
          </div>
          {data?.status === "pending" && (
            <div className="flex flex-col gap-5 bottom-1 mt-5">
              <Button
                className="w-full bg-red-50 text-red-500 hover:bg-red-50/90"
                type="button"
                onClick={() => setOpenRejectModal(true)}
              >
                {loading ? <Spinner className="h-5 w-5" /> : "Tolak Pelanggan!"}
              </Button>
              <Button
                className="w-full  bg-main hover:bg-main/90"
                type="button"
                onClick={() => setOpenApprovalModal(true)}
                >
                {loading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  "Verifikasi Pelanggan"
                )}
              </Button>
               <Button
                className="w-full  bg-green-500 hover:bg-green-600"
                type="button"
                onClick={() => setOpenApprovalModalWithInput(true)}
                >
                {loading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  "Verifikasi Pelanggan Dengan Data Tambahan"
                )}
              </Button>
            </div>
          )}
        </div>
        <PreviewImage
          isOpen={open}
          onClose={() => setOpen(false)}
          content={content}
        />
      </div>
      <CommentDialog
      open={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      commentData={dialogData}
      loading={dialogLoading}
      customerId={data?.id?.toString()}
      // status_data={data?.additional_data_status}
      status_data='no_button'
    />

    </>
  );
};
export default CustomerDetail;
