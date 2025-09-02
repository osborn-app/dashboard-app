"use client";
import BreadCrumb from "@/components/breadcrumb";
import { OrderForm } from "@/components/forms/order-form";
import Spinner from "@/components/spinner";
import { useGetDetailOrder } from "@/hooks/api/useOrder";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { HistoryModal } from "@/components/modal/history-modal";

export default function Page({ params }: { params: { orderId: number } }) {
  const { isMinimized } = useSidebar();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const breadcrumbItems = [
    { title: "Pesanan", link: "/dashboard/orders" },
    { title: "Edit Pesanan", link: "/dashboard/orders/edit" },
  ];

  const { data, isFetching } = useGetDetailOrder(params.orderId);

  return (
    <div className="flex-1 space-y-4 p-5">
      <BreadCrumb items={breadcrumbItems} />
      
      {isFetching && <Spinner />}
      {!isFetching && data?.data && (
        <OrderForm 
          initialData={data?.data} 
          isEdit 
          showHistoryButton={true}
          onHistoryClick={() => setIsHistoryModalOpen(true)}
        />
      )}
      
      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        orderId={params.orderId.toString()}
      />
    </div>
  );
}
