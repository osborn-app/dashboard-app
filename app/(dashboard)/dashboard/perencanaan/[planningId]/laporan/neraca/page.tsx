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
import { useGetNeracaReport } from '@/hooks/api/usePerencanaan';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function NeracaPage() {
  const params = useParams();
  const planningId = params.planningId as string;
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Perencanaan", link: "/dashboard/perencanaan" },
    { title: "Detail Perencanaan", link: `/dashboard/perencanaan/${planningId}` },
    { title: "Laporan Neraca", link: "#" }
  ];

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('aktiva');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  // Fetch data dari API
  const { data: neracaData, isLoading, error } = useGetNeracaReport({
    date_from: dateFrom ? dateFrom.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    date_to: dateTo ? dateTo.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  // Handle rekap
  const handleRekap = () => {
    toast({
      title: 'Rekap Neraca',
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
        <Heading title="Laporan Neraca" description="Laporan neraca perencanaan keuangan" />
      </div>
      <Separator />

      <div className="space-y-6">
        <Card>
        <CardHeader>
          <CardTitle>Neraca Perencanaan</CardTitle>
          {neracaData?.period && (
            <p className="text-sm text-gray-600 mt-1">
              Periode: {neracaData.period}
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
                      placeholder="Cari berdasarkan nama akun..."
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
                  Rekap Neraca
                </Button>
              </div>

              {/* Table Neraca */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-300" rowSpan={2}>
                        NO AKUN
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-300" rowSpan={2}>
                        NAMA AKUN
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700 border-r border-gray-300" colSpan={2}>
                        PERENCANAAN
                      </th>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-right py-2 px-4 font-medium text-gray-600 border-r border-gray-300">
                        RP
                      </th>
                      <th className="text-right py-2 px-4 font-medium text-gray-600">
                        RP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : neracaData ? (
                      <>
                        {/* AKTIVA Section - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-center" colSpan={4}>
                            AKTIVA
                          </td>
                        </tr>
                        
                        {/* AKTIVA LANCAR - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800 text-center" colSpan={4}>
                            AKTIVA LANCAR
                          </td>
                        </tr>
                        
                        {/* Data AKTIVA LANCAR (putih) */}
                        {neracaData.assets?.filter((item: any) => item.account_code?.startsWith('11')).length > 0 ? (
                          neracaData.assets.filter((item: any) => item.account_code?.startsWith('11')).map((item: any, index: number) => (
                            <tr key={`current-asset-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : ''}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                -
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-2 px-4 text-sm text-gray-500 italic border-r border-gray-300" colSpan={4}>
                              Belum ada data aktiva lancar
                            </td>
                          </tr>
                        )}
                        
                        {/* TOTAL AKTIVA LANCAR - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={3}>
                            TOTAL AKTIVA LANCAR
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                            {neracaData.assets?.filter((item: any) => item.account_code?.startsWith('11')).reduce((sum: number, item: any) => sum + (item.amount || 0), 0) > 0 ? 
                              `Rp. ${new Intl.NumberFormat('id-ID').format(neracaData.assets.filter((item: any) => item.account_code?.startsWith('11')).reduce((sum: number, item: any) => sum + (item.amount || 0), 0))}` : 
                              'Rp. 0'}
                          </td>
                        </tr>
                        
                        {/* AKTIVA TETAP - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800 text-center" colSpan={4}>
                            AKTIVA TETAP
                          </td>
                        </tr>
                        
                        {/* Data AKTIVA TETAP (putih) */}
                        {neracaData.assets?.filter((item: any) => item.account_code?.startsWith('12')).length > 0 ? (
                          neracaData.assets.filter((item: any) => item.account_code?.startsWith('12')).map((item: any, index: number) => (
                            <tr key={`fixed-asset-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : ''}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                -
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-2 px-4 text-sm text-gray-500 italic border-r border-gray-300" colSpan={4}>
                              Belum ada data aktiva tetap
                            </td>
                          </tr>
                        )}
                        
                        {/* TOTAL AKTIVA TETAP - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={3}>
                            TOTAL AKTIVA TETAP
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                            {neracaData.assets?.filter((item: any) => item.account_code?.startsWith('12')).reduce((sum: number, item: any) => sum + (item.amount || 0), 0) > 0 ? 
                              `Rp. ${new Intl.NumberFormat('id-ID').format(neracaData.assets.filter((item: any) => item.account_code?.startsWith('12')).reduce((sum: number, item: any) => sum + (item.amount || 0), 0))}` : 
                              'Rp. 0'}
                          </td>
                        </tr>
                        
                        {/* TOTAL AKTIVA - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-t-2 border-gray-400 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={3}>
                            TOTAL AKTIVA
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                            {neracaData.summary?.total_assets ? `Rp. ${new Intl.NumberFormat('id-ID').format(neracaData.summary.total_assets)}` : 'Rp. 0'}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada data neraca
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
                  <TabsTrigger value="aktiva">AKTIVA</TabsTrigger>
                  <TabsTrigger value="pasiva">PASIVA</TabsTrigger>
                </TabsList>

                {/* AKTIVA Sub Tab */}
                <TabsContent value="aktiva" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Kategori Aktiva</h3>
                    <Button onClick={() => setIsAddCategoryModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Kategori
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Aktiva Lancar */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Aktiva Lancar</h4>
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
                            <p className="text-sm font-medium">Kas & Bank</p>
                            <p className="text-xs text-gray-500">1110</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">Piutang Usaha</p>
                            <p className="text-xs text-gray-500">1120</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Aktiva Tetap */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Aktiva Tetap</h4>
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
                            <p className="text-sm font-medium">Kendaraan</p>
                            <p className="text-xs text-gray-500">1210</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* PASIVA Sub Tab */}
                <TabsContent value="pasiva" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Kategori Pasiva</h3>
                    <Button onClick={() => setIsAddCategoryModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Kategori
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Kewajiban Lancar */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Kewajiban Lancar</h4>
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
                            <p className="text-sm font-medium">Utang Usaha</p>
                            <p className="text-xs text-gray-500">2110</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">Utang Gaji</p>
                            <p className="text-xs text-gray-500">2120</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Ekuitas */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Ekuitas</h4>
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
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">Laba Ditahan</p>
                            <p className="text-xs text-gray-500">3120</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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

          {/* Modal Tambah Akun */}
          <Dialog open={isAddAccountModalOpen} onOpenChange={setIsAddAccountModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Akun</DialogTitle>
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

