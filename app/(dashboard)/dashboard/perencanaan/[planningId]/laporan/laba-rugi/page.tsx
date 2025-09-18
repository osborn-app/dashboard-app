"use client";

import { useState, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Search, Plus, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGetLabaRugiReport } from '@/hooks/api/usePerencanaan';
import { useToast } from '@/hooks/use-toast';

export default function LabaRugiPage() {
  const params = useParams();
  const planningId = params.planningId as string;
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Perencanaan", link: "/dashboard/perencanaan" },
    { title: "Detail Perencanaan", link: `/dashboard/perencanaan/${planningId}` },
    { title: "Laporan Laba Rugi", link: "#" }
  ];

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('pendapatan');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  // State untuk template accounts - akan diisi dari API
  const [pendapatanAccounts, setPendapatanAccounts] = useState<Array<{id: string, name: string, code: string}>>([]);
  const [bebanAccounts, setBebanAccounts] = useState<Array<{id: string, name: string, code: string}>>([]);

  // TODO: Implementasi endpoint untuk mengambil template accounts
  // Endpoint yang diperlukan:
  // 1. GET /api/planning/{planningId}/template-accounts/pendapatan - untuk mengambil akun pendapatan
  // 2. GET /api/planning/{planningId}/template-accounts/beban - untuk mengambil akun beban
  // 3. POST /api/planning/{planningId}/template-accounts - untuk menambah akun baru
  // 4. DELETE /api/planning/{planningId}/template-accounts/{accountId} - untuk menghapus akun
  
  // useEffect(() => {
  //   // Fetch pendapatan accounts
  //   // fetchPendapatanAccounts();
  //   // Fetch beban accounts  
  //   // fetchBebanAccounts();
  // }, [planningId]);

  // Fetch data dari API
  const { data: labaRugiData, isLoading, error } = useGetLabaRugiReport({
    date_from: dateFrom ? dateFrom.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    date_to: dateTo ? dateTo.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  // Handle rekap
  const handleRekap = () => {
    toast({
      title: 'Rekap Laba Rugi',
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
        <Heading title="Laporan Laba Rugi" description="Laporan laba rugi perencanaan keuangan" />
      </div>
      <Separator />

      {/* Main Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="data">Data Laporan</TabsTrigger>
          <TabsTrigger value="template">Template Laporan</TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          <Card>
          <CardHeader>
            <CardTitle>Laba Rugi Perencanaan</CardTitle>
            {labaRugiData?.period && (
              <p className="text-sm text-gray-600 mt-1">
                Periode: {labaRugiData.period}
              </p>
            )}
          </CardHeader>
          <CardContent>

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
                  Rekap Laba Rugi
                </Button>
              </div>

              {/* Table Laba Rugi */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-300" rowSpan={2}>
                        No Akun
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-300" rowSpan={2}>
                        Nama Akun
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700 border-r border-gray-300" colSpan={2}>
                        Rencana
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
                    ) : labaRugiData ? (
                      <>
                        {/* PENDAPATAN Section - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-center" colSpan={4}>
                            PENDAPATAN
                          </td>
                        </tr>
                        
                        {/* Data PENDAPATAN (putih) */}
                        {labaRugiData.data?.filter((item: any) => item.account_code?.startsWith('4')).length > 0 ? (
                          labaRugiData.data.filter((item: any) => item.account_code?.startsWith('4')).map((item: any, index: number) => (
                            <tr key={`income-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
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
                              Belum ada data pendapatan
                            </td>
                          </tr>
                        )}
                        
                        {/* TOTAL PENDAPATAN - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-center border-r border-gray-300" colSpan={3}>
                            TOTAL PENDAPATAN
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                            {labaRugiData.summary?.total_income ? `Rp. ${new Intl.NumberFormat('id-ID').format(labaRugiData.summary.total_income)}` : ''}
                          </td>
                        </tr>
                        
                        {/* RUGI Section - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-center" colSpan={4}>
                            RUGI
                          </td>
                        </tr>
                        
                        {/* Data BEBAN (putih) */}
                        {labaRugiData.data?.filter((item: any) => item.account_code?.startsWith('5')).length > 0 ? (
                          labaRugiData.data.filter((item: any) => item.account_code?.startsWith('5')).map((item: any, index: number) => (
                            <tr key={`expense-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
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
                              Belum ada data beban
                            </td>
                          </tr>
                        )}
                        
                        {/* TOTAL BEBAN - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-center border-r border-gray-300" colSpan={3}>
                            TOTAL BEBAN
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                            {labaRugiData.summary?.total_expense ? `Rp. ${new Intl.NumberFormat('id-ID').format(labaRugiData.summary.total_expense)}` : ''}
                          </td>
                        </tr>
                        
                        {/* LABA BERSIH - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-t-2 border-gray-400 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-bold text-gray-900 text-center border-r border-gray-300" colSpan={3}>
                            LABA BERSIH
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right">
                            {labaRugiData.summary?.net_income ? `Rp. ${new Intl.NumberFormat('id-ID').format(labaRugiData.summary.net_income)}` : ''}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada data laba rugi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Template Laporan Tab */}
            <TabsContent value="template" className="space-y-6">
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                {/* Custom Tab Navigation - Clean Design */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                  <button
                    onClick={() => setActiveSubTab('pendapatan')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeSubTab === 'pendapatan'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    PENDAPATAN
                  </button>
                  <button
                    onClick={() => setActiveSubTab('beban')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeSubTab === 'beban'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    BEBAN
                  </button>
                  <button
                    onClick={() => setActiveSubTab('rumus')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeSubTab === 'rumus'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    RUMUS
                  </button>
                </div>

                {/* Pendapatan Sub Tab */}
                <TabsContent value="pendapatan" className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900">PENDAPATAN</h2>
                  
                  {/* Header NAMA AKUN */}
                  <div className="bg-gray-100 p-2">
                    <p className="font-bold text-gray-900">NAMA AKUN</p>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Account Items - akan diisi dari API */}
                    {pendapatanAccounts.length > 0 ? (
                      pendapatanAccounts.map((account, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm text-gray-500">-</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500">Belum ada akun pendapatan</p>
                      </div>
                    )}

                    {/* Add Button */}
                    <div 
                      onClick={() => setIsAddAccountModalOpen(true)}
                      className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                      <div className="text-blue-500 font-medium text-sm">TAMBAH</div>
                    </div>
                  </div>
                </TabsContent>

                {/* Beban Sub Tab */}
                <TabsContent value="beban" className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900">BEBAN</h2>
                  
                  {/* Header NAMA AKUN */}
                  <div className="bg-gray-100 p-2">
                    <p className="font-bold text-gray-900">NAMA AKUN</p>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Account Items - akan diisi dari API */}
                    {bebanAccounts.length > 0 ? (
                      bebanAccounts.map((account, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm text-gray-500">-</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500">Belum ada akun beban</p>
                      </div>
                    )}

                    {/* Add Button */}
                    <div 
                      onClick={() => setIsAddAccountModalOpen(true)}
                      className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                      <div className="text-blue-500 font-medium text-sm">+ TAMBAH</div>
                    </div>
                  </div>
                </TabsContent>

                {/* Rumus Sub Tab */}
                <TabsContent value="rumus" className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900">RUMUS</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-bold text-gray-900">
                      KUMULATIF LABA RUGI = Subtotal Pendapatan - Subtotal Beban
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

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
      </Tabs>
    </div>
  );
}
