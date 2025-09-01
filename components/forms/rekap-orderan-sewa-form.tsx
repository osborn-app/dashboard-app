"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

  const title = `Detail Orderan Sewa - ${data.invoice_number}`;
  const description = "Detail lengkap transaksi orderan sewa kendaraan";

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        <Badge
          variant={data.payment_status === "done" ? "default" : "secondary"}
        >
          {data.payment_status === "done" ? "Lunas" : "Pending"}
        </Badge>
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
            <Label>Harga Total Unit</Label>
            <Input
              disabled
              value={formatRupiah(data.total_price || "-")}
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>

        <div className="md:grid md:grid-cols-3 gap-8">
          <div>
            <Label>Layanan Driver</Label>
            <Input
              disabled
              value={data.invoice_number || "-"}
              className="disabled:opacity-90 mt-2 font-mono"
            />
          </div>
          <div>
            <Label>Tanggal Mulai</Label>
            <Input
              disabled
              value={
                data.start_date
                  ? new Date(data.start_date).toLocaleDateString("id-ID")
                  : "-"
              }
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Durasi (Hari)</Label>
            <Input
              disabled
              value={data.duration ? `${data.duration} hari` : "-"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Status Pembayaran</Label>
            <Input
              disabled
              value={data.payment_status === "done" ? "Lunas" : "Pending"}
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>

        {/* Price Information */}
        <div className="md:grid md:grid-cols-3 gap-8">
          <div>
            <Label>Harga Layanan</Label>
            <Input
              disabled
              value={formatRupiah(data.service_price || 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Harga Driver</Label>
            <Input
              disabled
              value={formatRupiah(data.driver_price || 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Harga Luar Kota</Label>
            <Input
              disabled
              value={formatRupiah(data.out_of_town_price || 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Asuransi</Label>
            <Input
              disabled
              value={formatRupiah(data.insurance?.price || 0)}
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label className="font-bold">Total Harga</Label>
            <Input
              disabled
              value={formatRupiah(data.total_price || 0)}
              className="disabled:opacity-90 mt-2 font-bold text-green-600"
            />
          </div>
        </div>

        {/* Additional Services */}
        {data.additional_services && data.additional_services.length > 0 && (
          <>
            <Separator />
            <div>
              <Label className="text-lg font-semibold">
                Layanan Tambahan
              </Label>
              <div className="mt-4 space-y-2">
                {data.additional_services.map((service: any, index: number) => (
                  <div key={index} className="md:grid md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        disabled
                        value={service.name}
                        className="disabled:opacity-90 mt-2"
                      />
                    </div>
                    <div>
                      <Input
                        disabled
                        value={formatRupiah(service.price)}
                        className="disabled:opacity-90 mt-2 font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Timeline */}
        <Separator />
        <div className="md:grid md:grid-cols-2 gap-8">
          <div>
            <Label>Dibuat</Label>
            <Input
              disabled
              value={
                data.created_at
                  ? new Date(data.created_at).toLocaleString("id-ID")
                  : "-"
              }
              className="disabled:opacity-90 mt-2"
            />
          </div>
          <div>
            <Label>Terakhir Diupdate</Label>
            <Input
              disabled
              value={
                data.updated_at
                  ? new Date(data.updated_at).toLocaleString("id-ID")
                  : "-"
              }
              className="disabled:opacity-90 mt-2"
            />
          </div>
        </div>
      </div>
    </>
  );
};