"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { formatRupiah, formatDate } from "@/lib/utils";
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

  const title = "Detail Orderan Fleets";
  const description = "Detail lengkap transaksi orderan sewa kendaraan";
  const discount = (data.price_calculation?.discount_percentage ?? 0);

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
              value={formatDate(data.start_date) || "-"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Harga Unit</Label>
            <Input
              disabled
              value={formatRupiah(data.price_calculation?.rent_price ?? 0)}
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
            <Label>Total Harga Unit</Label>
            <Input
              disabled
              value={formatRupiah(data.price_calculation?.total_rent_price ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>

        <div className="md:grid md:grid-cols-3 gap-8">
          <div>
            <Label>Discount</Label>
            <Input
              disabled
              value={`${discount}%`}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Total Potongan Diskon Unit</Label>
            <Input
              disabled
              value={formatRupiah(data.price_calculation?.discount ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Charge Weekend</Label>
            <Input
              disabled
              value={formatRupiah((data.price_calculation?.total_weekend_price) ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Antar Jemput</Label>
            <Input
              disabled
              value={formatRupiah(data.price_calculation?.service_price ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Luar Kota</Label>
            <Input
              disabled
              value={formatRupiah((data.price_calculation?.out_of_town_price) ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Driver</Label>
            <Input
              disabled
              value={formatRupiah((data.price_calculation?.total_driver_price) ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Asuransi</Label>
            <Input
              disabled
              value={formatRupiah((data.price_calculation?.insurance_price) ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Add-Ons</Label>
            <Input
              disabled
              value={formatRupiah((data.addons_price) ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Lainnya</Label>
            <Input
              disabled
              value={formatRupiah((data.addons_price) ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>

        <div className="md:grid md:grid-cols-3 gap-8">
          <div>
            <Label>Total Harga Keseluruhan</Label>
            <Input
              disabled
              value={formatRupiah((data.price_calculation?.grand_total) ?? 0)}
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
              value={data.status === "accepted" ? "Lunas": (data.status ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>
      </div>
    </>
  );
};