"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Cloud, Calendar } from "lucide-react";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

const breadcrumbItems = [
  { title: "Realisasi", link: "/dashboard/realisasi" },
  { title: "Laporan Keuangan", link: "/dashboard/realisasi" },
  { title: "Arus Kas", link: "/dashboard/realisasi/laporan-keuangan/arus-kas" }
];

export default function ArusKasPage() {
  const [activeTab, setActiveTab] = useState('data');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title="Arus Kas" />
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
            <Button size="sm">
              <Cloud className="h-4 w-4 mr-2" />
              Rekap Arus Kas
            </Button>
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
              <p className="text-gray-500">Belum ada data laporan arus kas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
