"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Cloud } from "lucide-react";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

const breadcrumbItems = [
  { title: "Realisasi", link: "/dashboard/realisasi" },
  { title: "Laporan Keuangan", link: "/dashboard/realisasi" },
  { title: "Neraca", link: "/dashboard/realisasi/laporan-keuangan/neraca" }
];

export default function NeracaPage() {
  const [activeTab, setActiveTab] = useState('data');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title="Neraca" />
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
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Cari Akun"
                className="w-full"
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
              Rekap Neraca
            </Button>
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
                  <td className="py-3 px-4 text-gray-900">11110</td>
                  <td className="py-3 px-4 text-gray-900">KAS</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">2.222.222</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">89.704.834.455</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">11200</td>
                  <td className="py-3 px-4 text-gray-900">PIUTANG</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">15.747.103.561</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">12400</td>
                  <td className="py-3 px-4 text-gray-900">SARANA DAN PELENGKAP</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900">0</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <td className="py-3 px-4 text-gray-900 font-bold"></td>
                  <td className="py-3 px-4 text-gray-900 font-bold">TOTAL AKTIVA LANCAR</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900 font-bold">2.222.222</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900 font-bold">105.451.938.016</td>
                </tr>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <td className="py-3 px-4 text-gray-900 font-bold"></td>
                  <td className="py-3 px-4 text-gray-900 font-bold">AKTIVA TETAP</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
