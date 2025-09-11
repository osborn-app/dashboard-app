"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Cloud, Calendar, Plus, Trash2, MoreVertical, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "/dashboard/perencanaan/detail" },
  { title: "Laporan", link: "/dashboard/perencanaan/detail" },
  { title: "Arus Kas", link: "/dashboard/perencanaan/detail" }
];

// Dummy data for template categories
const templateCategories = [
  {
    id: "1",
    name: "Arus Kas dari Aktivitas Operasi",
    accounts: [
      { id: "1", name: "Contoh" }
    ]
  }
];

// Dummy data for formulas
const formulas = [
  "Penambahan Kas = Total Aktivitas Operasi + Total Aktivitas Investasi + Total Aktivitas Pendanaan",
  "Saldo Kas Akhir = Saldo Kas Awal + Penambahan Kas"
];

// Available accounts for dropdown
const availableAccounts = [
  { id: "1", name: "KAS" },
  { id: "2", name: "BANK" },
  { id: "3", name: "Pendapatan Sewa Kendaraan" },
  { id: "4", name: "BIAYA DRIVER" },
  { id: "5", name: "Gaji Karyawan" },
  { id: "6", name: "Beban Operasional" },
  { id: "7", name: "HUTANG USAHA" },
  { id: "8", name: "MODAL SAHAM" }
];

export default function ArusKasPage() {
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('kategori');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

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
      </div>

      {/* Data Laporan Content */}
      {activeTab === 'data' && (
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
                Rekap Arus Kas
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

          {/* Cash Flow Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-800 border-r border-gray-300">
                    NAMA KATEGORI AKUN
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800">
                    RP
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold border-r border-gray-300">Arus Kas dari Aktivitas Operasi</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold border-r border-gray-300">TOTAL Aktivitas Operasi</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold"></td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold border-r border-gray-300">Arus Kas dari Aktivitas Investasi</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold border-r border-gray-300">TOTAL Aktivitas Investasi</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold"></td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold border-r border-gray-300">Arus Kas dari Aktivitas Pendanaan</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold border-r border-gray-300">TOTAL Aktivitas Pendanaan</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold"></td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold border-r border-gray-300">Penambahan Kas</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold"></td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold border-r border-gray-300">Saldo Awal</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold"></td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold border-r border-gray-300">Saldo Akhir</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold"></td>
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
            {/* Sub-tabs and Add Category Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveSubTab('kategori')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeSubTab === 'kategori' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-blue-400 border-transparent hover:text-blue-600'
                  }`}
                >
                  KATEGORI
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
              
              <Button 
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                TAMBAH KATEGORI
              </Button>
            </div>

            {/* Template Content */}
            {activeSubTab === 'kategori' && (
              <div className="space-y-6">
                {templateCategories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg">
                    {/* Category Header */}
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-blue-600">
                        {category.name}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Accounts List */}
                    <div className="p-4">
                      <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 mb-2">
                        NAMA AKUN
                      </div>
                      <div className="space-y-2">
                        {category.accounts.map((account) => (
                          <div key={account.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 border border-gray-200">
                            <div className="flex items-center">
                              <div className="w-1 h-4 mr-3 bg-blue-500"></div>
                              <span className="text-gray-900">{account.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div 
                          className="flex items-center bg-blue-50 px-4 py-3 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => setIsAddAccountModalOpen(true)}
                        >
                          <div className="w-1 h-4 mr-3 bg-blue-500"></div>
                          <Plus className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-blue-600 font-medium">TAMBAH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'rumus' && (
              <div>
                <h3 className="text-lg font-bold mb-4">RUMUS</h3>
                <div className="space-y-3">
                  {formulas.map((formula, index) => (
                    <div key={index} className="bg-gray-100 px-4 py-3 border border-gray-200 rounded">
                      <p className="text-gray-900">{formula}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Category Modal */}
      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="bg-blue-600 text-white p-6 -m-6 mb-6">
            <DialogTitle className="text-white">Tambah Kategori</DialogTitle>
            <p className="text-blue-100 text-sm mt-1">
              Isi informasi dibawah untuk menambah Kategori
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kategori
              </label>
              <Input placeholder="Masukkan nama kategori" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Akun
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
            
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Akun
            </Button>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddCategoryModalOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              onClick={() => setIsAddCategoryModalOpen(false)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Account Modal */}
      <Dialog open={isAddAccountModalOpen} onOpenChange={setIsAddAccountModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="bg-blue-600 text-white p-6 -m-6 mb-6">
            <DialogTitle className="text-white">Pengaturan Akun</DialogTitle>
            <p className="text-blue-100 text-sm mt-1">
              Isi informasi dibawah untuk mengatur akun
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Akun
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pengaturan
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="default" name="setting" className="text-blue-600" />
                    <label htmlFor="default" className="text-sm">Default</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="selalu-positif" name="setting" className="text-blue-600" />
                    <label htmlFor="selalu-positif" className="text-sm">Selalu Positif</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="dibalik" name="setting" className="text-blue-600" />
                    <label htmlFor="dibalik" className="text-sm">Dibalik</label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rumus
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="periode2-periode1" name="formula" className="text-blue-600" />
                    <label htmlFor="periode2-periode1" className="text-sm">Periode 2 - Periode 1</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="periode2" name="formula" className="text-blue-600" />
                    <label htmlFor="periode2" className="text-sm">Periode 2</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="periode1" name="formula" className="text-blue-600" />
                    <label htmlFor="periode1" className="text-sm">Periode 1</label>
                  </div>
                </div>
              </div>
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
