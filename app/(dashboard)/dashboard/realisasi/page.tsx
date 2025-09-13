"use client";

import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

// Import hooks
import { useTabState } from "./hooks/use-tab-state";

// Import tab components
import DaftarAkunTab from "./components/tabs/daftar-akun-tab";
import DaftarRekeningTab from "./components/tabs/daftar-rekening-tab";
import TransaksiTab from "./components/tabs/transaksi-tab";
import LaporanTab from "./components/tabs/laporan-tab";
import KategoriTab from "./components/tabs/kategori-tab";

const breadcrumbItems = [{ title: "Realisasi", link: "/dashboard/realisasi" }];

export default function RealisasiPage() {
  const { activeTab, setActiveTab, registerRefetchCallback } = useTabState();

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Realisasi" />
        </div>
        <Separator />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="daftar-akun">Daftar Akun</TabsTrigger>
            <TabsTrigger value="daftar-rekening">Daftar Rekening</TabsTrigger>
            <TabsTrigger value="transaksi">Transaksi</TabsTrigger>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
            <TabsTrigger value="kategori">Kategori</TabsTrigger>
          </TabsList>

          {/* Daftar Akun Tab */}
          <TabsContent value="daftar-akun" className="space-y-4">
            <DaftarAkunTab registerRefetchCallback={registerRefetchCallback} />
          </TabsContent>

          {/* Daftar Rekening Tab */}
          <TabsContent value="daftar-rekening" className="space-y-4">
            <DaftarRekeningTab registerRefetchCallback={registerRefetchCallback} />
          </TabsContent>

          {/* Transaksi Tab */}
          <TabsContent value="transaksi" className="space-y-4">
            <TransaksiTab registerRefetchCallback={registerRefetchCallback} />
          </TabsContent>

          {/* Laporan Tab */}
          <TabsContent value="laporan" className="space-y-4">
            <LaporanTab registerRefetchCallback={registerRefetchCallback} />
          </TabsContent>

          {/* Kategori Tab */}
          <TabsContent value="kategori" className="space-y-4">
            <KategoriTab registerRefetchCallback={registerRefetchCallback} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}