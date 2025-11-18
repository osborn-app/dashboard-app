"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { ModalCustom } from "../ui/modalcustom";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Spinner from "../spinner";
import { useGetAvailableFleets } from "@/hooks/api/useFleet";
import { useEditOrder } from "@/hooks/api/useOrder";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";

interface ChangeVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

export const ChangeVehicleModal: React.FC<ChangeVehicleModalProps> = ({
  isOpen,
  onClose,
  orderData,
}) => {
  const [selectedFleetId, setSelectedFleetId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const orderDate = orderData?.start_date;
  const orderDuration = orderData?.duration;
  const orderFleetType = orderData?.fleet?.type;
  const orderLocationId = orderData?.fleet?.location_id;

  // Format date for API
  const formattedDate = useMemo(() => {
    if (orderDate) {
      return dayjs(orderDate).format("YYYY-MM-DD");
    }
    return undefined;
  }, [orderDate]);

  // Get available fleets
  const { data: availableFleetsData, isFetching: isFetchingFleets } = useGetAvailableFleets(
    formattedDate,
    orderDuration,
    orderFleetType,
    orderLocationId
  );

  const availableFleets = useMemo(() => {
    const fleets = availableFleetsData?.data?.items || [];
    // Exclude current fleet from the list
    return fleets.filter((fleet: any) => fleet.id !== orderData?.fleet?.id);
  }, [availableFleetsData, orderData?.fleet?.id]);

  const { mutate: editOrder } = useEditOrder(orderData?.id);

  useEffect(() => {
    if (isOpen && orderData) {
      // Reset selection when modal opens
      setSelectedFleetId("");
    }
  }, [isOpen, orderData]);

  const handleSubmit = () => {
    if (!selectedFleetId) {
      toast({
        variant: "destructive",
        title: "Pilih kendaraan terlebih dahulu",
      });
      return;
    }

    setLoading(true);

    // Only update fleet_id
    editOrder(
      {
        fleet_id: Number(selectedFleetId),
      },
      {
        onSuccess: () => {
          toast({
            variant: "success",
            title: "Kendaraan berhasil diganti!",
          });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          setLoading(false);
          onClose();
          router.refresh();
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Gagal mengganti kendaraan",
            description: error?.response?.data?.message || "Terjadi kesalahan",
          });
          setLoading(false);
        },
      }
    );
  };

  if (!orderData) {
    return null;
  }

  return (
    <ModalCustom
      title="Ganti Kendaraan"
      description="Pilih kendaraan pengganti untuk pesanan ini"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="grid gap-4 py-4">
        {/* Read-only information */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Informasi Pesanan</h3>
          
          <div className="grid gap-2">
            <Label className="text-xs text-gray-600">Nama Pelanggan</Label>
            <div className="text-sm font-medium text-gray-900">
              {orderData?.customer?.name || "-"}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs text-gray-600">Waktu Pengambilan</Label>
            <div className="text-sm font-medium text-gray-900">
              {orderDate
                ? dayjs(orderDate).locale("id").format("dddd, DD MMMM YYYY [Jam] HH:mm")
                : "-"}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs text-gray-600">Durasi Sewa</Label>
            <div className="text-sm font-medium text-gray-900">
              {orderDuration ? `${orderDuration} Hari` : "-"}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs text-gray-600">Kendaraan Saat Ini</Label>
            <div className="text-sm font-medium text-gray-900">
              {orderData?.fleet?.name || "-"}
            </div>
          </div>
        </div>

        {/* Fleet selection */}
        <div className="grid gap-2">
          <Label htmlFor="fleet-select" className="text-sm font-semibold">
            Pilih Kendaraan Baru <span className="text-red-500">*</span>
          </Label>
          
          {isFetchingFleets ? (
            <div className="flex items-center justify-center py-4">
              <Spinner className="h-5 w-5" />
            </div>
          ) : (
            <Select
              value={selectedFleetId}
              onValueChange={setSelectedFleetId}
            >
              <SelectTrigger id="fleet-select" className="w-full">
                <SelectValue placeholder="Pilih kendaraan..." />
              </SelectTrigger>
              <SelectContent>
                {availableFleets.length === 0 ? (
                  <SelectItem value="no-fleet" disabled>
                    Tidak ada kendaraan tersedia
                  </SelectItem>
                ) : (
                  availableFleets.map((fleet: any) => (
                    <SelectItem key={fleet.id} value={fleet.id.toString()}>
                      {fleet.name} - {fleet.type} ({formatRupiah(fleet.price)}/hari)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}

          {availableFleets.length === 0 && !isFetchingFleets && (
            <p className="text-xs text-gray-500">
              Tidak ada kendaraan tersedia untuk tanggal dan durasi yang dipilih.
            </p>
          )}
        </div>
      </div>

      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button
          disabled={loading}
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          Batal
        </Button>
        <Button
          disabled={loading || !selectedFleetId || isFetchingFleets}
          variant="default"
          onClick={(e) => {
            e.stopPropagation();
            handleSubmit();
          }}
        >
          {loading ? <Spinner className="h-5 w-5" /> : "Simpan"}
        </Button>
      </div>
    </ModalCustom>
  );
};

