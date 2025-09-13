"use client";

import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { DaftarAkun } from "../components/daftar-akun";
import { RencanaTab } from "../components/rencana-tab";
import { LaporanTabs } from "../components/laporan-tabs";
import { useGetDetailPerencanaan } from "@/hooks/api/usePerencanaan";

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "#" }
];

export default function DetailPerencanaanPage() {
  const params = useParams();
  const planningId = params.planningId as string;
  const [activeTab, setActiveTab] = useState("rekening");

  // Fetch planning data based on planningId
  const { data: planningData, isLoading, error } = useGetDetailPerencanaan(planningId);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !planningData) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-red-600">Error loading planning data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title={planningData.data?.name || "Detail Perencanaan"} />
        </div>
        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rekening">Daftar Akun</TabsTrigger>
            <TabsTrigger value="rencana">Rencana</TabsTrigger>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
          </TabsList>

          {/* Daftar Akun Tab */}
          <TabsContent value="rekening" className="space-y-4">
            <DaftarAkun planningId={planningId} />
          </TabsContent>

          {/* Rencana Tab */}
          <TabsContent value="rencana" className="space-y-4">
            <RencanaTab planningId={planningId} />
          </TabsContent>

          {/* Laporan Tab */}
          <TabsContent value="laporan" className="space-y-4">
            <LaporanTabs planningId={planningId} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
