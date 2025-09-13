"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Cloud, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

// Dummy data untuk jurnal umum dengan grouping
const dummyJurnalUmumData = [
  {
    id: "1",
    tanggal: "17/08/1945",
    namaAkun: "11100 - KAS & BANK",
    debit: 300000,
    kredit: 0,
    transactionGroup: "1",
    isFirstInGroup: true
  },
  {
    id: "2",
    tanggal: "",
    namaAkun: "41000 - Pendapatan Sewa Kendaraan",
    debit: 0,
    kredit: 300000,
    transactionGroup: "1",
    isFirstInGroup: false
  },
  {
    id: "3",
    tanggal: "18/08/1945",
    namaAkun: "11100 - KAS & BANK",
    debit: 500000,
    kredit: 0,
    transactionGroup: "2",
    isFirstInGroup: true
  },
  {
    id: "4",
    tanggal: "",
    namaAkun: "42000 - Pendapatan Lainnya",
    debit: 0,
    kredit: 500000,
    transactionGroup: "2",
    isFirstInGroup: false
  },
  {
    id: "5",
    tanggal: "19/08/1945",
    namaAkun: "11100 - KAS & BANK",
    debit: 750000,
    kredit: 0,
    transactionGroup: "3",
    isFirstInGroup: true
  },
  {
    id: "6",
    tanggal: "",
    namaAkun: "43000 - Pendapatan Jasa",
    debit: 0,
    kredit: 750000,
    transactionGroup: "3",
    isFirstInGroup: false
  },
  {
    id: "7",
    tanggal: "20/08/1945",
    namaAkun: "11100 - KAS & BANK",
    debit: 1000000,
    kredit: 0,
    transactionGroup: "4",
    isFirstInGroup: true
  },
  {
    id: "8",
    tanggal: "",
    namaAkun: "44000 - Pendapatan Investasi",
    debit: 0,
    kredit: 1000000,
    transactionGroup: "4",
    isFirstInGroup: false
  },
  {
    id: "9",
    tanggal: "21/08/1945",
    namaAkun: "11100 - KAS & BANK",
    debit: 250000,
    kredit: 0,
    transactionGroup: "5",
    isFirstInGroup: true
  },
  {
    id: "10",
    tanggal: "",
    namaAkun: "45000 - Pendapatan Operasional",
    debit: 0,
    kredit: 250000,
    transactionGroup: "5",
    isFirstInGroup: false
  }
];

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "/dashboard/perencanaan/detail" },
  { title: "Laporan", link: "/dashboard/perencanaan/detail" },
  { title: "Jurnal Umum", link: "/dashboard/perencanaan/detail" }
];

export default function JurnalUmumPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title="Jurnal Umum Perencanaan" />
      </div>
      <Separator />

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          {/* Search and Action Bar */}
          <div className="space-y-3 mb-6">
            {/* Top Row: Search and Action Buttons */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari Akun"
                  className="pl-10"
                />
              </div>
              
              <Button size="sm">
                <Cloud className="h-4 w-4 mr-2" />
                Rekap Jurnal Umum Perencanaan
              </Button>
            </div>
            
            {/* Bottom Row: Date Range */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="date"
                  placeholder="Tanggal Mulai"
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              
              <div className="relative flex-1">
                <Input
                  type="date"
                  placeholder="Tanggal Selesai"
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Financial Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-800 border-r border-gray-300">TANGGAL</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800 border-r border-gray-300">NAMA AKUN</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800 border-r border-gray-300">DEBIT</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800">KREDIT</th>
                </tr>
              </thead>
              <tbody>
                {dummyJurnalUmumData.map((row, index) => {
                  const isFirstInGroup = row.isFirstInGroup;
                  
                  // Calculate rowspan for merged cells
                  const groupRows = dummyJurnalUmumData.filter(r => 
                    r.transactionGroup === row.transactionGroup
                  );
                  const rowSpan = groupRows.length;
                  
                  return (
                    <tr key={row.id} className="border-b border-gray-300 hover:bg-gray-50">
                      {/* Tanggal Column - Merge and Center */}
                      {isFirstInGroup ? (
                        <td 
                          className="py-3 px-4 text-gray-900 border-r border-gray-300 text-center"
                          rowSpan={rowSpan}
                          style={{ verticalAlign: 'middle' }}
                        >
                          {row.tanggal}
                        </td>
                      ) : null}
                      
                      {/* Nama Akun Column */}
                      <td className="py-3 px-4 text-gray-900 border-r border-gray-300">
                        {row.namaAkun}
                      </td>
                      
                      {/* Debit Column */}
                      <td className="py-3 px-4 text-right text-gray-900 border-r border-gray-300">
                        {row.debit > 0 ? `Rp ${row.debit.toLocaleString('id-ID')}` : '-'}
                      </td>
                      
                      {/* Kredit Column */}
                      <td className="py-3 px-4 text-right text-gray-900">
                        {row.kredit > 0 ? `Rp ${row.kredit.toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Data per Halaman</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Halaman 1 dari 1</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}