"use client";
import BreadCrumb from "@/components/breadcrumb";
import { RekapLainnyaForm } from "@/components/forms/rekap-lainnya-form";
import React from "react";

export default function Page() {
  const breadcrumbItems = [
    { title: "Rekap Pencatatan", link: "/dashboard/rekap-pencatatan" },
    { title: "Tambah Transaksi Lainnya", link: "/dashboard/rekap-pencatatan/lainnya/create" },
  ];

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      <RekapLainnyaForm />
    </div>
  );
}