"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Search, Plus, Trash2, MoreVertical, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGetArusKasReport } from '@/hooks/api/usePerencanaan';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function ArusKasPage() {
  const params = useParams();
  const planningId = params.planningId as string;
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Perencanaan", link: "/dashboard/perencanaan" },
    { title: "Detail Perencanaan", link: `/dashboard/perencanaan/${planningId}` },
    { title: "Laporan Arus Kas", link: "#" }
  ];

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('kategori');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  // Fetch data dari API
  const { data: arusKasData, isLoading, error } = useGetArusKasReport({
    date_from: dateFrom ? dateFrom.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    date_to: dateTo ? dateTo.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  // Handle rekap
  const handleRekap = () => {
    toast({
      title: 'Rekap Arus Kas',
      description: 'Fitur rekap akan segera tersedia',
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading data: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title="Laporan Arus Kas" description="Laporan arus kas perencanaan keuangan" />
      </div>
      <Separator />

      <div className="space-y-6">
        <Card>
        <CardHeader>
          <CardTitle>Arus Kas Perencanaan</CardTitle>
          {arusKasData?.period && (
            <p className="text-sm text-gray-600 mt-1">
              Periode: {arusKasData.period}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="data">Data Laporan</TabsTrigger>
              <TabsTrigger value="template">Template Laporan</TabsTrigger>
            </TabsList>

            {/* Data Laporan Tab */}
            <TabsContent value="data" className="space-y-4">
              {/* Search dan Filter Section */}
              <div className="flex flex-wrap gap-4 mb-6">
                {/* Search Input */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cari berdasarkan nama kategori..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Date From */}
                <div className="min-w-[200px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: id }) : "Dari Tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div className="min-w-[200px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: id }) : "Sampai Tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Rekap Button */}
                <Button onClick={handleRekap} className="min-w-[200px]">
                  Rekap Arus Kas
                </Button>
              </div>

              {/* Table Arus Kas */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-r border-gray-300">
                        Nama Kategori Akun
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        RP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr className="bg-gray-100">
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : arusKasData ? (
                      <>
                        {/* Operating Activities */}
                        {arusKasData.operating_activities?.length > 0 ? (
                          arusKasData.operating_activities.map((item: any, index: number) => (
                            <tr key={`operating-${index}`} className="bg-gray-100 border-b border-gray-200">
                              <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || 'Arus Kas dari Aktivitas Operasi'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="px-4 py-3 text-sm text-gray-500 italic border-r border-gray-300" colSpan={2}>
                              Belum ada data aktivitas operasi
                            </td>
                          </tr>
                        )}

                        {/* TOTAL Aktivitas Operasi */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-gray-300">
                            TOTAL Aktivitas Operasi
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {arusKasData.summary?.net_operating_cashflow ? `Rp. ${new Intl.NumberFormat('id-ID').format(arusKasData.summary.net_operating_cashflow)}` : '-'}
                          </td>
                        </tr>

                        {/* Investing Activities */}
                        {arusKasData.investing_activities?.length > 0 ? (
                          arusKasData.investing_activities.map((item: any, index: number) => (
                            <tr key={`investing-${index}`} className="bg-gray-100 border-b border-gray-200">
                              <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || 'Arus Kas dari Aktivitas Investasi'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="px-4 py-3 text-sm text-gray-500 italic border-r border-gray-300" colSpan={2}>
                              Belum ada data aktivitas investasi
                            </td>
                          </tr>
                        )}

                        {/* TOTAL Aktivitas Investasi */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-gray-300">
                            TOTAL Aktivitas Investasi
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {arusKasData.summary?.net_investing_cashflow ? `Rp. ${new Intl.NumberFormat('id-ID').format(arusKasData.summary.net_investing_cashflow)}` : '-'}
                          </td>
                        </tr>

                        {/* Financing Activities */}
                        {arusKasData.financing_activities?.length > 0 ? (
                          arusKasData.financing_activities.map((item: any, index: number) => (
                            <tr key={`financing-${index}`} className="bg-gray-100 border-b border-gray-200">
                              <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || 'Arus Kas dari Aktivitas Pendanaan'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="px-4 py-3 text-sm text-gray-500 italic border-r border-gray-300" colSpan={2}>
                              Belum ada data aktivitas pendanaan
                            </td>
                          </tr>
                        )}

                        {/* TOTAL Aktivitas Pendanaan */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-gray-300">
                            TOTAL Aktivitas Pendanaan
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {arusKasData.summary?.net_financing_cashflow ? `Rp. ${new Intl.NumberFormat('id-ID').format(arusKasData.summary.net_financing_cashflow)}` : '-'}
                          </td>
                        </tr>

                        {/* Penambahan Kas */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                            Penambahan Kas
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            {arusKasData.summary?.net_cashflow ? `Rp. ${new Intl.NumberFormat('id-ID').format(arusKasData.summary.net_cashflow)}` : '-'}
                          </td>
                        </tr>

                        {/* Saldo Awal */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                            Saldo Awal
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            -
                          </td>
                        </tr>

                        {/* Saldo Akhir */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                            Saldo Akhir
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            -
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr className="bg-gray-100">
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada data arus kas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Template Laporan Tab */}
            <TabsContent value="template" className="space-y-4">
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="kategori">Kategori</TabsTrigger>
                  <TabsTrigger value="rumus">Rumus</TabsTrigger>
                </TabsList>

                {/* Kategori Sub Tab */}
                <TabsContent value="kategori" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Kategori Arus Kas</h3>
                    <Button onClick={() => setIsAddCategoryModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Kategori
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Arus Kas dari Aktivitas Operasi */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Arus Kas dari Aktivitas Operasi</h4>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => setIsAddAccountModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
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
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">Pendapatan Operasi</p>
                            <p className="text-xs text-gray-500">4110</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">Beban Operasi</p>
                            <p className="text-xs text-gray-500">5110</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Arus Kas dari Aktivitas Investasi */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Arus Kas dari Aktivitas Investasi</h4>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => setIsAddAccountModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
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
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">Pembelian Aset</p>
                            <p className="text-xs text-gray-500">1210</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Arus Kas dari Aktivitas Pendanaan */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Arus Kas dari Aktivitas Pendanaan</h4>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => setIsAddAccountModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
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
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">Modal Pemilik</p>
                            <p className="text-xs text-gray-500">3110</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Rumus Sub Tab */}
                <TabsContent value="rumus" className="space-y-4">
                  <h3 className="text-lg font-semibold">Rumus Arus Kas</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Arus Kas Bersih</h4>
                      <p className="text-sm text-gray-600">Arus Kas Operasi + Arus Kas Investasi + Arus Kas Pendanaan</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Arus Kas Operasi</h4>
                      <p className="text-sm text-gray-600">Pendapatan Operasi - Beban Operasi</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Arus Kas Investasi</h4>
                      <p className="text-sm text-gray-600">Pembelian Aset - Penjualan Aset</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Arus Kas Pendanaan</h4>
                      <p className="text-sm text-gray-600">Modal Masuk - Modal Keluar</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>

          {/* Modal Tambah Kategori */}
          <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kategori</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Kategori</label>
                  <Input placeholder="Masukkan nama kategori" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kode Kategori</label>
                  <Input placeholder="Masukkan kode kategori" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddCategoryModalOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={() => setIsAddCategoryModalOpen(false)}>
                    Simpan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal Pengaturan Akun */}
          <Dialog open={isAddAccountModalOpen} onOpenChange={setIsAddAccountModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pengaturan Akun</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Akun</label>
                  <Input placeholder="Masukkan nama akun" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kode Akun</label>
                  <Input placeholder="Masukkan kode akun" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Formula</label>
                  <Input placeholder="Masukkan formula" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddAccountModalOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={() => setIsAddAccountModalOpen(false)}>
                    Simpan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
