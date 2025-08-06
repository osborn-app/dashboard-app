"use client";
import BreadCrumb from "@/components/breadcrumb";
import Spinner from "@/components/spinner";
import { useGetMaintenanceById } from "@/hooks/api/useNeeds";

import React from "react";
import { useSession } from "next-auth/react";

export default function Page({ params }: { params: { needsId: number } }) {
  const { data: session } = useSession();

  const breadcrumbItems = [
    { title: "Maintenance", link: "/dashboard/needs" },
    { title: "Detail Maintenance", link: "/dashboard/needs/detail" },
  ];

  const { data, isFetching } = useGetMaintenanceById(params.needsId, session?.user?.accessToken || "");

  return (
    <div className="flex-1 space-y-4 p-5">
      <BreadCrumb items={breadcrumbItems} />
      {isFetching && <Spinner />}
      {!isFetching && data && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Detail Maintenance</h1>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Maintenance</label>
                <p className="mt-1 text-sm text-gray-900">{data?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Armada</label>
                <p className="mt-1 text-sm text-gray-900">{data?.fleet?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                <p className="mt-1 text-sm text-gray-900">{data?.start_date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimasi Hari</label>
                <p className="mt-1 text-sm text-gray-900">{data?.estimate_days} hari</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <p className="mt-1 text-sm text-gray-900">{data?.description || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
