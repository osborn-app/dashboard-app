"use client";

import { useState } from "react";
import { Modal, Spin } from "antd";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";
import { ConfirmModalWithInput } from "@/components/modal/confirm-modal-input";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useApproveCustomer, useRejectCustomer } from "@/hooks/api/useCustomer";
import { RejectCustomerModal } from "@/components/modal/reject-customer-modal";
import dayjs from "dayjs";
import "dayjs/locale/id";

type CommentItem = {
  id: number;
  message: string;
  items: string[];
  created_at: string;
};

type CommentDialogProps = {
  open: boolean;
  onClose: () => void;
  commentData?: CommentItem[];
  loading?: boolean;
  customerId?: string;
  status_data?: string
};

export default function CommentDialog({
  open,
  onClose,
  commentData = [],
  loading = false,
  customerId,
  status_data,
}: CommentDialogProps) {
  const [openApprovalModalWithInput, setOpenApprovalModalWithInput] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [customerIdState] = useState(customerId);

  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutate: approveCustomer } = useApproveCustomer(["additionaldata"]);
  const { mutate: rejectCustomer } = useRejectCustomer(["additionaldata"]);

  const handleApproveCustomer = (reason?: string) => {
    if (!customerId) {
      toast({
        variant: "destructive",
        title: "Customer ID tidak ditemukan",
      });
      return;
    }

    setLoading(true);
    approveCustomer(
      { id: customerId, reason },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["additionaldata"] });
          setOpenApprovalModalWithInput(false)
          toast({
            variant: "success",
            title: "Customer berhasil disetujui",
          });
          router.push(`/dashboard/verification`);
        },
        onSettled: () => setLoading(false),
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Uh oh! ada sesuatu yang error",
            description: `error: ${error?.response?.message}`,
          });
        },
      }
    );
  };

  const handleRejectCustomer = (reason: string) => {
    rejectCustomer(
      {
        id: customerId as string,
        reason,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["additionaldata"] });
          setOpenRejectModal(false)
          toast({
            variant: "success",
            title: "Customer berhasil ditolak",
          });
          router.push(`/dashboard/verification`);
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

  const handleApproveAll = () => {
    handleApproveCustomer(); 
  };

  return (
    <>
      {/* Modal konfirmasi approve */}
      {openApprovalModalWithInput && (
        <ConfirmModalWithInput
          isOpen={openApprovalModalWithInput}
          onClose={() => setOpenApprovalModalWithInput(false)}
          onConfirm={handleApproveCustomer}
          loading={isLoading}
        />
      )}

      {/* Modal konfirmasi reject */}
      {openRejectModal && (
        <RejectCustomerModal
          isOpen={openRejectModal}
          onClose={() => setOpenRejectModal(false)}
          onConfirm={handleRejectCustomer}
          loading={loading}
        />
      )}

      {/* Modal Preview Gambar */}
      <Modal
        open={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        centered
        width={600}
      >
        <img src={previewImage ?? ""} alt="Preview" className="w-full h-auto object-contain rounded" />
      </Modal>

      {/* Modal utama */}
      <Modal
        open={open}
        onCancel={onClose}
        title={
            <div>
              <div className="text-lg font-semibold">Riwayat Verifikasi Tambahan</div>
              <hr className="mt-2 mb-4 border-gray-300" />
            </div>
          }
        width={800}
        footer={
        status_data === 'pending' ? (
          <div className="flex justify-end gap-4">
            <Button
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white text-xs p-2"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  setOpenRejectModal(true);
                }, 300);
              }}
            >
              {isLoading ? <Spinner className="h-5 w-5" /> : "Tolak Akun User"}
            </Button>

            <Button
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white text-xs p-2"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  setOpenApprovalModalWithInput(true);
                }, 300);
              }}
            >
              {isLoading ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <>
                  Setuju Dengan Data<br /> Tambahan
                </>
              )}
            </Button>

            <Button
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs p-2"
              onClick={() => {
                handleApproveAll(),
                onClose();
              }}
            >
              {isLoading ? <Spinner className="h-5 w-5" /> : "Setujui Seluruh Data"}
            </Button>
          </div>
        ) : null
      }
      >
        {loading ? (
          <div className="text-center my-8">
            <Spin />
          </div>
        ) : commentData.length > 0 ? (
          <div className="space-y-6 max-h-[70vh] overflow-auto">
            {commentData.map((comment) => (
              <div key={comment.id} className="border-b pb-4">
                <h4 className="text-lg font-semibold">{comment.message}</h4>
                <p className="text-sm text-gray-500 mb-5"> {dayjs(comment.created_at).locale("id").format("DD MMMM YYYY, HH:mm")} </p>
                <div className="flex flex-wrap gap-2">
                  {comment.items.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt="Comment image"
                      width={200}
                      height={150}
                      className="object-cover rounded cursor-pointer hover:opacity-80"
                      onClick={() => setPreviewImage(url)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">Tidak ada komentar.</p>
        )}
      </Modal>
    </>
  );
}
