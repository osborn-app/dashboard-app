"use client";

import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
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
import { CalendarIcon, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { useGetPlanningEntries, useGetPlanningAccounts, useGetDetailPerencanaan } from '@/hooks/api/usePerencanaan';
import { useToast } from '@/hooks/use-toast';
import { RencanaTable } from '@/components/tables/rencana-tables/rencana-table';
import { createJurnalUmumRowColumns, JurnalUmumRowItem } from '@/components/tables/jurnal-umum-tables/columns';

interface PlanningEntryResponse {
  id: number;
  created_at: string;
  updated_at: string;
  planning_id: string;
  date: string;
  account_debit_id: string;
  account_credit_id: string;
  amount: number;
  note: string;
}

// Helper function to convert API response to JurnalUmumRowItem format for merged cells
const convertApiResponseToJurnalUmumRowItem = (apiItem: any, accountMap: Map<string, {name: string, code: string}>): JurnalUmumRowItem => {
  // Validate apiItem
  if (!apiItem) {
    return {
      id: '0',
      tanggal: '',
      planningId: '0',
      transactionGroup: 'group_0',
      isFirstInGroup: true,
      status: 'Belum Terealisasi',
      keterangan: '',
      rencanaId: '0',
      rows: []
    };
  }
  
  // Get account details from mapping
  const debitAccount = accountMap.get(apiItem.account_debit_id?.toString() || '');
  const creditAccount = accountMap.get(apiItem.account_credit_id?.toString() || '');
  
  const debitName = debitAccount?.name || `ID: ${apiItem.account_debit_id}`;
  const creditName = creditAccount?.name || `ID: ${apiItem.account_credit_id}`;
  const debitCode = debitAccount?.code || '';
  const creditCode = creditAccount?.code || '';
  
  // Create rows for debit and credit
  const rows = [
    {
      namaAkun: `${debitCode} - ${debitName}`,
      debit: apiItem.amount || 0,
      kredit: 0
    },
    {
      namaAkun: `${creditCode} - ${creditName}`,
      debit: 0,
      kredit: apiItem.amount || 0
    }
  ];
  
  return {
    id: apiItem.id?.toString() || '0',
    tanggal: apiItem.date || '',
    planningId: apiItem.planning_id?.toString() || '0',
    transactionGroup: `group_${apiItem.id || 0}`,
    isFirstInGroup: true,
    status: 'Belum Terealisasi',
    keterangan: apiItem.note || '',
    rencanaId: apiItem.id?.toString() || '0',
    rows
  };
};

export default function JurnalUmumPage() {
  const params = useParams();
  const planningId = params.planningId as string;
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Perencanaan", link: "/dashboard/perencanaan" },
    { title: "Detail Perencanaan", link: `/dashboard/perencanaan/${planningId}` },
    { title: "Laporan Jurnal Umum", link: "#" }
  ];

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce] = useDebounce(searchQuery, 500);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  
  // State untuk mengontrol month yang ditampilkan di kalender
  const [calendarFromMonth, setCalendarFromMonth] = useState<Date>(new Date());
  const [calendarToMonth, setCalendarToMonth] = useState<Date>(new Date());

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

  // Build query parameters untuk API
  const queryParams = useMemo(() => ({
    ...(searchDebounce ? { search: searchDebounce } : {}),
    ...(dateFrom ? { date_from: dateFrom.toISOString() } : {}),
    ...(dateTo ? { date_to: dateTo.toISOString() } : {}),
    page: 1,
    limit: 100
  }), [searchDebounce, dateFrom, dateTo]);

  // Fetch data dari API
  const { data: entriesResponse, isLoading, error } = useGetPlanningEntries(planningId, queryParams);
  const { data: accountsResponse } = useGetPlanningAccounts({ page: 1, limit: 1000 });
  const { data: planningData } = useGetDetailPerencanaan(planningId);

  // Create account mapping for quick lookup
  const accountMap = useMemo(() => {
    if (!accountsResponse?.items) return new Map();
    
    const map = new Map();
    accountsResponse.items.forEach((account: any) => {
      map.set(account.id.toString(), {
        name: account.name,
        code: account.code
      });
    });
    return map;
  }, [accountsResponse]);

  // Convert API response to flat array for table display with merged cells
  const jurnalUmumData = useMemo(() => {
    if (!entriesResponse?.items || !Array.isArray(entriesResponse.items)) {
      return [];
    }
    
    const flatData: JurnalUmumRowItem[] = [];
    entriesResponse.items.forEach((item: PlanningEntryResponse) => {
      const rowItem = convertApiResponseToJurnalUmumRowItem(item, accountMap);
      // Add multiple rows for each transaction (debit and credit)
      rowItem.rows.forEach((_, index) => {
        flatData.push({
          ...rowItem,
          // Add a unique key for each row
          id: `${rowItem.id}_${index}`,
          isFirstInGroup: index === 0,
          // Add fields needed by RencanaTable
          status: 'Belum Terealisasi',
          keterangan: item.note || '',
          rencanaId: item.id?.toString() || '0'
        });
      });
    });
    
    return flatData;
  }, [entriesResponse, accountMap]);

  // Handle search
  const handleSearch = () => {
    // Search akan otomatis trigger karena queryParams berubah
  };

  // Handle rekap - Export to XLSX
  const handleRekap = async () => {
    if (!jurnalUmumData || jurnalUmumData.length === 0) {
      toast({
        title: 'Tidak Ada Data',
        description: 'Tidak ada data jurnal umum untuk diekspor',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Get unique transactions (avoid duplicates from merged cells)
      const uniqueTransactions = jurnalUmumData.filter((item, index, array) => {
        // Only take the first row of each transaction group (isFirstInGroup)
        return item.isFirstInGroup;
      });

      // Prepare data for export
      const exportData = uniqueTransactions.map((item, index) => {
        const debitRow = item.rows[0]; // Debit row
        const creditRow = item.rows[1]; // Credit row
        return {
          'No': index + 1,
          'Tanggal': item.tanggal ? format(new Date(item.tanggal), 'dd/MM/yyyy', { locale: id }) : '',
          'Keterangan': item.keterangan || '',
          'Akun Debit': debitRow?.namaAkun || '',
          'Debit': debitRow?.debit || 0,
          'Akun Kredit': creditRow?.namaAkun || '',
          'Kredit': creditRow?.kredit || 0,
        };
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // No
        { wch: 12 },  // Tanggal
        { wch: 30 },  // Keterangan
        { wch: 25 },  // Akun Debit
        { wch: 15 },  // Debit
        { wch: 25 },  // Akun Kredit
        { wch: 15 },  // Kredit
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Jurnal Umum Perencanaan');

      // Generate filename using planning name
      const filename = generateFilename('xlsx');

      // Save file
      XLSX.writeFile(wb, filename);

      toast({
        title: 'Export Berhasil',
        description: `File ${filename} berhasil diunduh`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Gagal',
        description: 'Terjadi kesalahan saat mengekspor data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate filename based on planning name
  const generateFilename = (extension: string) => {
    const dateFromStr = dateFrom ? format(dateFrom, 'dd-MM-yyyy') : 'semua';
    const dateToStr = dateTo ? format(dateTo, 'dd-MM-yyyy') : 'semua';
    const currentDate = format(new Date(), 'dd-MM-yyyy');
    
    // Get planning name from API data
    const planningName = planningData?.data?.name || 'Perencanaan';
    
    // Clean planning name for filename (remove special characters)
    const cleanPlanningName = planningName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .trim();
    
    return `Jurnal_Umum_${cleanPlanningName}_${dateFromStr}_${dateToStr}_${currentDate}.${extension}`;
  };

  // Handle export jurnal umum to CSV
  const handleExportJurnalUmumCSV = async () => {
    if (!jurnalUmumData || jurnalUmumData.length === 0) {
      toast({
        title: 'Tidak Ada Data',
        description: 'Tidak ada data jurnal umum untuk diekspor',
        variant: 'destructive',
      });
      return;
    }

    setIsExportingCSV(true);
    
    try {
      // Get unique transactions (avoid duplicates from merged cells)
      const uniqueTransactions = jurnalUmumData.filter((item, index, array) => {
        // Only take the first row of each transaction group (isFirstInGroup)
        return item.isFirstInGroup;
      });

      // Prepare data for export
      const exportData = uniqueTransactions.map((item, index) => {
        const debitRow = item.rows[0]; // Debit row
        const creditRow = item.rows[1]; // Credit row
        return {
          'No': index + 1,
          'Tanggal': item.tanggal ? format(new Date(item.tanggal), 'dd/MM/yyyy', { locale: id }) : '',
          'Keterangan': item.keterangan || '',
          'Akun Debit': debitRow?.namaAkun || '',
          'Debit': debitRow?.debit || 0,
          'Akun Kredit': creditRow?.namaAkun || '',
          'Kredit': creditRow?.kredit || 0,
        };
      });

      // Convert to CSV format
      const headers = ['No', 'Tanggal', 'Keterangan', 'Akun Debit', 'Debit', 'Akun Kredit', 'Kredit'] as const;
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename using planning name
      const filename = generateFilename('csv');
      
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export CSV Berhasil',
        description: `File ${filename} berhasil diunduh`,
      });

    } catch (error) {
      console.error('Export CSV error:', error);
      toast({
        title: 'Export CSV Gagal',
        description: 'Terjadi kesalahan saat mengekspor data CSV',
        variant: 'destructive',
      });
    } finally {
      setIsExportingCSV(false);
    }
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
        <Heading title="Laporan Jurnal Umum" description="Laporan jurnal umum perencanaan keuangan" />
      </div>
      <Separator />

      <div className="space-y-6">
        <Card>
        <CardHeader>
          <CardTitle>Jurnal Umum Perencanaan</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search dan Filter Section */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            {/* Search Input */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan keterangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date From */}
            <div className="min-w-[160px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
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
            <div className="min-w-[160px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
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

            {/* Unduh CSV Button */}
            <Button 
              variant="outline"
              size="sm"
              onClick={handleExportJurnalUmumCSV} 
              disabled={isExportingCSV}
            >
              {isExportingCSV ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Mengekspor...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Unduh CSV
                </>
              )}
            </Button>

            {/* Unduh XLSX Button */}
            <Button 
              size="sm"
              onClick={handleRekap} 
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengekspor...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Unduh XLSX
                </>
              )}
            </Button>
          </div>

          {/* Jurnal Umum Table */}
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading jurnal umum data...</p>
              </div>
            </div>
          ) : (
            <RencanaTable
              columns={createJurnalUmumRowColumns()}
              data={jurnalUmumData}
              mergedColumns={['tanggal']} // Only merge tanggal column
            />
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
