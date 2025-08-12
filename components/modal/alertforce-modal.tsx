"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ModalCustom } from "../ui/modalcustom";
import dayjs from "dayjs";
import "dayjs/locale/id";

import Spinner from "../spinner";

interface AlertForceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  data: any;
  checked: boolean;
  setChecked: (checked: boolean) => void;
}

export const AlertForceModal: React.FC<AlertForceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  data,
  checked,
  setChecked,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Check if this is a product order or fleet order
  const isProductOrder = data?.product;
  const isFleetOrder = data?.fleet;

  const getTitle = () => {
    if (isProductOrder) {
      return <span className="text-lg text-start justify-start font-semibold">Hapus Product Order</span>;
    }
    return <span className="text-lg text-start justify-start font-semibold">Batalkan Sewa</span>;
  };

  const getDescription = () => {
    if (isProductOrder) {
      return <span>Tindakan ini akan menghapus product order untuk <strong>{data?.product?.name}</strong>, mohon pastikan tindakan anda sepenuhnya.</span>;
    }
    return <span>Tindakan ini akan membatalkan jadwal sewa untuk armada <strong>{data?.fleet?.name}</strong>, mohon pastikan tindakan anda sepenuhnya.</span>;
  };

  const getForceDeleteText = () => {
    if (isProductOrder) {
      return "Hapus paksa product order yang sudah terbayar?";
    }
    return "Hapus paksa pesanan yang sudah terbayar?";
  };

  return (
    <ModalCustom
      title={getTitle()}
      description={getDescription()}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="item-name">{isProductOrder ? "Product" : "Mobil"}</Label>
          <Input 
            id="item-name" 
            readOnly 
            className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0" 
            defaultValue={isProductOrder ? data?.product?.name : data?.fleet?.name} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="keterangan">Keterangan {isProductOrder ? "Sewa" : "Sewa"}</Label>
          <Input 
            id="keterangan" 
            readOnly 
            className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0" 
            defaultValue={isProductOrder ? "Product Order" : (data?.is_with_driver ? "Dengan Supir" : "Lepas Kunci")} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="durasi">Durasi Sewa</Label>
          <Input 
            id="durasi" 
            readOnly 
            className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0" 
            defaultValue={`${data?.duration} hari`} 
          />
        </div>
        {isFleetOrder && (
          <div className="grid gap-2">
            <Label htmlFor="pemakaian">Pemakaian</Label>
            <Input 
              id="pemakaian" 
              readOnly 
              className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0" 
              defaultValue={`${data?.is_out_of_town ? data?.fleet?.location?.name : "Jakarta"}`} 
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="tanggal-ambil">Tanggal Ambil</Label>
          <Input 
            id="tanggal-ambil" 
            readOnly 
            className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0" 
            defaultValue={`${dayjs(data?.start_date).locale('id').format("HH:mm dddd, DD MMMM YYYY")}`} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tanggal-kembali">Tanggal Kembali</Label>
          <Input 
            id="tanggal-kembali" 
            readOnly 
            className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0" 
            defaultValue={`${dayjs(data?.end_date).locale('id').format("HH:mm dddd, DD MMMM YYYY")}`} 
          />
        </div>
        {isProductOrder && data?.customer && (
          <div className="grid gap-2">
            <Label htmlFor="customer">Pelanggan</Label>
            <Input 
              id="customer" 
              readOnly 
              className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0" 
              defaultValue={data?.customer?.name} 
            />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hapus-paksa"
          checked={checked}
          onCheckedChange={() => setChecked(!checked)}
          disabled={loading}
        />
        <label htmlFor="hapus-paksa" className="text-sm font-medium leading-none text-[#1F61D9]">
          {getForceDeleteText()}
        </label>
      </div>
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="outline" onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>
          Batalkan
        </Button>
        <Button disabled={loading} variant="destructive" onClick={(e) => {
          e.stopPropagation();
          onConfirm();
        }}>
          {loading ? <Spinner className="h-5 w-5" /> : "Hapus"}
        </Button>
      </div>
    </ModalCustom>
  );
};
