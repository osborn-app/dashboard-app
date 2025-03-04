"use client";
import BreadCrumb from "@/components/breadcrumb";
import { OrderForm } from "@/components/forms/order-form";
import Spinner from "@/components/spinner";
import { useGetDetailOrder } from "@/hooks/api/useOrder";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";
import React from "react";

export default function Page({ params }: { params: { orderId: number } }) {
  const { isMinimized } = useSidebar();

  const breadcrumbItems = [
    { title: "Pesanan", link: "/dashboard/orders" },
    { title: "Detail Pesanan", link: "/dashboard/orders/detail" },
  ];

  const { data, isFetching } = useGetDetailOrder(params.orderId);

  return (
    <div className="flex-1 space-y-4 p-5">
      <BreadCrumb items={breadcrumbItems} />
      {isFetching && <Spinner />}
      {!isFetching && data?.data && <OrderForm initialData={data?.data} />}
    </div>
  );
}
