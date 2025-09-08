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

// Import data
import { 
  accountsData, 
  accountTableData, 
  transactionData, 
  reportData, 
  categoryData 
} from "./data/sample-data";

const breadcrumbItems = [{ title: "Realisasi", link: "/dashboard/realisasi" }];

export default function RealisasiPage() {
  const { activeTab, setActiveTab } = useTabState();

  // Handler functions

  const handleReorderAccounts = async (newOrder: any[]) => {
    console.log("New account order:", newOrder);
    // Here you would typically save the new order to your backend
  };

  const handleEditAccount = (id: string) => {
    console.log("Edit account:", id);
    // Handle edit account
  };

  const handleDeleteAccount = (id: string) => {
    console.log("Delete account:", id);
    // Handle delete account
  };

  const handleAddTransaction = () => {
    console.log("Add transaction clicked");
    // Handle add transaction
  };

  const handleEditTransaction = (id: string) => {
    console.log("Edit transaction:", id);
    // Handle edit transaction
  };

  const handleDeleteTransaction = (id: string) => {
    console.log("Delete transaction:", id);
    // Handle delete transaction
  };

  const handleAddCategory = (category: { name: string; debitAccount: string; creditAccount: string }) => {
    console.log("Add category:", category);
    // Handle add category
  };

  const handleEditCategory = (id: string, category: { name: string; debitAccount: string; creditAccount: string }) => {
    console.log("Edit category:", id, category);
    // Handle edit category
  };

  const handleDeleteCategory = (id: string) => {
    console.log("Delete category:", id);
    // Handle delete category
  };

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
            <DaftarAkunTab
              accountsData={accountsData}
              onReorderAccounts={handleReorderAccounts}
              onEditAccount={handleEditAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          </TabsContent>

          {/* Daftar Rekening Tab */}
          <TabsContent value="daftar-rekening" className="space-y-4">
            <DaftarRekeningTab
              accountTableData={accountTableData}
              onEditAccount={handleEditAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          </TabsContent>

          {/* Transaksi Tab */}
          <TabsContent value="transaksi" className="space-y-4">
            <TransaksiTab
              transactionData={transactionData}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </TabsContent>

          {/* Laporan Tab */}
          <TabsContent value="laporan" className="space-y-4">
            <LaporanTab />
          </TabsContent>

          {/* Kategori Tab */}
          <TabsContent value="kategori" className="space-y-4">
            <KategoriTab
              categoryData={categoryData}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
