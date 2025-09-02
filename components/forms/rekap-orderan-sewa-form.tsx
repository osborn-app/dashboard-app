"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { formatRupiah } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface OrderanSewaDetailProps {
  data: any;
  loading?: boolean;
}

export const RekapOrderanSewaForm: React.FC<OrderanSewaDetailProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Data tidak ditemukan</div>;
  }

  const title = "Detail Orderan Sewa";
  const description = "Detail lengkap transaksi orderan sewa kendaraan";

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>
      <Separator />

      <div className="space-y-8 w-full">
        {/* Customer & Fleet Information */}
        <div className="md:grid md:grid-cols-3 gap-8">
          <div>
            <Label>Nama Customer</Label>
            <Input
              disabled
              value={data.customer?.name || "-"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Armada</Label>
            <Input
              disabled
              value={data.fleet?.name || "-"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Tanggal Sewa</Label>
            <Input
              disabled
              value={data.start_date || "-"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Harga Unit</Label>
            <Input
              disabled
              value={formatRupiah(data.fleet?.price || "-")}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Durasi Penyewaan</Label>
            <Input
              disabled
              value={data.duration || "-"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Total Potongan Diskon Unit</Label>
            <Input
              disabled
              value={formatRupiah(data.discount || "-")}
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>

        <div className="md:grid md:grid-cols-3 gap-8">
          <div>
            <Label>Layanan Driver</Label>
            <Input
              disabled
              value={formatRupiah(data.driver_price || "-")}
              className="disabled:opacity-90 mt-2 font-mono"
            />
          </div>
          <div>
            <Label>Layanan Antar Jemput</Label>
            <Input
              disabled
              value={formatRupiah(data.price_calculation?.total_driver_price || "-")}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Luar Kota</Label>
            <Input
              disabled
              value={formatRupiah(data.out_of_town_price || "-")}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Charge Weekend</Label>
            <Input
              disabled
              value={formatRupiah(data.price_calculation?.weekend_price || "-")}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Add-Ons</Label>
            <Input
              disabled
              value={formatRupiah(data.addons_price || "-")}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Harga Layanan Tambahan</Label>
            <Input
              disabled
              value={formatRupiah(data.total_price || "-")}
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>

        {/* Price Information */}
        <div className="md:grid md:grid-cols-3 gap-8">
        <div>
            <Label>Total Harga Keseluruhan</Label>
            <Input
              disabled
              value={formatRupiah(data.grand_total || "-")}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>No Invoice</Label>
            <Input
              disabled
              value={data.invoice_number || "-"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Input
              disabled
              value={data.status || "-"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>
      </div>
    </>
  );
};