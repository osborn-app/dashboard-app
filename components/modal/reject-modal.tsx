"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import Spinner from "../spinner";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  onConfirm: (reason: string) => void;
}

export const RejectModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  loading,
  onConfirm,
}) => {
  const [reason, setReason] = useState<string>("");
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-left">
            Apakah Anda Yakin Ingin Menolak Pesanan Ini?
          </DialogTitle>
          <DialogDescription className="text-left">
            Tindakan ini akan menolak pesanan pelanggan dan tidak dapat
            dikembalikan. Apakah Anda yakin ingin melanjutkan?
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <Label htmlFor="reason" className="relative label-required">
            Alasan
          </Label>
          <Textarea
            placeholder="Berikan komentar penolakan"
            id="reason"
            rows={4}
            name="reason"
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="space-x-2 flex items-center justify-end w-full">
          <Button
            disabled={loading}
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Kembali
          </Button>
          <Button
            disabled={loading}
            className="bg-red-50 text-red-500 hover:bg-red-100"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm(reason);
            }}
          >
            {loading ? <Spinner className="h-5 w-5" /> : "Tolak Pesanan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
