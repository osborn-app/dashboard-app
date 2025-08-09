"use client";
import BreadCrumb from "@/components/breadcrumb";
import { FleetForm } from "@/components/forms/fleet-form";
import Spinner from "@/components/spinner";
import { useGetDetailFleet } from "@/hooks/api/useFleet";
import React from "react";

export default function Page({ params }: { params: { fleetId: number } }) {
  const breadcrumbItems = [
    { title: "Fleets", link: "/dashboard/fleets" },
    { title: "Edit", link: "/dashboard/fleets/edit" },
  ];

  const { data, isFetching } = useGetDetailFleet(params.fleetId);

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      {isFetching && <Spinner />}
      {!isFetching && data?.data && (
        <FleetForm
          initialData={data.data}
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
      )}
    </div>
  );
}
