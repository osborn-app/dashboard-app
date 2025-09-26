"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Search, Plus, Trash2, MoreVertical, Edit, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGetNeracaReport, useGetPlanningCategoriesSelect, useGetDetailPerencanaan, useCategoriesRemoveAccount } from '@/hooks/api/usePerencanaan';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CategoryAccounts } from '@/app/(dashboard)/dashboard/perencanaan/components/display-components';
import { CategoryForm } from '@/app/(dashboard)/dashboard/perencanaan/components/category-form';
import { AccountForm } from '@/app/(dashboard)/dashboard/perencanaan/components/account-form';
import { DeleteCategoryDialog } from '@/app/(dashboard)/dashboard/perencanaan/components/dialogs';

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
  
  // State untuk mengontrol month yang ditampilkan di kalender
  const [calendarFromMonth, setCalendarFromMonth] = useState<Date>(new Date());
  const [calendarToMonth, setCalendarToMonth] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('data');
  const [activeSubTab, setActiveSubTab] = useState('aktiva');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
  
  // State untuk export
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    description: string;
    type: string;
  } | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
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

  // State untuk template categories dan accounts - akan diisi dari API
  const [aktivaCategories, setAktivaCategories] = useState<Array<{
    id: string, 
    name: string, 
    description: string,
    type: string,
    accounts: Array<{id: string, name: string, code: string}>
  }>>([]);
  const [pasivaCategories, setPasivaCategories] = useState<Array<{
    id: string, 
    name: string, 
    description: string,
    type: string,
    accounts: Array<{id: string, name: string, code: string}>
  }>>([]);

  // Fetch data dari API
  const { data: neracaData, isLoading, error } = useGetNeracaReport(planningId, {
    date_from: dateFrom ? dateFrom.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    date_to: dateTo ? dateTo.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    template_id: '1', // Default template ID
  });

  // Hook untuk API categories
  const { data: categoriesData, isLoading: isLoadingCategories, refetch: refetchCategories } = useGetPlanningCategoriesSelect(planningId);
  
  // Hook untuk delete account dari category
  const { mutateAsync: removeAccount } = useCategoriesRemoveAccount(planningId);
  
  // Hook untuk fetch planning detail (untuk filename)
  const { data: planningDetail } = useGetDetailPerencanaan(planningId);





  // ✅ Process categories data from API - memoized for performance
  const processedCategories = useMemo(() => {
    if (!categoriesData) return { aktiva: [], pasiva: [] };
    
    const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData.data || [];
    
    // Filter kategori berdasarkan tipe (aktiva/pasiva)
    const aktiva = categories.filter((cat: any) => cat.type === 'AKTIVA');
    const pasiva = categories.filter((cat: any) => cat.type === 'PASIVA');
    
    // Transform data to match expected format
    const transformCategory = (category: any) => ({
      id: category.id.toString(),
      name: category.name,
      description: category.description || '',
      type: category.type || 'AKTIVA',
      accounts: []
    });
    
    const transformedAktiva = aktiva.map(transformCategory);
    const transformedPasiva = pasiva.map(transformCategory);
    
    return { aktiva: transformedAktiva, pasiva: transformedPasiva };
  }, [categoriesData]);
  
  // ✅ useEffect dengan dependency yang benar
  useEffect(() => {
    if (processedCategories.aktiva.length > 0 || processedCategories.pasiva.length > 0) {
      setAktivaCategories(processedCategories.aktiva);
      setPasivaCategories(processedCategories.pasiva);
    }
  }, [processedCategories]);



  // Helper function untuk generate filename
  const generateFilename = (format: 'csv' | 'xlsx') => {
    const planningName = (planningDetail as any)?.data?.data?.name || 'Neraca';
    const sanitizedName = planningName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    return `${sanitizedName}_${date}.${format}`;
  };

  // Handle export CSV
  const handleExportNeracaCSV = async () => {
    if (!neracaData?.data || neracaData.data.length === 0) {
      toast({
        title: 'Tidak Ada Data',
        description: 'Tidak ada data neraca untuk diekspor',
        variant: 'destructive',
      });
      return;
    }

    setIsExportingCSV(true);
    try {
      const exportData = neracaData.data.map((item: any, index: number) => ({
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
        description: 'Data neraca berhasil diekspor ke CSV',
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
    if (!neracaData?.data || neracaData.data.length === 0) {
      toast({
        title: 'Tidak Ada Data',
        description: 'Tidak ada data neraca untuk diekspor',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const exportData = neracaData.data.map((item: any, index: number) => ({
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Neraca');
      
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
        description: 'Data neraca berhasil diekspor ke XLSX',
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

  // Handle tambah kategori
  const handleAddCategory = () => {
    setIsAddCategoryModalOpen(true);
  };


  // Handle edit kategori
  const handleEditCategory = (category: { id: string; name: string; description: string; type: string }) => {
    setSelectedCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  // Handle delete kategori
  const handleDeleteCategory = (category: { id: string; name: string; description: string; type: string }) => {
    setSelectedCategory(category);
    setIsDeleteCategoryModalOpen(true);
  };

  // Handler functions untuk akun
  const handleAddAccount = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsAddAccountModalOpen(true);
  };

  const handleEditAccount = (accountId: string) => {
    setSelectedAccount({ id: accountId });
    setIsEditAccountModalOpen(true);
  };

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

  // Handle refresh data
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
        <Heading title="Laporan Neraca" description="Laporan neraca perencanaan keuangan" />
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
              <CardTitle>Neraca Perencanaan</CardTitle>
              {neracaData?.period && (
                <p className="text-sm text-gray-600 mt-1">
                  Periode: {neracaData.period}
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
                        onClick={handleExportNeracaCSV}
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
                    <div className="flex-1">
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
                </div>

                {/* Table Neraca - Responsive */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 border-r border-gray-300 text-xs sm:text-sm" rowSpan={2}>
                          NO AKUN
                        </th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 border-r border-gray-300 text-xs sm:text-sm" rowSpan={2}>
                          NAMA AKUN
                        </th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 border-r border-gray-300 text-xs sm:text-sm" colSpan={2}>
                          PERENCANAAN
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
                      ) : neracaData ? (
                        <>
                          {/* AKTIVA Section - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-center" colSpan={4}>
                              AKTIVA
                            </td>
                          </tr>
                          
                          {/* Dynamic AKTIVA Categories */}
                          {aktivaCategories.map((category) => {
                            // Filter data berdasarkan kategori
                            const categoryData = neracaData?.assets?.filter((item: any) => 
                              item.category_id === category.id || item.category_name === category.name
                            ) || [];
                            
                            return (
                              <React.Fragment key={`aktiva-category-${category.id}`}>
                                {/* Kategori Header */}
                                <tr className="bg-gray-100 border-b border-gray-200">
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-800 text-center" colSpan={4}>
                                    {category.name}
                                  </td>
                                </tr>
                                
                                {/* Data Akun dalam Kategori */}
                                {categoryData.length > 0 ? (
                                  categoryData.map((item: any, index: number) => (
                                    <tr key={`aktiva-${category.id}-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                                      <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 border-r border-gray-300">
                                        {item.account_code || '-'}
                                      </td>
                                      <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 border-r border-gray-300">
                                        {item.account_name || '-'}
                                      </td>
                                      <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
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
                                      Belum ada data untuk kategori {category.name}
                                    </td>
                                  </tr>
                                )}
                                
                                {/* Total Kategori */}
                                <tr className="bg-gray-100 border-b border-gray-200">
                                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={3}>
                                    TOTAL {category.name.toUpperCase()}
                                  </td>
                                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                                    {categoryData.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) > 0 ? 
                                      `Rp. ${new Intl.NumberFormat('id-ID').format(categoryData.reduce((sum: number, item: any) => sum + (item.amount || 0), 0))}` : 
                                      'Rp. 0'}
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                          
                          {/* TOTAL AKTIVA - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-t-2 border-gray-400 border-b border-gray-200">
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={3}>
                              TOTAL AKTIVA
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-right">
                              {neracaData.summary?.total_assets ? `Rp. ${new Intl.NumberFormat('id-ID').format(neracaData.summary.total_assets)}` : 'Rp. 0'}
                            </td>
                          </tr>
                          
                          {/* PASIVA Section - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-center" colSpan={4}>
                              PASIVA
                            </td>
                          </tr>
                          
                          {/* Dynamic PASIVA Categories */}
                          {pasivaCategories.map((category) => {
                            // Filter data berdasarkan kategori
                            const categoryData = neracaData?.liabilities?.filter((item: any) => 
                              item.category_id === category.id || item.category_name === category.name
                            ) || [];
                            
                            return (
                              <React.Fragment key={`pasiva-category-${category.id}`}>
                                {/* Kategori Header */}
                                <tr className="bg-gray-100 border-b border-gray-200">
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-800 text-center" colSpan={4}>
                                    {category.name}
                                  </td>
                                </tr>
                                
                                {/* Data Akun dalam Kategori */}
                                {categoryData.length > 0 ? (
                                  categoryData.map((item: any, index: number) => (
                                    <tr key={`pasiva-${category.id}-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                                      <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 border-r border-gray-300">
                                        {item.account_code || '-'}
                                      </td>
                                      <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 border-r border-gray-300">
                                        {item.account_name || '-'}
                                      </td>
                                      <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                        -
                                      </td>
                                      <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 text-right">
                                        {item.amount ? `Rp. ${new Intl.NumberFormat('id-ID').format(item.amount)}` : ''}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr className="bg-white border-b border-gray-200">
                                    <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-gray-500 italic border-r border-gray-300" colSpan={4}>
                                      Belum ada data untuk kategori {category.name}
                                    </td>
                                  </tr>
                                )}
                                
                                {/* Total Kategori */}
                                <tr className="bg-gray-100 border-b border-gray-200">
                                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={3}>
                                    TOTAL {category.name.toUpperCase()}
                                  </td>
                                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                                    {categoryData.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) > 0 ? 
                                      `Rp. ${new Intl.NumberFormat('id-ID').format(categoryData.reduce((sum: number, item: any) => sum + (item.amount || 0), 0))}` : 
                                      'Rp. 0'}
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                          
                          {/* TOTAL PASIVA - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-t-2 border-gray-400 border-b border-gray-200">
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={3}>
                              TOTAL PASIVA
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-right">
                              {neracaData.summary?.total_liabilities ? `Rp. ${new Intl.NumberFormat('id-ID').format(neracaData.summary.total_liabilities)}` : 'Rp. 0'}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-2 sm:px-4 py-8 text-center text-gray-500 text-sm">
                            Tidak ada data neraca
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </TabsContent>

              {/* Template Laporan Tab */}
              <TabsContent value="template" className="space-y-4">
                <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                  {/* Custom Tab Navigation - Responsive Design */}
                  <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
                    <button
                      onClick={() => setActiveSubTab('aktiva')}
                      className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
                        activeSubTab === 'aktiva'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <span className="hidden sm:inline">AKTIVA</span>
                      <span className="sm:hidden">AKTIVA</span>
                    </button>
                    <button
                      onClick={() => setActiveSubTab('pasiva')}
                      className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
                        activeSubTab === 'pasiva'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <span className="hidden sm:inline">PASIVA</span>
                      <span className="sm:hidden">PASIVA</span>
                    </button>
                  </div>

                  {/* AKTIVA Sub Tab */}
                  <TabsContent value="aktiva" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Kategori Aktiva</h3>
                      <Button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        TAMBAH KATEGORI
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Dynamic Categories - akan diisi dari API */}
                      {aktivaCategories.length > 0 ? (
                        aktivaCategories.map((category) => (
                          <div key={category.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-bold text-green-600 text-lg">{category.name}</h4>
                              <div className="flex space-x-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleEditCategory({
                                      id: category.id,
                                      name: category.name,
                                      description: category.description,
                                      type: category.type
                                    })}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => handleDeleteCategory({
                                        id: category.id,
                                        name: category.name,
                                        description: category.description,
                                        type: category.type
                                      })}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Hapus
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            
                            {/* Header NAMA AKUN */}
                            <div className="bg-gray-100 p-2 mb-2">
                              <p className="font-bold text-gray-900">NAMA AKUN</p>
                            </div>
                            
                            <CategoryAccounts 
                              categoryId={category.id}
                              onAddAccount={() => handleAddAccount(category.id)}
                              onEditAccount={handleEditAccount}
                              onDeleteAccount={handleDeleteAccount}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>Belum ada kategori aktiva. Tambahkan kategori di atas.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* PASIVA Sub Tab */}
                  <TabsContent value="pasiva" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Kategori Pasiva</h3>
                      <Button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        TAMBAH KATEGORI
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Dynamic Categories - akan diisi dari API */}
                      {pasivaCategories.length > 0 ? (
                        pasivaCategories.map((category) => (
                          <div key={category.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-bold text-green-600 text-lg">{category.name}</h4>
                              <div className="flex space-x-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleEditCategory({
                                      id: category.id,
                                      name: category.name,
                                      description: category.description,
                                      type: category.type
                                    })}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => handleDeleteCategory({
                                        id: category.id,
                                        name: category.name,
                                        description: category.description,
                                        type: category.type
                                      })}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Hapus
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            
                            {/* Header NAMA AKUN */}
                            <div className="bg-gray-100 p-2 mb-2">
                              <p className="font-bold text-gray-900">NAMA AKUN</p>
                            </div>
                            
                            <CategoryAccounts 
                              categoryId={category.id}
                              onAddAccount={() => handleAddAccount(category.id)}
                              onEditAccount={handleEditAccount}
                              onDeleteAccount={handleDeleteAccount}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>Belum ada kategori pasiva. Tambahkan kategori di atas.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Form Components */}
      <CategoryForm 
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        categoryType={activeSubTab.toUpperCase() as 'AKTIVA' | 'PASIVA'}
        planningId={planningId}
        onDataChange={handleDataChange}
      />
      
      <CategoryForm 
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        categoryType={selectedCategory?.type as 'AKTIVA' | 'PASIVA' || activeSubTab.toUpperCase() as 'AKTIVA' | 'PASIVA'}
        planningId={planningId}
        editData={selectedCategory}
        onDataChange={handleDataChange}
      />
      
      <DeleteCategoryDialog
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        categoryId={selectedCategory?.id || ''}
        categoryName={selectedCategory?.name || ''}
        onDataChange={handleDataChange}
      />
      
      <AccountForm 
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        categoryId={selectedCategoryId}
        onSuccess={handleDataChange}
      />
      
      <AccountForm
        isOpen={isEditAccountModalOpen}
        onClose={() => {
          setIsEditAccountModalOpen(false);
          setSelectedAccount(null);
        }}
        categoryId={selectedCategoryId}
        onSuccess={handleDataChange}
      />
    </div>
  );
}