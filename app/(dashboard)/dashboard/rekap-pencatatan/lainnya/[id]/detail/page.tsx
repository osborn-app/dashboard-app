"use client";

import React from "react";
import { useGetLainnyaById } from "@/hooks/api/useRekap";
import BreadCrumb from "@/components/breadcrumb";
import { RekapLainnyaForm } from "@/components/forms/rekap-lainnya-form";
import Spinner from "@/components/spinner";

export default function Page({ params }: { params: { id: string } }) {
  const breadcrumbItems = [
    { title: "Rekap Pencatatan", link: "/dashboard/rekap-pencatatan" },
    {
      title: "Detail",
      link: `/dashboard/rekap-pencatatan/lainnya/${params.id}/detail`,
    },
  ];

  const { data, isFetching, error, isError } = useGetLainnyaById(params.id);

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      {isFetching && <Spinner />}
      {isError && (
        <div className="text-center py-8">
          <p className="text-red-600">
            Error: {error?.message || "Terjadi kesalahan saat mengambil data"}
          </p>
        </div>
      )}
      {!isFetching && !isError && data && (
        <RekapLainnyaForm initialData={data} />
      )}
      {!isFetching && !isError && !data && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Data tidak ditemukan</p>
        </div>
      )}
    </div>
  );
}
