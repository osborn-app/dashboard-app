"use client";

import { useState } from 'react';
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { CalendarIcon, Search, TrendingUp, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGetProfitLoss, GetProfitLossParams } from '@/hooks/api/useFinancialReports';
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const breadcrumbItems = [
  { title: "Realisasi", link: "/dashboard/realisasi" },
  { title: "Laba Rugi", link: "/dashboard/realisasi/laporan-keuangan/laba-rugi" }
];

export default function LabaRugiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: dayjs().startOf('month').toDate(),
    to: dayjs().endOf('month').toDate(),
  });
  const [activeTab, setActiveTab] = useState('data');
  const [isExporting, setIsExporting] = useState(false);

  // Prepare params for API call
  const params: GetProfitLossParams = {
    startDate: dateRange.from ? dayjs(dateRange.from).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dateRange.to ? dayjs(dateRange.to).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD'),
  };

  // Fetch data dari API
  const { data: labaRugiData, isLoading, error } = useGetProfitLoss(params);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  const handleClearDate = () => {
    setDateRange({
      from: dayjs().startOf('month').toDate(),
      to: dayjs().endOf('month').toDate(),
    });
  };

  // Handle export
  const handleExport = async (format: 'excel' | 'csv') => {
    if (!labaRugiData) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = [];

      // Add header row
      exportData.push({
        'No Akun': 'No Akun',
        'Nama Akun': 'Nama Akun',
        'Pendapatan': 'Pendapatan',
        'Beban': 'Beban'
      });

      // Add section header
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'PENDAPATAN',
        'Pendapatan': '',
        'Beban': ''
      });

      // Add revenue accounts
      if (labaRugiData.revenue?.accounts?.length > 0) {
        labaRugiData.revenue.accounts.forEach((item: any) => {
          exportData.push({
            'No Akun': item.account_code || '-',
            'Nama Akun': item.account_name || '-',
            'Pendapatan': item.running_balance && item.running_balance > 0 ? item.running_balance : 0,
            'Beban': 0
          });
        });
      }

      // Add total revenue
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'TOTAL PENDAPATAN',
        'Pendapatan': labaRugiData.revenue?.total_revenue || 0,
        'Beban': 0
      });

      // Add empty row
      exportData.push({
        'No Akun': '',
        'Nama Akun': '',
        'Pendapatan': '',
        'Beban': ''
      });

      // Add section header
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'BEBAN',
        'Pendapatan': '',
        'Beban': ''
      });

      // Add expense accounts
      if (labaRugiData.expenses?.accounts?.length > 0) {
        labaRugiData.expenses.accounts.forEach((item: any) => {
          exportData.push({
            'No Akun': item.account_code || '-',
            'Nama Akun': item.account_name || '-',
            'Pendapatan': 0,
            'Beban': item.running_balance && item.running_balance > 0 ? item.running_balance : 0
          });
        });
      }

      // Add total expenses
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'TOTAL BEBAN',
        'Pendapatan': 0,
        'Beban': labaRugiData.expenses?.total_expenses || 0
      });

      // Add empty row
      exportData.push({
        'No Akun': '',
        'Nama Akun': '',
        'Pendapatan': '',
        'Beban': ''
      });

      // Add net profit
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'LABA BERSIH',
        'Pendapatan': labaRugiData.net_profit || 0,
        'Beban': 0
      });

      if (format === 'csv') {
        const csvContent = convertToCSV(exportData);
        downloadFile(csvContent, `laba_rugi_${dayjs().format('YYYY-MM-DD')}.csv`, 'text/csv');
      } else {
        const excelContent = convertToExcel(exportData);
        downloadFile(excelContent, `laba_rugi_${dayjs().format('YYYY-MM-DD')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', true);
      }
      
      toast.success(`Data berhasil diekspor dalam format ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error('Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  // Helper function to convert data to Excel using XLSX library
  const convertToExcel = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laba Rugi");
    
    // Generate Excel file as buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return excelBuffer;
  };

  // Helper function to download file
  const downloadFile = (content: any, filename: string, mimeType: string, isExcel: boolean = false) => {
    let blob: Blob;
    
    if (isExcel) {
      // For Excel files, content is already a buffer
      blob = new Blob([content], { type: mimeType });
    } else {
      // For CSV files, content is a string
      blob = new Blob([content], { type: mimeType });
    }
    
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <BreadCrumb items={breadcrumbItems} />
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                Error loading data: {error.message}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Laporan Laba Rugi" description="Laporan laba rugi realisasi keuangan" />
        </div>
        <Separator />

        <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Laba Rugi Realisasi
            </CardTitle>
            {dateRange.from && dateRange.to && (
              <p className="text-sm text-gray-600 mt-1">
                Periode: {dayjs(dateRange.from).format('DD/MM/YYYY')} - {dayjs(dateRange.to).format('DD/MM/YYYY')}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="data">Data Laporan</TabsTrigger>
                <TabsTrigger value="rumus">Rumus</TabsTrigger>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="min-w-[260px]">
                    <CalendarDateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={handleDateRangeChange}
                      onClearDate={handleClearDate}
                    />
                  </div>

                  {/* Export Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleExport('excel')} 
                      variant="outline" 
                      size="sm"
                      disabled={isExporting}
                      className="min-w-[120px]"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button 
                      onClick={() => handleExport('csv')} 
                      variant="outline" 
                      size="sm"
                      disabled={isExporting}
                      className="min-w-[120px]"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
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
                          Realisasi
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
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                              Loading...
                            </div>
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
                          {labaRugiData.revenue?.accounts?.length > 0 ? (
                            labaRugiData.revenue.accounts.map((item: any, index: number) => (
                              <tr key={`income-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                                <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                  {item.account_code || '-'}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                  {item.account_name || '-'}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                  {item.running_balance && item.running_balance > 0 ? formatCurrency(item.running_balance) : ''}
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
                              {labaRugiData.revenue?.total_revenue ? formatCurrency(labaRugiData.revenue.total_revenue) : ''}
                            </td>
                          </tr>
                          
                          {/* BEBAN Section - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-center" colSpan={4}>
                              BEBAN
                            </td>
                          </tr>
                          
                          {/* Data BEBAN (putih) */}
                          {labaRugiData.expenses?.accounts?.length > 0 ? (
                            labaRugiData.expenses.accounts.map((item: any, index: number) => (
                              <tr key={`expense-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                                <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                  {item.account_code || '-'}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                  {item.account_name || '-'}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                  -
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                  {item.running_balance && item.running_balance > 0 ? formatCurrency(item.running_balance) : ''}
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
                              {labaRugiData.expenses?.total_expenses ? formatCurrency(labaRugiData.expenses.total_expenses) : ''}
                            </td>
                          </tr>
                          
                          {/* LABA BERSIH - Header (abu-abu) */}
                          <tr className="bg-gray-100 border-t-2 border-gray-400 border-b border-gray-200">
                            <td className="py-3 px-4 text-sm font-bold text-gray-900 text-center border-r border-gray-300" colSpan={3}>
                              LABA BERSIH
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right">
                              {labaRugiData.net_profit ? formatCurrency(labaRugiData.net_profit) : ''}
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

              {/* Rumus Tab */}
              <TabsContent value="rumus" className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">RUMUS LABA RUGI</h2>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-900 mb-4">
                    LABA BERSIH = Total Pendapatan - Total Beban
                  </p>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-700">
                        <strong>Pendapatan:</strong> Semua akun dengan tipe REVENUE (kode akun 4xxx)
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-700">
                        <strong>Beban:</strong> Semua akun dengan tipe EXPENSE (kode akun 5xxx)
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Catatan:</strong> Data diambil berdasarkan periode yang dipilih dan hanya menampilkan akun yang memiliki saldo.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}