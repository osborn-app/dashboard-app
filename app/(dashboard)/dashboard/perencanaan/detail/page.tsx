"use client";

import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { dummyPerencanaanData } from "../data/dummy-data";
import { DaftarAkun } from "../components/daftar-akun";
import { RencanaTab } from "../components/rencana-tab";
import { LaporanTabs } from "../components/laporan-tabs";

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "#" }
];

export default function DetailPerencanaanPage() {
  const [activeTab, setActiveTab] = useState("rekening");
  
  // Use first dummy data for testing
  const planningData = dummyPerencanaanData[0];

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title={planningData.name} />
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
            <DaftarAkun planningId={planningData.id} />
          </TabsContent>

          {/* Rencana Tab */}
          <TabsContent value="rencana" className="space-y-4">
            <RencanaTab planningId={planningData.id} />
          </TabsContent>

          {/* Laporan Tab */}
          <TabsContent value="laporan" className="space-y-4">
            <LaporanTabs planningId={planningData.id} />
          </TabsContent>
        </Tabs>
      </div>

    </>
  );
}
