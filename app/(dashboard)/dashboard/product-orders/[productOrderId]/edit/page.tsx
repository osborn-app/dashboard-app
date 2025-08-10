"use client";
import BreadCrumb from "@/components/breadcrumb";
import { ProductOrderForm } from "@/components/forms/product-order-form";
import Spinner from "@/components/spinner";
import { useGetDetailProductOrder } from "@/hooks/api/useProductOrder";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";
import React from "react";

export default function Page({ params }: { params: { productOrderId: number } }) {
  const { isMinimized } = useSidebar();

  const breadcrumbItems = [
    { title: "Product Orders", link: "/dashboard/product-orders" },
    { title: "Edit Product Order", link: "/dashboard/product-orders/edit" },
  ];

  const { data, isFetching } = useGetDetailProductOrder(params.productOrderId);

  return (
    <div className="flex-1 space-y-4 p-5">
      <BreadCrumb items={breadcrumbItems} />
      {isFetching && <Spinner />}
      {!isFetching && data?.data && (
        <ProductOrderForm 
          initialData={data.data} 
          isEdit={true}
          productOrderId={params.productOrderId.toString()} 
        />
      )}
    </div>
  );
}