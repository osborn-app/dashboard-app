"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import Spinner from "../spinner";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  onConfirm: () => void;
  title: string;
  heading: string;
}

export const ApprovalModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  loading,
  onConfirm,
  title,
  heading,
}) => {
  const [checked, setChecked] = useState<boolean>(true);
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-left">{title}</DialogTitle>
          <DialogDescription className="text-left">
            Konfirmasi {heading} akan otomatis membuat Invoice, mohon pastikan
            data {heading} yang diinput telah benar sepenuhnya
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={!checked}
            onCheckedChange={() => setChecked(!checked)}
            disabled={loading}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Data Telah Benar Sepenuhnya
          </label>
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
            className="min-w-[164px]"
            disabled={loading || checked}
            variant="main"
            type="submit"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
          >
            {loading ? (
              <Spinner className="h-5 w-5" />
            ) : (
              `Konfirmasi ${heading}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
