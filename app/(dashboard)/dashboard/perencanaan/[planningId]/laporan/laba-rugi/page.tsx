"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Search, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGetLabaRugiReport } from '@/hooks/api/usePerencanaan';
import { useToast } from '@/hooks/use-toast';

export default function LabaRugiPage() {
  const params = useParams();
  const planningId = params.planningId as string;
  const { toast } = useToast();

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('pendapatan');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

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
    <div className="p-6 space-y-6">
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
            <TabsContent value="template" className="space-y-4">
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pendapatan">Pendapatan</TabsTrigger>
                  <TabsTrigger value="beban">Beban</TabsTrigger>
                  <TabsTrigger value="rumus">Rumus</TabsTrigger>
                </TabsList>

                {/* Pendapatan Sub Tab */}
                <TabsContent value="pendapatan" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Akun Pendapatan</h3>
                    <Button onClick={() => setIsAddAccountModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Akun
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Dummy data untuk pendapatan */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Pendapatan Sewa Kendaraan</p>
                        <p className="text-sm text-gray-500">4110</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Pendapatan Sewa Produk</p>
                        <p className="text-sm text-gray-500">4120</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Beban Sub Tab */}
                <TabsContent value="beban" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Akun Beban</h3>
                    <Button onClick={() => setIsAddAccountModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Akun
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Dummy data untuk beban */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Beban Operasional Umum</p>
                        <p className="text-sm text-gray-500">5110</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Beban Transport Pihak Ketiga</p>
                        <p className="text-sm text-gray-500">5112</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Rumus Sub Tab */}
                <TabsContent value="rumus" className="space-y-4">
                  <h3 className="text-lg font-semibold">Rumus Laba Rugi</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Laba Kotor</h4>
                      <p className="text-sm text-gray-600">Total Pendapatan - Total Beban</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Laba Bersih</h4>
                      <p className="text-sm text-gray-600">Laba Kotor - Beban Operasional</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>

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
  );
}
