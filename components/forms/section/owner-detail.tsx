import { ConfirmModal } from "@/components/modal/confirm-modal";
import { PreviewImage } from "@/components/modal/preview-image";
import { RejectCustomerModal } from "@/components/modal/reject-customer-modal";
import Spinner from "@/components/spinner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useApproveCustomer, useRejectCustomer } from "@/hooks/api/useCustomer";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
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
}

interface OwnerDetailProps {
  onClose: () => void;
  data?: User;
}

const OwnerDetail: React.FC<OwnerDetailProps> = ({ onClose, data }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);

  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
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
      <div
        className="p-5 top-10 border rounded-md  w-full basis-1/3"
        id="detail-sidebar"
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-center font-semibold text-xl">Owner Detail</h4>
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
          <div className="mb-[300px]">
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
            {!data?.photo_profile ? (
              <p>Belum ada Foto</p>
            ) : (
              <div className="p-1 max-w-xs mx-auto">
                <Card className="w-[310px] h-[300px] flex-shrink-0 flex aspect-square items-center justify-center relative ">
                  <img
                    src={data.photo_profile}
                    alt="photo_profile"
                    className="object-cover cursor-pointer rounded-lg w-full h-full"
                    onClick={() => {
                      setOpen(true);
                      onHandlePreview(data?.photo_profile);
                    }}
                  />
                </Card>
              </div>
            )}
          </div>
          {data?.status === "pending" && (
            <div className="flex flex-col gap-5 sticky bottom-1">
              <Button
                className="w-full bg-red-50 text-red-500 hover:bg-red-50/90"
                type="button"
                onClick={() => setOpenRejectModal(true)}
              >
                {loading ? <Spinner className="h-5 w-5" /> : "Tolak Pelanggan"}
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
            </div>
          )}
        </div>
        <PreviewImage
          isOpen={open}
          onClose={() => setOpen(false)}
          content={content}
        />
      </div>
    </>
  );
};
export default OwnerDetail;
