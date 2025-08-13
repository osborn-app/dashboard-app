import React from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import CustomImage from "../custom-image";

interface BuserFormProps {
  initialData: any;
  children?: React.ReactNode;
}

const BuserForm: React.FC<BuserFormProps> = ({ initialData, children }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Tinjau Buser</h2>
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-medium">Nama</label>
          <Input value={initialData?.name || "-"} readOnly />
        </div>
        <div>
          <label className="font-medium">Nomor Telepon</label>
          <Input value={initialData?.phone_number || "-"} readOnly />
        </div>
        <div>
          <label className="font-medium">Status</label>
          <Input value={initialData?.status || "-"} readOnly />
        </div>
      </div>
      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-medium">Fleet</label>
          <Input value={initialData?.order.fleet.name || "-"} readOnly />
        </div>
        <div>
          <label className="font-medium">Plat Nomor</label>
          <Input
            value={initialData?.order.fleet.plate_number || "-"}
            readOnly
          />
        </div>
        <div>
          <label className="font-medium">Tipe Mobil/Motor</label>
          <Input value={initialData?.order.fleet.type_label || "-"} readOnly />
        </div>
      </div>
      {/* Row 3: Foto KTP */}
      <div>
        <label className="font-medium">Berkas</label>
        {initialData?.order?.customer?.id_cards &&
        initialData.order.customer.id_cards.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {initialData.order.customer.id_cards.map(
              (card: any, index: number) => (
                <div
                  key={card.id}
                  className="relative rounded-md cursor-pointer w-full h-[300px] sm:w-1/3 lg:w-1/4 xl:w-1/5"
                >
                  <CustomImage
                    src={card.photo}
                    alt={`Foto KTP ${index + 1}`}
                    className="object-contain w-full h-full rounded border bg-gray-50"
                    loading="lazy"
                  />
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center rounded">
            Tidak ada foto KTP
          </div>
        )}
      </div>
      {/* Row 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-medium">Harga Total Unit</label>
          <Input
            value={
              typeof initialData?.total_payment === "number"
                ? formatRupiah(initialData.total_payment)
                : initialData?.total_payment || "0"
            }
            readOnly
          />
        </div>
        <div>
          <label className="font-medium">Total Pembayaran setelah denda</label>
          <Input
            value={
              typeof initialData?.late_fee_total === "number"
                ? formatRupiah(initialData.late_fee_total)
                : initialData?.late_fee_total || "0"
            }
            readOnly
          />
        </div>
        <div>
          <label className="font-medium">Days Late</label>
          <Input value={initialData?.days_late || "-"} readOnly />
        </div>
      </div>
      {/* Row 5: Keterangan (full width) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-medium">Keterangan</label>
          <Input value={initialData?.notes || "-"} readOnly />
        </div>
        <div>
          <label className="font-medium">Sewa Berakhir</label>
          <Input
            value={formatDateTime(new Date(initialData?.order?.end_date || ""))}
            readOnly
          />
        </div>
      </div>
      {/* Row 6: Keterangan Penyelesaian (full width) - hanya tampil jika ada */}
      {initialData?.status === "selesai" && initialData?.resolve_notes && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="font-medium">Keterangan Penyelesaian</label>
            <Input value={initialData?.resolve_notes || "-"} readOnly />
          </div>
        </div>
      )}
      {/* Row 6: Action buttons (kanan) */}
      {children && <div className="flex justify-end gap-4">{children}</div>}
      <Separator />
    </div>
  );
};

export default BuserForm;
