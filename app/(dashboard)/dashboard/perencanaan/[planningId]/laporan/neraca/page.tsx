"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Cloud } from "lucide-react";
import { Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "/dashboard/perencanaan/detail" },
  { title: "Laporan", link: "/dashboard/perencanaan/detail" },
  { title: "Neraca", link: "/dashboard/perencanaan/detail" }
];

export default function NeracaPage() {
  const [activeTab, setActiveTab] = useState('data');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title="Neraca Perencanaan" />
      </div>
      <Separator />

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'data' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Data Laporan
        </button>
        <button
          onClick={() => setActiveTab('template')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'template' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Template Laporan
        </button>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          {/* Search and Action Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari Akun"
                className="pl-10"
              />
            </div>
            
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Cari
            </Button>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            
            <Button size="sm">
              <Cloud className="h-4 w-4 mr-2" />
              Rekap Neraca Perencanaan
            </Button>
            
            {/* Date Range */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="date"
                  placeholder="Tanggal Mulai"
                  className="pr-10 w-40"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              
              <div className="relative">
                <Input
                  type="date"
                  placeholder="Tanggal Selesai"
                  className="pr-10 w-40"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
            
            {/* Account Filter */}
            <Select>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Semua Akun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Akun</SelectItem>
                <SelectItem value="kas">Kas & Bank</SelectItem>
                <SelectItem value="inventaris">Inventaris</SelectItem>
                <SelectItem value="kendaraan">Kendaraan</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Status Filter */}
            <Select>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="belum">Belum Terealisasi</SelectItem>
                <SelectItem value="sudah">Sudah Terealisasi</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Balance Sheet Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">No Akun</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Akun</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700" colSpan={2}>
                    Perencanaan
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700" colSpan={2}>
                    Realisasi
                  </th>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2 px-4 font-medium text-gray-600"></th>
                  <th className="text-left py-2 px-4 font-medium text-gray-600"></th>
                  <th className="text-center py-2 px-4 font-medium text-gray-600">(Rp)</th>
                  <th className="text-center py-2 px-4 font-medium text-gray-600">(Rp)</th>
                  <th className="text-center py-2 px-4 font-medium text-gray-600">(Rp)</th>
                  <th className="text-center py-2 px-4 font-medium text-gray-600">(Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <td className="py-3 px-4 text-gray-900 font-bold">AKTIVA</td>
                  <td className="py-3 px-4 text-gray-900 font-bold"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <td className="py-3 px-4 text-gray-900 font-bold"></td>
                  <td className="py-3 px-4 text-gray-900 font-bold">AKTIVA LANCAR</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">11100</td>
                  <td className="py-3 px-4 text-gray-900">KAS & BANK</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">20.300.000</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">11200</td>
                  <td className="py-3 px-4 text-gray-900">PIUTANG</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <td className="py-3 px-4 text-gray-900 font-bold"></td>
                  <td className="py-3 px-4 text-gray-900 font-bold">TOTAL AKTIVA LANCAR</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900 font-bold">20.300.000</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900 font-bold">0</td>
                </tr>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <td className="py-3 px-4 text-gray-900 font-bold"></td>
                  <td className="py-3 px-4 text-gray-900 font-bold">AKTIVA TETAP</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">12000</td>
                  <td className="py-3 px-4 text-gray-900">KENDARAAN</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">5.000.000.000</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">41000</td>
                  <td className="py-3 px-4 text-gray-900">INVENTARIS</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">300.000</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <td className="py-3 px-4 text-gray-900 font-bold"></td>
                  <td className="py-3 px-4 text-gray-900 font-bold">TOTAL AKTIVA TETAP</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900 font-bold">5.000.300.000</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900 font-bold">0</td>
                </tr>
                <tr className="border-b border-gray-200 bg-green-50">
                  <td className="py-3 px-4 text-gray-900 font-bold">PASIVA</td>
                  <td className="py-3 px-4 text-gray-900 font-bold"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">31000</td>
                  <td className="py-3 px-4 text-gray-900">MODAL SAHAM</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">15.000.000.000</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900"></td>
                  <td className="py-3 px-4 text-gray-900">KUMULATIF LABA (RUGI)</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">5.020.300.000</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}