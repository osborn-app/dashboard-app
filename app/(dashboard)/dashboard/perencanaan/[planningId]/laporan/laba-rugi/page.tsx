"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Cloud, Calendar, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "/dashboard/perencanaan/detail" },
  { title: "Laporan", link: "/dashboard/perencanaan/detail" },
  { title: "Laba Rugi", link: "/dashboard/perencanaan/detail" }
];

// Dummy data for template accounts
const templateAccounts = {
  pendapatan: [
    { id: "1", name: "KAS" },
    { id: "2", name: "Pendapatan Sewa Kendaraan" },
    { id: "3", name: "Charge Weekend" }
  ],
  beban: [
    { id: "4", name: "BIAYA DRIVER" },
    { id: "5", name: "Gaji Karyawan" },
    { id: "6", name: "Beban Operasional" }
  ]
};

// Available accounts for dropdown
const availableAccounts = [
  { id: "1", name: "KAS" },
  { id: "2", name: "BANK" },
  { id: "3", name: "Pendapatan Sewa Kendaraan" },
  { id: "4", name: "Charge Weekend" },
  { id: "5", name: "BIAYA DRIVER" },
  { id: "6", name: "Gaji Karyawan" },
  { id: "7", name: "Beban Operasional" },
  { id: "8", name: "Beban Administrasi" }
];

export default function LabaRugiPage() {
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('pendapatan');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title="Laba Rugi Perencanaan" />
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

      {/* Data Laporan Content */}
      {activeTab === 'data' && (
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
              
              <Button size="sm">
                <Cloud className="h-4 w-4 mr-2" />
                Rekap Laba Rugi Perencanaan
              </Button>
            </div>

          {/* Data Table Structure */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="text-center py-3 px-4 font-semibold text-gray-800 border-r border-gray-300" rowSpan={2}>
                    NO AKUN
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800 border-r border-gray-300" rowSpan={2}>
                    NAMA AKUN
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800 border-r border-gray-300" colSpan={2}>
                    PERENCANAAN
                  </th>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="text-center py-3 px-4 font-semibold text-gray-800 border-r border-gray-300">RP</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800">RP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center"></td>
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center">PENDAPATAN</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300"></td>
                  <td className="py-3 px-4 text-gray-900 font-medium border-r border-gray-300">PENDAPATAN OPERASIONAL</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">25.000.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">0</td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300"></td>
                  <td className="py-3 px-4 text-gray-900 font-medium border-r border-gray-300">KUMULATIF LABA (RUGI)</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">20.000.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">0</td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300"></td>
                  <td className="py-3 px-4 text-gray-900 font-medium border-r border-gray-300">BEBAN OPERASIONAL</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">0</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">5.000.000.000</td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center"></td>
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center">RUGI</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">5117</td>
                  <td className="py-3 px-4 text-gray-900 font-medium border-r border-gray-300">Beban Operasional Driver</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">20.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">5210</td>
                  <td className="py-3 px-4 text-gray-900 font-medium border-r border-gray-300">Gaji Karyawan</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">60.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center"></td>
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center">SUB TOTAL RUGI</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300"></td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold">80.000.000</td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center"></td>
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center">KUMULATIF LABA RUGI</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300"></td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold">340.000.000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Template Laporan Content */}
      {activeTab === 'template' && (
        <Card>
          <CardContent className="p-6">
            {/* Sub-tabs for Template */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveSubTab('pendapatan')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeSubTab === 'pendapatan' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-blue-400 border-transparent hover:text-blue-600'
                }`}
              >
                PENDAPATAN
              </button>
              <button
                onClick={() => setActiveSubTab('beban')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeSubTab === 'beban' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-blue-400 border-transparent hover:text-blue-600'
                }`}
              >
                BEBAN
              </button>
              <button
                onClick={() => setActiveSubTab('rumus')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeSubTab === 'rumus' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-blue-400 border-transparent hover:text-blue-600'
                }`}
              >
                RUMUS
              </button>
            </div>

            {/* Template Content */}
            {activeSubTab === 'pendapatan' && (
              <div>
                <h3 className="text-lg font-bold mb-4">PENDAPATAN</h3>
                <div className="space-y-2">
                  <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    NAMA AKUN
                  </div>
                  {templateAccounts.pendapatan.map((account) => (
                    <div key={account.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 border border-gray-200">
                      <span className="text-gray-900">{account.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center bg-blue-50 px-4 py-3 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="w-4 h-4 border-l-2 border-blue-600 mr-3"></div>
                    <Plus className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-blue-600 font-medium" onClick={() => setIsAddAccountModalOpen(true)}>
                      TAMBAH
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'beban' && (
              <div>
                <h3 className="text-lg font-bold mb-4">BEBAN</h3>
                <div className="space-y-2">
                  <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    NAMA AKUN
                  </div>
                  {templateAccounts.beban.map((account) => (
                    <div key={account.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 border border-gray-200">
                      <span className="text-gray-900">{account.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center bg-blue-50 px-4 py-3 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="w-4 h-4 border-l-2 border-blue-600 mr-3"></div>
                    <Plus className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-blue-600 font-medium" onClick={() => setIsAddAccountModalOpen(true)}>
                      TAMBAH
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'rumus' && (
              <div>
                <h3 className="text-lg font-bold mb-4">RUMUS</h3>
                <div className="bg-gray-100 px-4 py-3 border border-gray-200">
                  <p className="text-gray-900">
                    KUMULATIF LABA RUGI = Subtotal Pendapatan - Subtotal Beban
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Account Modal */}
      <Dialog open={isAddAccountModalOpen} onOpenChange={setIsAddAccountModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="bg-blue-600 text-white p-6 -m-6 mb-6">
            <DialogTitle className="text-white">Tambah Akun</DialogTitle>
            <p className="text-blue-100 text-sm mt-1">
              Pilih akun untuk menambahkannya pada kategori
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Akun
              </label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih akun" />
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddAccountModalOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              onClick={() => setIsAddAccountModalOpen(false)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}