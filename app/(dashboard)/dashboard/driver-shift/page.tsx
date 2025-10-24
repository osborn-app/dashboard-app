import React from "react";
import { Heading } from "@/components/ui/heading";
import BreadCrumb from "@/components/breadcrumb";
import { Separator } from "@/components/ui/separator";
import DriverShiftTableWrapper from "./driver-shift-table-wrapper";

export default function Page() {
  const breadcrumbItems = [
    { title: "Driver Shift", link: "/dashboard/driver-shift" },
  ];

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Driver Shift" />
        </div>
        <Separator />
        <DriverShiftTableWrapper />
      </div>
    </>
  );
}
