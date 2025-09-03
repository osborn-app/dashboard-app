"use client"

import React from "react";

import { useGetOrderanProdukById } from "@/hooks/api/useRekap";
import BreadCrumb from "@/components/breadcrumb";
import { RekapOrderanProdukForm } from "@/components/forms/rekap-orderan-produk-form";
import Spinner from "@/components/spinner";

export default function OrderanProdukDetailPage({ params }: { params: { id: string } }) {
  const breadcrumbItems = [
    { title: "Rekap Pencatatan", link: "/dashboard/rekap-pencatatan" },
    { title: "Detail", link: "/dashboard/rekap-pencatatan/orderan-produk/detail" },
  ];

  const { data, isFetching } = useGetOrderanProdukById(params.id);

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      {isFetching && <Spinner />}
      {!isFetching && data && <RekapOrderanProdukForm data={data} />}
    </div>
  );
}