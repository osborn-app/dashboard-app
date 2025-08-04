"use client";

import BreadCrumb from "@/components/breadcrumb";
import InspectionsForm from "@/components/forms/inspections-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export default function CreateInspectionPage() {
  const breadcrumbItems = [
    { title: "Inspections", link: "/dashboard/inspections" },
    { title: "Create", link: "/dashboard/inspections/create" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        <InspectionsForm isEdit={false} />
      </div>
    </ScrollArea>
  );
}
