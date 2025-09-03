"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface OrderanProdukDetailProps {
  data: any;
  loading?: boolean;
}

export const RekapOrderanProdukForm: React.FC<OrderanProdukDetailProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Data tidak ditemukan</div>;
  }

  const title = "Detail Orderan Produk";
  const description = "Detail lengkap transaksi orderan produk";

  const discountPercentage =
    (data.price_calculation?.discount_percentage ?? data.discount ?? 0) as number;
  const displayStatus = data.status === "accepted" ? "Lunas" : (data.status || "-");

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
            <Label>Pelanggan</Label>
            <Input
              disabled
              value={data.customer?.name || "-"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Produk</Label>
            <Input
              disabled
              value={data.product?.name || "-"}
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
            <Label>Harga Produk</Label>
            <Input
              disabled
              value={formatRupiah((data.product?.price) ?? 0)}
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
              value={formatRupiah((data.price_calculation?.total_rent_price) ?? data.sub_total_price ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>

        <div className="md:grid md:grid-cols-3 gap-8">
          <div>
            <Label>Diskon</Label>
            <Input
              disabled
              value={`${discountPercentage}%`}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Total Potongan Diskon Unit</Label>
            <Input
              disabled
              value={formatRupiah((data.price_calculation?.discount) ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Kategori</Label>
            <Input
              disabled
              value={data.product?.category_label || data.product?.category || "-"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Antar Jemput</Label>
            <Input
              disabled
              value={formatRupiah((data.price_calculation?.total_weekend_price) || 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Lainnya</Label>
            <Input
              disabled
              value={formatRupiah((data.price_calculation?.total_weekend_price) ?? 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Layanan Add-Ons</Label>
            <Input
              disabled
              value={formatRupiah((data.price_calculation?.addons_price) ?? 0)}
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
              value={formatRupiah((data.price_calculation?.grand_total) ?? data.total_price ?? 0)}
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
              value={displayStatus}
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>
      </div>
    </>
  );
};