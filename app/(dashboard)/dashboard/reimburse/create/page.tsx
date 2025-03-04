"use client";
import BreadCrumb from "@/components/breadcrumb";
import { ReimburseForm } from "@/components/forms/reimburse-form";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";

export default function Page() {
  useEffect(() => {});
  const { isMinimized } = useSidebar();

  const breadcrumbItems = [
    { title: "Reimburse", link: "/dashboard/reimburse" },
    { title: "Tambah Reimburse", link: "/dashboard/reimburse/create" },
  ];

  return (
    <div className="flex-1 space-y-4 p-5">
      <BreadCrumb items={breadcrumbItems} />
      <ReimburseForm initialData={null} isEdit />
    </div>
  );
}
