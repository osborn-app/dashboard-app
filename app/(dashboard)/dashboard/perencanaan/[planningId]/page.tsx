"use client";

import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import { useParams } from "next/navigation";

// Import tab components (akan dibuat nanti)
// import RekeningTab from "./components/rekening-tab";
// import RencanaTab from "./components/rencana-tab";
// import LaporanTab from "./components/laporan-tab";

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "#" }
];

export default function DetailPerencanaanPage() {
  const params = useParams();
  const planningId = params.planningId as string;
  const [activeTab, setActiveTab] = useState("rekening");

  // For testing purposes, use a default planning ID if none provided
  const currentPlanningId = planningId || "1";

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Penambahan Unit Lamborghini" />
        </div>
        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rekening">Daftar Rekening</TabsTrigger>
            <TabsTrigger value="rencana">Rencana</TabsTrigger>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
          </TabsList>

          {/* Daftar Rekening Tab */}
          <TabsContent value="rekening" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Daftar Rekening Tab - Coming Soon
            </div>
          </TabsContent>

          {/* Rencana Tab */}
          <TabsContent value="rencana" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Rencana Tab - Coming Soon
            </div>
          </TabsContent>

          {/* Laporan Tab */}
          <TabsContent value="laporan" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Laporan Tab - Coming Soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
