"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Cloud, Plus, Trash2, MoreVertical, Edit } from "lucide-react";
import { Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "#" },
  { title: "Neraca", link: "#" }
];

// Dummy data for template categories
const templateCategories = {
  aktiva: [
    {
      id: "1",
      name: "AKTIVA LANCAR",
      color: "green",
      accounts: [
        { id: "1", name: "KAS" }
      ]
    },
    {
      id: "2", 
      name: "AKTIVA TETAP",
      color: "green",
      accounts: [
        { id: "2", name: "KENDARAAN" }
      ]
    }
  ],
  pasiva: [
    {
      id: "3",
      name: "PASIVA",
      color: "red",
      accounts: [
        { id: "3", name: "-" }
      ]
    },
    {
      id: "4",
      name: "PASIVA", 
      color: "red",
      accounts: [
        { id: "4", name: "-" }
      ]
    }
  ]
};

// Available accounts for dropdown
const availableAccounts = [
  { id: "1", name: "KAS" },
  { id: "2", name: "BANK" },
  { id: "3", name: "KENDARAAN" },
  { id: "4", name: "GEDUNG" },
  { id: "5", name: "INVENTARIS" },
  { id: "6", name: "HUTANG USAHA" },
  { id: "7", name: "MODAL SAHAM" },
  { id: "8", name: "LABA DITAHAN" }
];

export default function NeracaPage() {
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('aktiva');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

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
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              <Button size="sm">
                <Cloud className="h-4 w-4 mr-2" />
                Rekap Transaksi
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

          {/* Balance Sheet Table */}
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
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center">AKTIVA</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center"></td>
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center">AKTIVA LANCAR</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">11100</td>
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">Kas</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">Rp. 50.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp. 50.000.000</td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">11200</td>
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">Bank</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">Rp. 200.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp. 200.000.000</td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">11300</td>
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">Piutang Usaha</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">Rp. 150.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp. 150.000.000</td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center"></td>
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center">TOTAL AKTIVA LANCAR</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold">Rp. 400.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold">Rp. 400.000.000</td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center"></td>
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center">AKTIVA TETAP</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                  <td className="py-3 px-4 text-center font-mono text-gray-900"></td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">12100</td>
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">Kendaraan</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">Rp. 500.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp. 500.000.000</td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">12200</td>
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">Gedung</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">Rp. 1.000.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp. 1.000.000.000</td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">12300</td>
                  <td className="py-3 px-4 text-gray-900 border-r border-gray-300">Inventaris</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 border-r border-gray-300">Rp. 100.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">Rp. 100.000.000</td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center"></td>
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center">TOTAL AKTIVA TETAP</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold">Rp. 1.600.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold">Rp. 1.600.000.000</td>
                </tr>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center"></td>
                  <td className="py-3 px-4 text-gray-900 font-semibold text-center">TOTAL AKTIVA</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold">Rp. 2.000.000.000</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold">Rp. 2.000.000.000</td>
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
                  onClick={() => setActiveSubTab('aktiva')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeSubTab === 'aktiva' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-blue-400 border-transparent hover:text-blue-600'
                  }`}
                >
                  AKTIVA
                </button>
                <button
                  onClick={() => setActiveSubTab('pasiva')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeSubTab === 'pasiva' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-blue-400 border-transparent hover:text-blue-600'
                  }`}
                >
                  PASIVA
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
            {activeSubTab === 'aktiva' && (
              <div className="space-y-6">
                {templateCategories.aktiva.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg">
                    {/* Category Header */}
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className={`text-lg font-bold ${
                        category.color === 'green' ? 'text-green-600' : 'text-red-600'
                      }`}>
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
                              <div className={`w-1 h-4 mr-3 ${
                                category.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
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
                          <div className={`w-1 h-4 mr-3 ${
                            category.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <Plus className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-blue-600 font-medium">TAMBAH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'pasiva' && (
              <div className="space-y-6">
                {templateCategories.pasiva.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg">
                    {/* Category Header */}
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className={`text-lg font-bold ${
                        category.color === 'green' ? 'text-green-600' : 'text-red-600'
                      }`}>
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
                              <div className={`w-1 h-4 mr-3 ${
                                category.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
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
                          <div className={`w-1 h-4 mr-3 ${
                            category.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <Plus className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-blue-600 font-medium">TAMBAH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
              Isi informasi dibawah untuk membuat kategori
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
                Nama Kategori
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md">
                  <input type="radio" id="lainnya" name="category" className="text-blue-600" />
                  <label htmlFor="lainnya" className="text-sm">Lainnya</label>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md">
                  <input type="radio" id="beban" name="category" className="text-blue-600" />
                  <label htmlFor="beban" className="text-sm">Beban</label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warna
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['gray', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange', 'teal'].map((color) => (
                  <div key={color} className={`w-8 h-8 rounded border-2 border-gray-300 bg-${color}-500 cursor-pointer hover:scale-110 transition-transform`}></div>
                ))}
              </div>
            </div>
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