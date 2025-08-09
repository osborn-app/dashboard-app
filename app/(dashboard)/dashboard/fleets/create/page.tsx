"use client";
import BreadCrumb from "@/components/breadcrumb";
import { FleetForm } from "@/components/forms/fleet-form";
import React from "react";

export default function Page() {
  const breadcrumbItems = [
    { title: "Fleets", link: "/dashboard/fleets" },
    { title: "Create", link: "/dashboard/fleets/create" },
  ];

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      <FleetForm
        initialData={null}
        key={null}
        type={[
          { id: "motorcycle", name: "Motor" },
          { id: "car", name: "Mobil" },
        ]}
        statusOptions={[
          { id: "available", name: "Available" },
          { id: "preparation", name: "Preparation" },
        ]}
        isEdit
      />
    </div>
  );
}
