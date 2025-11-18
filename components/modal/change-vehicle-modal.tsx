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

    // Create full payload like edit order, only changing fleet_id
    const payload: any = {
      start_request: {
        is_self_pickup: orderData?.start_request?.is_self_pickup ?? true,
        ...((orderData?.start_request?.driver_id || orderData?.start_request?.driver?.id) && { 
          driver_id: Number(orderData.start_request.driver_id || orderData.start_request.driver?.id) 
        }),
        ...(!orderData?.start_request?.is_self_pickup && {
          address: orderData?.start_request?.address || "",
          distance: Number(orderData?.start_request?.distance || 0),
        }),
        ...(orderData?.start_request?.status && { 
          status: orderData.start_request.status 
        }),
      },
      end_request: {
        is_self_pickup: orderData?.end_request?.is_self_pickup ?? true,
        ...((orderData?.end_request?.driver_id || orderData?.end_request?.driver?.id) && { 
          driver_id: Number(orderData.end_request.driver_id || orderData.end_request.driver?.id) 
        }),
        ...(!orderData?.end_request?.is_self_pickup && {
          address: orderData?.end_request?.address || "",
          distance: Number(orderData?.end_request?.distance || 0),
        }),
        ...(orderData?.end_request?.status && { 
          status: orderData.end_request.status 
        }),
      },
      customer_id: Number(orderData?.customer_id || orderData?.customer?.id),
      fleet_id: Number(selectedFleetId), // Only this changes
      description: orderData?.description || "",
      is_with_driver: orderData?.is_with_driver ?? false,
      is_out_of_town: orderData?.is_out_of_town ?? false,
      date: orderData?.start_date ? new Date(orderData.start_date).toISOString() : new Date().toISOString(),
      duration: Number(orderData?.duration || 1),
      discount: Number(orderData?.discount || 0),
      insurance_id: orderData?.insurance_id 
        ? (Number(orderData.insurance_id) === 0 ? null : Number(orderData.insurance_id))
        : (orderData?.insurance?.id ? Number(orderData.insurance.id) : null),
      ...(orderData?.region_id && { region_id: Number(orderData.region_id) }),
      ...(orderData?.service_price && {
        service_price: Number(orderData.service_price),
      }),
      ...(orderData?.additional_services && orderData.additional_services.length > 0 && {
        additional_services: orderData.additional_services.map((service: any) => ({
          name: service.name,
          price: Number(service.price || 0),
        })),
      }),
      ...(orderData?.addons && orderData.addons.length > 0 && {
        addons: orderData.addons.map((addon: any) => ({
          addon_id: Number(addon.addon_id || addon.id),
          name: addon.name || "",
          price: Number(addon.price || 0),
          quantity: Number(addon.quantity || 1),
        })),
      }),
      ...(orderData?.applied_voucher_code && { 
        voucher_code: orderData.applied_voucher_code 
      }),
    };

    editOrder(
      payload,
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

