"use client";
import BreadCrumb from "@/components/breadcrumb";
import { ReimburseForm } from "@/components/forms/reimburse-form";
import Spinner from "@/components/spinner";
import { useGetDetailReimburse } from "@/hooks/api/useReimburse";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";
import React from "react";

export default function Page({ params }: { params: { reimburseid: number } }) {
  const { isMinimized } = useSidebar();

  const breadcrumbItems = [
    { title: "Reimburse", link: "/dashboard/reimburse" },
    { title: "Edit Reimburse", link: "/dashboard/reimburse/edit" },
  ];

  const { data, isFetching } = useGetDetailReimburse(params.reimburseid);

  return (
    <div className="flex-1 space-y-4 p-5">
      <BreadCrumb items={breadcrumbItems} />
      {isFetching && <Spinner />}
      {!isFetching && data?.data && (
        <ReimburseForm initialData={data?.data} isEdit />
      )}
    </div>
  );
}
