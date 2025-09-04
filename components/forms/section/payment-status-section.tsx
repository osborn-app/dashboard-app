"use client";
import React, { useState } from "react";
import { CreditCard, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/context/UserContext";
import { useUpdatePaymentStatus } from "@/hooks/api/useProductOrder";
import Spinner from "@/components/spinner";
import dayjs from "dayjs";

interface PaymentStatusSectionProps {
  orderId: number;
  currentStatus: string;
  paymentDate?: string;
  failureReason?: string;
}

const PaymentStatusSection: React.FC<PaymentStatusSectionProps> = ({
  orderId,
  currentStatus,
  paymentDate,
  failureReason,
}) => {
  const { toast } = useToast();
  const { user } = useUser();
  const [paymentStatus, setPaymentStatus] = useState(currentStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const updatePaymentStatusMutation = useUpdatePaymentStatus(orderId);

  // Payment status options
  const paymentStatusOptions = [
    { value: "pending", label: "Menunggu Pembayaran" },
    { value: "partially paid", label: "Sebagian Dibayar" },
    { value: "done", label: "Lunas" },
    { value: "failed", label: "Gagal" },
  ];

  // Get payment status label
  const getPaymentStatusLabel = (status: string) => {
    const option = paymentStatusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "partially paid":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "done":
        return "text-green-600 bg-green-50 border-green-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Handle payment status update
  const handleUpdatePaymentStatus = async (newStatus: string) => {
    if (newStatus === paymentStatus) return;

    try {
      await updatePaymentStatusMutation.mutateAsync({ payment_status: newStatus });
      
      setPaymentStatus(newStatus);
      setIsModalOpen(false);
      toast({
        title: "Berhasil",
        description: "Payment status berhasil diupdate",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Terjadi kesalahan saat update payment status",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Compact Status Display */}
      <div className="border border-neutral-200 rounded-md p-[10px] mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-neutral-600" />
            <span className="text-sm text-neutral-600">Status Pembayaran:</span>
            <div className={`px-2 py-1 rounded-md border text-xs font-medium ${getPaymentStatusColor(paymentStatus)}`}>
              {getPaymentStatusLabel(paymentStatus)}
            </div>
          </div>
          
          {/* Edit Button for Admin */}
          {user?.role === "admin" && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Status Pembayaran</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Current Status */}
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                      Status Saat Ini
                    </label>
                    <div className={`px-3 py-2 rounded-md border text-sm font-medium ${getPaymentStatusColor(paymentStatus)}`}>
                      {getPaymentStatusLabel(paymentStatus)}
                    </div>
                  </div>
                  
                  {/* New Status Selection */}
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                      Pilih Status Baru
                    </label>
                    <Select
                      value={paymentStatus}
                      onValueChange={handleUpdatePaymentStatus}
                      disabled={updatePaymentStatusMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Loading State */}
                  {updatePaymentStatusMutation.isPending && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-neutral-50 rounded-md">
                      <Spinner className="h-4 w-4" />
                      <span className="text-sm text-neutral-600">Sedang mengupdate status...</span>
                    </div>
                  )}
                  
                  {/* Payment Info Cards */}
                  {paymentStatus === "done" && (
                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="text-sm text-green-700">
                          <p className="font-medium">✅ Pembayaran telah lunas</p>
                          {paymentDate && (
                            <p className="text-xs text-green-600">
                              Tanggal: {dayjs(paymentDate).format("DD MMMM YYYY HH:mm")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentStatus === "failed" && (
                    <div className="p-3 bg-red-50 rounded-md border border-red-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="text-sm text-red-700">
                          <p className="font-medium">❌ Pembayaran gagal</p>
                          {failureReason && (
                            <p className="text-xs text-red-600">
                              Alasan: {failureReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentStatus === "partially paid" && (
                    <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="text-sm text-blue-700">
                          <p className="font-medium">💰 Pembayaran sebagian</p>
                          <p className="text-xs text-blue-600">
                            Pelanggan telah membayar sebagian dari total yang dibutuhkan
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentStatus === "pending" && (
                    <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="text-sm text-yellow-700">
                          <p className="font-medium">⏳ Menunggu pembayaran</p>
                          <p className="text-xs text-yellow-600">
                            Pelanggan belum melakukan pembayaran
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {/* Quick Status Info */}
        {paymentStatus === "done" && paymentDate && (
          <div className="mt-2 text-xs text-neutral-500">
            Lunas pada: {dayjs(paymentDate).format("DD MMM YYYY HH:mm")}
          </div>
        )}
        
        {paymentStatus === "failed" && failureReason && (
          <div className="mt-2 text-xs text-red-500">
            Alasan: {failureReason}
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentStatusSection;
