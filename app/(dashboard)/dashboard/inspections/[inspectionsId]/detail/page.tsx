"use client";

import BreadCrumb from "@/components/breadcrumb";
import InspectionsForm from "@/components/forms/inspections-form";
import Spinner from "@/components/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetInspectionDetail } from "@/hooks/api/useInspections";
import React from "react";
import { useRouter } from "next/navigation";

interface DetailPageProps {
  params: {
    inspectionsId: string;
  };
}

export default function InspectionDetailPage({ params }: DetailPageProps) {
  const router = useRouter();
  const { data: inspection, isLoading } = useGetInspectionDetail(
    params.inspectionsId,
  );

  const breadcrumbItems = [
    { title: "Inspections", link: "/dashboard/inspections" },
    {
      title: "Detail",
      link: `/dashboard/inspections/${params.inspectionsId}/detail`,
    },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {isLoading && <Spinner />}
        {!isLoading && inspection?.data && (
          <InspectionsForm initialData={inspection.data} isEdit />
        )}
      </div>
    </ScrollArea>
  );
}
