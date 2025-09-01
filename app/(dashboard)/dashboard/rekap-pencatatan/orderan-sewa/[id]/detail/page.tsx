"use client"

import React from "react";

import { useGetOrderanSewaById } from "@/hooks/api/useRekap";
import BreadCrumb from "@/components/breadcrumb";
import { RekapOrderanSewaForm } from "@/components/forms/rekap-orderan-sewa-form";
import Spinner from "@/components/spinner";

export default function OrderanSewaDetailPage({ params }: { params: { id: string } }) {
  const breadcrumbItems = [
    { title: "Rekap Pencatatan", link: "/dashboard/rekap-pencatatan" },
    { title: "Detail", link: "/dashboard/rekap-pencatatan/orderan-sewa/detail" },
  ];

  const { data, isFetching } = useGetOrderanSewaById(params.id);

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      {isFetching && <Spinner />}
      {!isFetching && data && <RekapOrderanSewaForm data={data} />}
    </div>
  );
}