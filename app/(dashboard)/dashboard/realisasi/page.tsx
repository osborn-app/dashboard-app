"use client";

import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Plus, Cloud, Search } from "lucide-react";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronDown, ChevronRight, Minus } from "lucide-react";

// Import components
import AccountList from "./components/account-list";
import AccountTable from "./components/account-table";
import TransactionList from "./components/transactions";
import Reports from "./components/reports";
import Categories from "./components/categories";

const breadcrumbItems = [{ title: "Realisasi", link: "/dashboard/realisasi" }];

export default function RealisasiPage() {
  const [activeTab, setActiveTab] = useState("daftar-akun");
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data for accounts (hierarchical)
  const accountsData = [
    {
      id: "10000",
      code: "10000",
      name: "HARTA",
      type: "ASSETS",
      level: 1,
      expanded: true,
      children: [
        {
          id: "11000",
          code: "11000",
          name: "AKTIVA LANCAR",
          type: "CURRENT ASSETS",
          level: 2,
          expanded: true,
          children: [
            {
              id: "11100",
              code: "11100",
              name: "KAS",
              type: "CASH",
              level: 3,
              expanded: false,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: "20000",
      code: "20000",
      name: "DANA BOS",
      type: "BOS FUNDS",
      level: 1,
      expanded: false,
      children: []
    }
  ];

  // Sample data for account table
  const accountTableData = [
    {
      id: "1",
      code: "10000",
      name: "HARTA",
      type: "ASSETS",
      balance: 50000000,
      status: "active" as const,
      lastUpdated: "2024-01-15"
    },
    {
      id: "2",
      code: "11000",
      name: "AKTIVA LANCAR",
      type: "CURRENT ASSETS",
      balance: 30000000,
      status: "active" as const,
      lastUpdated: "2024-01-15"
    },
    {
      id: "3",
      code: "11100",
      name: "KAS",
      type: "CASH",
      balance: 15000000,
      status: "active" as const,
      lastUpdated: "2024-01-15"
    },
    {
      id: "4",
      code: "20000",
      name: "DANA BOS",
      type: "BOS FUNDS",
      balance: 20000000,
      status: "pending" as const,
      lastUpdated: "2024-01-14"
    }
  ];

  // Sample data for transactions
  const transactionData = [
    {
      id: "1",
      date: "2024-01-15",
      category: "Orderan Sewa - Pendapatan Sewa Fleets",
      transactionName: "Nama Kendaraan - Nama Customer",
      accountCode: "11100",
      accountName: "KAS & BANK",
      debit: 300000,
      credit: 0,
      type: "debit" as const,
      parentTransactionId: "1"
    },
    {
      id: "1-credit",
      date: "2024-01-15",
      category: "Orderan Sewa - Pendapatan Sewa Fleets",
      transactionName: "Nama Kendaraan - Nama Customer",
      accountCode: "41000",
      accountName: "Pendapatan Sewa Kendaraan",
      debit: 0,
      credit: 300000,
      type: "credit" as const,
      parentTransactionId: "1"
    },
    {
      id: "2",
      date: "2024-01-14",
      category: "Pembayaran Gaji - Beban Operasional",
      transactionName: "Gaji Guru Bulan Januari 2024",
      accountCode: "11100",
      accountName: "KAS & BANK",
      debit: 0,
      credit: 5000000,
      type: "credit" as const,
      parentTransactionId: "2"
    },
    {
      id: "2-debit",
      date: "2024-01-14",
      category: "Pembayaran Gaji - Beban Operasional",
      transactionName: "Gaji Guru Bulan Januari 2024",
      accountCode: "51000",
      accountName: "Beban Gaji",
      debit: 5000000,
      credit: 0,
      type: "debit" as const,
      parentTransactionId: "2"
    },
    {
      id: "3",
      date: "2024-01-13",
      category: "Pembelian ATK - Beban Operasional",
      transactionName: "Pembelian Alat Tulis Kantor",
      accountCode: "11100",
      accountName: "KAS & BANK",
      debit: 0,
      credit: 500000,
      type: "credit" as const,
      parentTransactionId: "3"
    },
    {
      id: "3-debit",
      date: "2024-01-13",
      category: "Pembelian ATK - Beban Operasional",
      transactionName: "Pembelian Alat Tulis Kantor",
      accountCode: "52000",
      accountName: "Beban ATK",
      debit: 500000,
      credit: 0,
      type: "debit" as const,
      parentTransactionId: "3"
    }
  ];

  // Sample data for reports
  const reportData = [
    {
      id: "1",
      title: "Laporan Keuangan Bulanan Januari 2024",
      type: "financial" as const,
      status: "published" as const,
      createdBy: "Admin Keuangan",
      createdAt: "2024-01-15",
      lastModified: "2024-01-15",
      description: "Laporan keuangan lengkap untuk bulan Januari 2024"
    },
    {
      id: "2",
      title: "Laporan Operasional Sekolah",
      type: "operational" as const,
      status: "draft" as const,
      createdBy: "Kepala Sekolah",
      createdAt: "2024-01-14",
      lastModified: "2024-01-14",
      description: "Laporan operasional kegiatan sekolah"
    },
    {
      id: "3",
      title: "Laporan Kepatuhan Dana BOS",
      type: "compliance" as const,
      status: "published" as const,
      createdBy: "Admin Keuangan",
      createdAt: "2024-01-13",
      lastModified: "2024-01-13",
      description: "Laporan kepatuhan penggunaan dana BOS"
    }
  ];

  // Sample data for categories
  const categoryData = [
    {
      id: "1",
      name: "Orderan Sewa - Pendapatan Sewa Fleets",
      debitAccount: "KAS & BANK",
      creditAccount: "Pendapatan Sewa Kendaraan"
    },
    {
      id: "2",
      name: "Pembayaran Gaji - Beban Operasional",
      debitAccount: "Beban Gaji",
      creditAccount: "KAS & BANK"
    },
    {
      id: "3",
      name: "Pembelian ATK - Beban Operasional",
      debitAccount: "Beban ATK",
      creditAccount: "KAS & BANK"
    }
  ];

  const handleReorderAccounts = async (newOrder: any[]) => {
    console.log("New account order:", newOrder);
    // Here you would typically save the new order to your backend
  };

  const handleAddAccount = () => {
    console.log("Add account clicked");
    // Handle add account
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

  const handleAddReport = () => {
    console.log("Add report clicked");
    // Handle add report
  };

  const handleEditReport = (id: string) => {
    console.log("Edit report:", id);
    // Handle edit report
  };

  const handleDeleteReport = (id: string) => {
    console.log("Delete report:", id);
    // Handle delete report
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="daftar-akun">Daftar Akun</TabsTrigger>
            <TabsTrigger value="daftar-rekening">Daftar Rekening</TabsTrigger>
            <TabsTrigger value="transaksi">Transaksi</TabsTrigger>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
            <TabsTrigger value="kategori">Kategori</TabsTrigger>
          </TabsList>

          {/* Daftar Akun Tab */}
          <TabsContent value="daftar-akun" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari akun....."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4" />
                  <span>Rekap Akun</span>
                </Button>
                <Button className={cn(buttonVariants({ variant: "main" }))}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Akun
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <AccountList 
                  accounts={accountsData} 
                  onReorder={handleReorderAccounts}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daftar Rekening Tab */}
          <TabsContent value="daftar-rekening" className="space-y-4">
            <AccountTable 
              accounts={accountTableData}
              onAddAccount={handleAddAccount}
              onEditAccount={handleEditAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          </TabsContent>

          {/* Transaksi Tab */}
          <TabsContent value="transaksi" className="space-y-4">
            <TransactionList 
              transactions={transactionData}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </TabsContent>

          {/* Laporan Tab */}
          <TabsContent value="laporan" className="space-y-4">
            <Reports />
          </TabsContent>

          {/* Kategori Tab */}
          <TabsContent value="kategori" className="space-y-4">
            <Categories 
              categories={categoryData}
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
