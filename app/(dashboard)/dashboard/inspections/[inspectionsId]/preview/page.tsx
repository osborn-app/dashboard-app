"use client";

import BreadCrumb from "@/components/breadcrumb";
import InspectionsForm from "@/components/forms/inspections-form";
import Spinner from "@/components/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetInspectionDetail } from "@/hooks/api/useInspections";
import React from "react";

export default function Page({ params }: { params: { inspectionsId: string } }) {
  const breadcrumbItems = [
    { title: "Inspections", link: "/dashboard/inspections" },
    { title: "Preview", link: "/dashboard/inspections/preview" },
  ];

  const { data, isFetching } = useGetInspectionDetail(params.inspectionsId);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {isFetching && <Spinner />}
        {!isFetching && data?.data && (
          <InspectionsForm
            initialData={data?.data}
            isEdit
          />
        )}
      </div>
    </ScrollArea>
  );
}
