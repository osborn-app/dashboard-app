import React from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import CustomImage from "../custom-image";
import { useGetBuserTotals } from "@/hooks/api/useBuser";

interface BuserFormProps {
  initialData: any;
  children?: React.ReactNode;
}

const BuserForm: React.FC<BuserFormProps> = ({ initialData, children }) => {
  // Get grouped buser data for estimated totals
  const customerId = initialData?.order?.customer?.id?.toString();
  const fleetId = initialData?.order?.fleet?.id?.toString();

  // Debug logging for IDs
  console.log("Customer ID:", customerId);
  console.log("Fleet ID:", fleetId);
  console.log("Initial Data:", initialData);
  console.log("Should fetch:", !!(customerId && fleetId));

  const {
    data: totalsData,
    isLoading: isLoadingTotals,
    error: totalsError,
  } = useGetBuserTotals(
    {
      customer_id: customerId || "",
      fleet_id: fleetId || "",
    },
    {
      enabled: !!(customerId && fleetId), // Only fetch if both IDs exist
    },
  );

  console.log("Totals Data Response:", totalsData);
  console.log("Is Loading:", isLoadingTotals);
  console.log("Error:", totalsError);

  // Get the first item from the data array
  const totalsItem = totalsData?.data?.data?.[0];
  const estimatedPaidTotal = totalsItem?.estimated_paid_total || 0;
  const estimatedUnpaidTotal = totalsItem?.estimated_unpaid_total || 0;

  console.log("Totals Item:", totalsItem);
  console.log("Estimated Paid Total:", estimatedPaidTotal);
  console.log("Estimated Unpaid Total:", estimatedUnpaidTotal);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-medium">Total Terbayar</label>
          <Input
            value={
              isLoadingTotals
                ? "Loading..."
                : totalsError
                ? "Error loading data"
                : formatRupiah(estimatedPaidTotal)
            }
            readOnly
          />
        </div>
        <div>
          <label className="font-medium">Total Belum Terbayar</label>
          <Input
            value={
              isLoadingTotals
                ? "Loading..."
                : totalsError
                ? "Error loading data"
                : formatRupiah(estimatedUnpaidTotal)
            }
            readOnly
          />
        </div>
      </div>
      {/* Row 5: Keterangan (full width) */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <label className="font-medium">Keterangan</label>
          <Input value={initialData?.notes || "-"} readOnly />
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
