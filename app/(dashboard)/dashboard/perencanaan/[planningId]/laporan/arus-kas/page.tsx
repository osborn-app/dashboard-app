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

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "/dashboard/perencanaan/detail" },
  { title: "Laporan", link: "/dashboard/perencanaan/detail" },
  { title: "Arus Kas", link: "/dashboard/perencanaan/detail" }
];

export default function ArusKasPage() {
  const [activeTab, setActiveTab] = useState('data');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title="Arus Kas Perencanaan" />
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
        <button
          onClick={() => setActiveTab('tipe')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tipe' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tipe Akun
        </button>
      </div>

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
              
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
              
              <Button size="sm">
                <Cloud className="h-4 w-4 mr-2" />
                Rekap Arus Kas Perencanaan
              </Button>
            </div>
            
            {/* Bottom Row: Date Range and Filters */}
            <div className="flex items-center gap-4">
              {/* Date Range */}
              <div className="flex items-center gap-2 flex-1">
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
              
              {/* Account Filter */}
              <Select>
                <SelectTrigger className="flex-1">
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
                <SelectTrigger className="flex-1">
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
          </div>

          {/* Report Period Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Periode Laporan 1 */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Periode Laporan 1</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-600 min-w-[100px]">Tanggal Awal</label>
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      className="w-full pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-600 min-w-[100px]">Tanggal Akhir</label>
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      className="w-full pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Periode Laporan 2 */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Periode Laporan 2</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-600 min-w-[100px]">Tanggal Awal</label>
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      className="w-full pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-600 min-w-[100px]">Tanggal Akhir</label>
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      className="w-full pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State Illustration */}
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 opacity-20">
                <div className="w-full h-full bg-blue-200 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-lg"></div>
                </div>
              </div>
              <p className="text-gray-500">Belum ada data laporan arus kas perencanaan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
