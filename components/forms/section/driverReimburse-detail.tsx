import { Button, buttonVariants } from "@/components/ui/button";
import {
  Cake,
  Info,
  Mail,
  PersonStanding,
  Phone,
  PhoneCall,
  User,
} from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { isEmpty } from "lodash";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { PreviewImage } from "@/components/modal/preview-image";
import Spinner from "@/components/spinner";
import { useUser } from "@/context/UserContext";

interface DriverDetailProps {
  onClose: () => void;
  data: any;
  innerRef?: any;
  initialData: any;
  type?: string;
  confirmLoading: boolean;
  handleOpenApprovalModal: () => void;
  handleOpenRejectModal: () => void;
}

const DriverReimburseDetail: React.FC<DriverDetailProps> = ({
  onClose,
  data,
  handleOpenApprovalModal,
  handleOpenRejectModal,
  innerRef,
  type,
  initialData,
  confirmLoading,
}) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);
  const { user } = useUser();
  // console.log("data", data);

  const onHandlePreview = (file: any) => {
    setContent(file);
    setOpen(true);
  };

  return (
    <div
      className="p-5 top-10 border rounded-md border-neutral-400 w-full basis-1/3"
      id="detail-sidebar"
      ref={innerRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-center font-semibold text-xl">Pengemudi Detail</h4>
        {type !== "create" && type !== "preview" && type !== "edit" && (
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
        )}
      </div>
      <div className="flex flex-col justify-between ">
        <div>
          <div className="mb-5 gap-2 grid">
            <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
              <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                <User />
              </div>
              <div className="flex flex-col ml-4">
                <span className="font-normal text-xs text-neutral-500">
                  Nama Pengemudi
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
          {isEmpty(data?.photo_profile) ? (
            <p>Belum ada Foto</p>
          ) : (
            <div className="p-1 max-w-xs mx-auto">
              <Card className="w-[310px] h-[300px] flex-shrink-0 flex aspect-square items-center justify-center relative ">
                <img
                  src={data?.photo_profile}
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
        <div className="mt-2 mx-auto">
          {type === "preview" &&
            user?.role !== "driver" &&
            initialData?.status === "pending" && (
              <div className="flex flex-col gap-5   bottom-1">
                <div className="flex bg-neutral-100 p-4 gap-5 rounded-md">
                  <Info className="h-10 w-10" />
                  <p>
                    Invoice akan tersedia saat reimburse telah dikonfirmasi.
                    Pastikan semua data benar.
                  </p>
                </div>
                <Button
                  onClick={handleOpenRejectModal}
                  className="w-full bg-red-50 text-red-500 hover:bg-red-50/90"
                  type="button"
                >
                  Tolak Reimburse
                </Button>
                <Button
                  onClick={handleOpenApprovalModal}
                  className="w-full  bg-main hover:bg-main/90"
                  type="button"
                >
                  Konfirmasi Reimburse
                </Button>
              </div>
            )}

          {type === "create" && (
            <div className="flex flex-col gap-5   bottom-1">
              <div className="flex bg-neutral-100 p-4 gap-5 rounded-md ">
                <Info className="h-10 w-10" />
                <p>
                  Invoice akan tersedia saat reimburse telah dikonfirmasi.
                  Pastikan semua data benar.
                </p>
              </div>
              <Button
                onClick={handleOpenApprovalModal}
                className="w-full  bg-main hover:bg-main/90"
                type="button"
                disabled={confirmLoading}
              >
                {confirmLoading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  "Konfirmasi Reimburse"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      <PreviewImage
        isOpen={open}
        onClose={() => setOpen(false)}
        content={content}
      />
    </div>
  );
};

export default DriverReimburseDetail;
