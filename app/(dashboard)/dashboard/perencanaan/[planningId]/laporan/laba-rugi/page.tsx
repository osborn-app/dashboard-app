"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Search, Plus, Trash2, Edit, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGetLabaRugiReport, useGetPlanningCategoriesSelect, useGetPlanningCategoryAccounts, useGetDetailPerencanaan, useCategoriesRemoveAccount } from '@/hooks/api/usePerencanaan';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { AccountForm } from '@/app/(dashboard)/dashboard/perencanaan/components/account-form';
import { LabaRugiCategoryAccounts } from '@/app/(dashboard)/dashboard/perencanaan/components/display-components';

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
  
  // State untuk mengontrol month yang ditampilkan di kalender
  const [calendarFromMonth, setCalendarFromMonth] = useState<Date>(new Date());
  const [calendarToMonth, setCalendarToMonth] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('pendapatan');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Sinkronisasi calendar month dengan tanggal yang dipilih
  useEffect(() => {
    if (dateFrom) {
      setCalendarFromMonth(dateFrom);
    }
  }, [dateFrom]);

  useEffect(() => {
    if (dateTo) {
      setCalendarToMonth(dateTo);
    }
  }, [dateTo]);
  
  // State untuk export
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  // Get planning categories untuk laba rugi (PENDAPATAN dan BEBAN)
  const { data: categoriesData, refetch: refetchCategories } = useGetPlanningCategoriesSelect();
  
  // Hook untuk delete account dari category
  const { mutateAsync: removeAccount } = useCategoriesRemoveAccount();
  
  // Hook untuk fetch planning detail (untuk filename)
  const { data: planningDetail } = useGetDetailPerencanaan(planningId);
  
  // Filter categories berdasarkan type - memoized for performance
  const pendapatanCategories = useMemo(() => 
    categoriesData?.filter((cat: any) => cat.type === 'PENDAPATAN') || [], 
    [categoriesData]
  );
  
  const bebanCategories = useMemo(() => 
    categoriesData?.filter((cat: any) => cat.type === 'BEBAN') || [], 
    [categoriesData]
  );

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
  const { data: labaRugiData, isLoading, error } = useGetLabaRugiReport(planningId, {
    date_from: dateFrom ? dateFrom.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    date_to: dateTo ? dateTo.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    template_id: '1', // Default template ID
  });

  // Helper function untuk generate filename
  const generateFilename = (format: 'csv' | 'xlsx') => {
    const planningName = (planningDetail as any)?.data?.data?.name || 'Laba Rugi';
    const sanitizedName = planningName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    return `${sanitizedName}_${date}.${format}`;
  };

  // Handle export CSV
  const handleExportLabaRugiCSV = async () => {
    if (!labaRugiData?.data || labaRugiData.data.length === 0) {
      toast({
        title: 'Tidak Ada Data',
        description: 'Tidak ada data laba rugi untuk diekspor',
        variant: 'destructive',
      });
      return;
    }

    setIsExportingCSV(true);
    try {
      const exportData = labaRugiData.data.map((item: any, index: number) => ({
        No: index + 1,
        'Kode Akun': item.account_code || '',
        'Nama Akun': item.account_name || '',
        'Debit': item.debit_balance || 0,
        'Kredit': item.credit_balance || 0,
        'Saldo': item.running_balance || 0,
        'Tipe': item.type || '',
      }));

      const headers = ['No', 'Kode Akun', 'Nama Akun', 'Debit', 'Kredit', 'Saldo', 'Tipe'] as const;
      const csvContent = [
        headers.join(','),
        ...exportData.map((row: Record<string, any>) => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', generateFilename('csv'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Data laba rugi berhasil diekspor ke CSV',
      });
    } catch (error) {
      console.error('Export CSV error:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengekspor data ke CSV',
        variant: 'destructive',
      });
    } finally {
      setIsExportingCSV(false);
    }
  };

  // Handle export XLSX
  const handleRekap = async () => {
    if (!labaRugiData?.data || labaRugiData.data.length === 0) {
      toast({
        title: 'Tidak Ada Data',
        description: 'Tidak ada data laba rugi untuk diekspor',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const exportData = labaRugiData.data.map((item: any, index: number) => ({
        No: index + 1,
        'Kode Akun': item.account_code || '',
        'Nama Akun': item.account_name || '',
        'Debit': item.debit_balance || 0,
        'Kredit': item.credit_balance || 0,
        'Saldo': item.running_balance || 0,
        'Tipe': item.type || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laba Rugi');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', generateFilename('xlsx'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Data laba rugi berhasil diekspor ke XLSX',
      });
    } catch (error) {
      console.error('Export XLSX error:', error);
    toast({
        title: 'Error',
        description: 'Gagal mengekspor data ke XLSX',
        variant: 'destructive',
    });
    } finally {
      setIsExporting(false);
    }
  };

  // Handler untuk tambah akun
  const handleAddAccount = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsAddAccountModalOpen(true);
  };

  // Handler untuk edit akun
  const handleEditAccount = (accountId: string) => {
    toast({
      title: 'Edit Account',
      description: `Edit account dengan ID: ${accountId}`,
    });
  };

  // Handler untuk delete akun
  const handleDeleteAccount = async (accountId: string) => {
    try {
      const accountIdNumber = parseInt(accountId);
      if (isNaN(accountIdNumber)) {
        throw new Error('Invalid account ID');
      }
      
      await removeAccount({ account_ids: [accountIdNumber] });
      toast({
        title: 'Success',
        description: 'Akun berhasil dihapus dari kategori',
      });
      // Refresh data
      refetchCategories();
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus akun dari kategori',
        variant: 'destructive',
      });
    }
  };

  // Handler untuk data change
  const handleDataChange = () => {
    refetchCategories();
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
              {/* Search dan Filter Section - Responsive */}
              <div className="space-y-4 mb-6">
                {/* Top Row: Search and Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cari berdasarkan nama akun..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Action Buttons - Responsive Grid */}
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleExportLabaRugiCSV}
                      disabled={isExportingCSV}
                      className="flex-1 sm:flex-none"
                    >
                      {isExportingCSV ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          <span className="hidden sm:inline">Mengekspor...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Unduh CSV</span>
                          <span className="sm:hidden">CSV</span>
                        </>
                      )}
                    </Button>

                    <Button 
                      size="sm"
                      onClick={handleRekap}
                      disabled={isExporting}
                      className="flex-1 sm:flex-none"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span className="hidden sm:inline">Mengekspor...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Unduh XLSX</span>
                          <span className="sm:hidden">XLSX</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Bottom Row: Date Range Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date From */}
                  <div className="flex-1">
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
                      <div className="p-3 border-b">
                        <div className="flex gap-2 items-center">
                          <Select
                            value={calendarFromMonth.getFullYear().toString()}
                            onValueChange={(year) => {
                              const currentDate = calendarFromMonth;
                              const newDate = new Date(parseInt(year), currentDate.getMonth(), currentDate.getDate());
                              setCalendarFromMonth(newDate);
                              // Update dateFrom jika sudah ada tanggal yang dipilih
                              if (dateFrom) {
                                const newDateFrom = new Date(parseInt(year), currentDate.getMonth(), dateFrom.getDate());
                                setDateFrom(newDateFrom);
                              }
                            }}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {Array.from({ length: 30 }, (_, i) => {
                                const year = new Date().getFullYear() - 10 + i;
                                return (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={(calendarFromMonth.getMonth() + 1).toString()}
                            onValueChange={(month) => {
                              const currentDate = calendarFromMonth;
                              const newDate = new Date(currentDate.getFullYear(), parseInt(month) - 1, currentDate.getDate());
                              setCalendarFromMonth(newDate);
                              // Update dateFrom jika sudah ada tanggal yang dipilih
                              if (dateFrom) {
                                const newDateFrom = new Date(currentDate.getFullYear(), parseInt(month) - 1, dateFrom.getDate());
                                setDateFrom(newDateFrom);
                              }
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {Array.from({ length: 12 }, (_, i) => {
                                const month = i + 1;
                                const monthName = new Date(2024, i, 1).toLocaleString('id-ID', { month: 'long' });
                                return (
                                  <SelectItem key={month} value={month.toString()}>
                                    {monthName}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        month={calendarFromMonth}
                        onMonthChange={setCalendarFromMonth}
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
                      <div className="p-3 border-b">
                        <div className="flex gap-2 items-center">
                          <Select
                            value={calendarToMonth.getFullYear().toString()}
                            onValueChange={(year) => {
                              const currentDate = calendarToMonth;
                              const newDate = new Date(parseInt(year), currentDate.getMonth(), currentDate.getDate());
                              setCalendarToMonth(newDate);
                              // Update dateTo jika sudah ada tanggal yang dipilih
                              if (dateTo) {
                                const newDateTo = new Date(parseInt(year), currentDate.getMonth(), dateTo.getDate());
                                setDateTo(newDateTo);
                              }
                            }}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {Array.from({ length: 30 }, (_, i) => {
                                const year = new Date().getFullYear() - 10 + i;
                                return (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={(calendarToMonth.getMonth() + 1).toString()}
                            onValueChange={(month) => {
                              const currentDate = calendarToMonth;
                              const newDate = new Date(currentDate.getFullYear(), parseInt(month) - 1, currentDate.getDate());
                              setCalendarToMonth(newDate);
                              // Update dateTo jika sudah ada tanggal yang dipilih
                              if (dateTo) {
                                const newDateTo = new Date(currentDate.getFullYear(), parseInt(month) - 1, dateTo.getDate());
                                setDateTo(newDateTo);
                              }
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {Array.from({ length: 12 }, (_, i) => {
                                const month = i + 1;
                                const monthName = new Date(2024, i, 1).toLocaleString('id-ID', { month: 'long' });
                                return (
                                  <SelectItem key={month} value={month.toString()}>
                                    {monthName}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        month={calendarToMonth}
                        onMonthChange={setCalendarToMonth}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Table Laba Rugi - Responsive */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 border-r border-gray-300 text-xs sm:text-sm" rowSpan={2}>
                        No Akun
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 border-r border-gray-300 text-xs sm:text-sm" rowSpan={2}>
                        Nama Akun
                      </th>
                      <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 border-r border-gray-300 text-xs sm:text-sm" colSpan={2}>
                        Rencana
                      </th>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-right py-1 sm:py-2 px-2 sm:px-4 font-medium text-gray-600 border-r border-gray-300 text-xs sm:text-sm">
                        RP
                      </th>
                      <th className="text-right py-1 sm:py-2 px-2 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm">
                        RP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-2 sm:px-4 py-8 text-center text-gray-500 text-sm">
                          Loading...
                        </td>
                      </tr>
                    ) : labaRugiData ? (
                      <>
                        {/* PENDAPATAN Section - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-center" colSpan={4}>
                            PENDAPATAN
                          </td>
                        </tr>
                        
                        {/* Data PENDAPATAN (putih) */}
                        {labaRugiData.data?.filter((item: any) => item.account_code?.startsWith('4')).length > 0 ? (
                          labaRugiData.data.filter((item: any) => item.account_code?.startsWith('4')).map((item: any, index: number) => (
                            <tr key={`income-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                          <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 border-r border-gray-300">
                            {item.account_code || '-'}
                          </td>
                          <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 border-r border-gray-300">
                            {item.account_name || '-'}
                          </td>
                          <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 text-right border-r border-gray-300">
                                {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : ''}
                              </td>
                              <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 text-right">
                                -
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-500 italic border-r border-gray-300" colSpan={4}>
                              Belum ada data pendapatan
                            </td>
                          </tr>
                        )}
                        
                        {/* TOTAL PENDAPATAN - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-center border-r border-gray-300" colSpan={3}>
                            TOTAL PENDAPATAN
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-right">
                            {labaRugiData.summary?.total_income ? `Rp. ${new Intl.NumberFormat('id-ID').format(labaRugiData.summary.total_income)}` : ''}
                          </td>
                        </tr>
                        
                        {/* RUGI Section - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-center" colSpan={4}>
                            RUGI
                          </td>
                        </tr>
                        
                        {/* Data BEBAN (putih) */}
                        {labaRugiData.data?.filter((item: any) => item.account_code?.startsWith('5')).length > 0 ? (
                          labaRugiData.data.filter((item: any) => item.account_code?.startsWith('5')).map((item: any, index: number) => (
                            <tr key={`expense-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 text-right border-r border-gray-300">
                                {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : ''}
                          </td>
                          <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 text-right">
                                -
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-500 italic border-r border-gray-300" colSpan={4}>
                              Belum ada data beban
                            </td>
                          </tr>
                        )}
                        
                        {/* TOTAL BEBAN - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-center border-r border-gray-300" colSpan={3}>
                            TOTAL BEBAN
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-right">
                            {labaRugiData.summary?.total_expense ? `Rp. ${new Intl.NumberFormat('id-ID').format(labaRugiData.summary.total_expense)}` : ''}
                          </td>
                        </tr>
                        
                        {/* LABA BERSIH - Header (abu-abu) */}
                        <tr className="bg-gray-100 border-t-2 border-gray-400 border-b border-gray-200">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold text-gray-900 text-center border-r border-gray-300" colSpan={3}>
                            LABA BERSIH
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold text-gray-900 text-right">
                            {labaRugiData.summary?.net_income ? `Rp. ${new Intl.NumberFormat('id-ID').format(labaRugiData.summary.net_income)}` : ''}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-2 sm:px-4 py-8 text-center text-gray-500 text-sm">
                          Tidak ada data laba rugi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
            </TabsContent>

            {/* Template Laporan Tab */}
            <TabsContent value="template" className="space-y-6">
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                {/* Custom Tab Navigation - Responsive Design */}
                <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
                  <button
                    onClick={() => setActiveSubTab('pendapatan')}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
                      activeSubTab === 'pendapatan'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="hidden sm:inline">PENDAPATAN</span>
                    <span className="sm:hidden">PENDAPATAN</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('beban')}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
                      activeSubTab === 'beban'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="hidden sm:inline">BEBAN</span>
                    <span className="sm:hidden">BEBAN</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('rumus')}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
                      activeSubTab === 'rumus'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="hidden sm:inline">RUMUS</span>
                    <span className="sm:hidden">RUMUS</span>
                  </button>
                </div>

                {/* Pendapatan Sub Tab */}
                <TabsContent value="pendapatan" className="space-y-4">
                  {pendapatanCategories.map((category: any) => (
                    <LabaRugiCategoryAccounts
                      key={category.id}
                      category={category}
                      onAddAccount={handleAddAccount}
                      onEditAccount={handleEditAccount}
                      onDeleteAccount={handleDeleteAccount}
                    />
                  ))}
                </TabsContent>

                {/* Beban Sub Tab */}
                <TabsContent value="beban" className="space-y-4">
                  {bebanCategories.map((category: any) => (
                    <LabaRugiCategoryAccounts
                      key={category.id}
                      category={category}
                      onAddAccount={handleAddAccount}
                      onEditAccount={handleEditAccount}
                      onDeleteAccount={handleDeleteAccount}
                    />
                  ))}
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

      {/* Account Form Modal */}
      <AccountForm
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        categoryId={selectedCategoryId}
        onSuccess={handleDataChange}
      />
    </div>
  );
}
