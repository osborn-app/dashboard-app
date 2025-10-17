"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { Search, Download, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import { useGetArusKasReport } from '@/hooks/api/usePerencanaan';
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { formatRupiah } from '@/lib/utils';
import * as XLSX from 'xlsx';

export default function ArusKasPage() {
  const routeParams = useParams();
  const planningId = routeParams.planningId as string;

  const breadcrumbItems = [
    { title: "Perencanaan", link: "/dashboard/perencanaan" },
    { title: "Detail Perencanaan", link: `/dashboard/perencanaan/${planningId}` },
    { title: "Laporan Arus Kas", link: "#" }
  ];

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: dayjs().startOf('month').toDate(),
    to: dayjs().endOf('month').toDate(),
  });
  const [isExporting, setIsExporting] = useState(false);

  // Prepare params for API call
  const apiParams = {
    date_from: dateRange.from ? dayjs(dateRange.from).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD'),
    date_to: dateRange.to ? dayjs(dateRange.to).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD'),
    template_id: 'template_arus_kas', // Template ID untuk arus kas
  };

  const { data: arusKasData, isLoading, error, refetch } = useGetArusKasReport(planningId, apiParams);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  const handleClearDate = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Data arus kas berhasil diperbarui.");
  };

  // Handle export
  const handleExport = async (format: 'excel' | 'csv') => {
    if (!arusKasData) {
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
        'Arus Kas Operasi': 'Arus Kas Operasi',
        'Arus Kas Investasi': 'Arus Kas Investasi',
        'Arus Kas Pendanaan': 'Arus Kas Pendanaan'
      });

      // Add ARUS KAS DARI AKTIVITAS OPERASI section
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'ARUS KAS DARI AKTIVITAS OPERASI',
        'Arus Kas Operasi': '',
        'Arus Kas Investasi': '',
        'Arus Kas Pendanaan': ''
      });

      // Add operating activities
      if (arusKasData.operating_activities?.length > 0) {
        arusKasData.operating_activities.forEach((item: any) => {
          exportData.push({
            'No Akun': item.account_code || '-',
            'Nama Akun': item.account_name || '-',
            'Arus Kas Operasi': item.amount || 0,
            'Arus Kas Investasi': 0,
            'Arus Kas Pendanaan': 0
          });
        });
      }

      // Add ARUS KAS DARI AKTIVITAS INVESTASI section
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'ARUS KAS DARI AKTIVITAS INVESTASI',
        'Arus Kas Operasi': '',
        'Arus Kas Investasi': '',
        'Arus Kas Pendanaan': ''
      });

      // Add investing activities
      if (arusKasData.investing_activities?.length > 0) {
        arusKasData.investing_activities.forEach((item: any) => {
          exportData.push({
            'No Akun': item.account_code || '-',
            'Nama Akun': item.account_name || '-',
            'Arus Kas Operasi': 0,
            'Arus Kas Investasi': item.amount || 0,
            'Arus Kas Pendanaan': 0
          });
        });
      }

      // Add ARUS KAS DARI AKTIVITAS PENDANAAN section
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'ARUS KAS DARI AKTIVITAS PENDANAAN',
        'Arus Kas Operasi': '',
        'Arus Kas Investasi': '',
        'Arus Kas Pendanaan': ''
      });

      // Add financing activities
      if (arusKasData.financing_activities?.length > 0) {
        arusKasData.financing_activities.forEach((item: any) => {
          exportData.push({
            'No Akun': item.account_code || '-',
            'Nama Akun': item.account_name || '-',
            'Arus Kas Operasi': 0,
            'Arus Kas Investasi': 0,
            'Arus Kas Pendanaan': item.amount || 0
          });
        });
      }

      // Add NET CASH FLOW
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'NET CASH FLOW',
        'Arus Kas Operasi': arusKasData.summary?.net_cashflow || 0,
        'Arus Kas Investasi': '',
        'Arus Kas Pendanaan': ''
      });

      if (format === 'csv') {
        const csvContent = convertToCSV(exportData);
        downloadFile(csvContent, `arus_kas_perencanaan_${dayjs().format('YYYY-MM-DD')}.csv`, 'text/csv');
      } else {
        const excelContent = convertToExcel(exportData);
        downloadFile(excelContent, `arus_kas_perencanaan_${dayjs().format('YYYY-MM-DD')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', true);
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Arus Kas");
    
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

  // Filter data based on search query
  const filterAccounts = (accounts: any[]) => {
    if (!searchQuery.trim()) return accounts;
    return accounts.filter((account: any) =>
      account.account_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.account_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredOperatingActivities = filterAccounts(arusKasData?.operating_activities || []);
  const filteredInvestingActivities = filterAccounts(arusKasData?.investing_activities || []);
  const filteredFinancingActivities = filterAccounts(arusKasData?.financing_activities || []);

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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
    <>
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
              {dateRange.from && dateRange.to && (
                <p className="text-sm text-muted-foreground mt-1">
                  Periode: {dayjs(dateRange.from).format('DD MMMM YYYY')} - {dayjs(dateRange.to).format('DD MMMM YYYY')}
                </p>
              )}
            </CardHeader>
            <CardContent>

              {/* Search dan Filter Section */}
              <div className="flex flex-wrap gap-4 mb-6">
                {/* Search Input */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cari berdasarkan nama akun atau kode akun..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
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
              {/* Table Arus Kas */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-300">
                        No Akun
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 border-r border-gray-300">
                        Nama Akun
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 border-r border-gray-300">
                        Arus Kas Operasi
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 border-r border-gray-300">
                        Arus Kas Investasi
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        Arus Kas Pendanaan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          Loading data arus kas...
                        </td>
                      </tr>
                    ) : arusKasData ? (
                      <>
                        {/* ARUS KAS DARI AKTIVITAS OPERASI Section - Header */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900" colSpan={5}>
                            ARUS KAS DARI AKTIVITAS OPERASI
                          </td>
                        </tr>
                        
                        {/* Data ARUS KAS DARI AKTIVITAS OPERASI */}
                        {filteredOperatingActivities.length > 0 ? (
                          filteredOperatingActivities.map((item: any, index: number) => (
                            <tr key={`operating-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                {formatRupiah(item.amount || 0)}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                -
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                -
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-2 px-4 text-sm text-gray-500 italic" colSpan={5}>
                              {searchQuery.trim() ? 'Tidak ada data aktivitas operasi yang sesuai dengan pencarian' : 'Belum ada data aktivitas operasi'}
                            </td>
                          </tr>
                        )}

                        {/* Empty row */}
                        <tr>
                          <td className="py-2" colSpan={5}></td>
                        </tr>
                        
                        {/* ARUS KAS DARI AKTIVITAS INVESTASI Section - Header */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900" colSpan={5}>
                            ARUS KAS DARI AKTIVITAS INVESTASI
                          </td>
                        </tr>
                        
                        {/* Data ARUS KAS DARI AKTIVITAS INVESTASI */}
                        {filteredInvestingActivities.length > 0 ? (
                          filteredInvestingActivities.map((item: any, index: number) => (
                            <tr key={`investing-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                -
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                {formatRupiah(item.amount || 0)}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                -
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-2 px-4 text-sm text-gray-500 italic" colSpan={5}>
                              {searchQuery.trim() ? 'Tidak ada data aktivitas investasi yang sesuai dengan pencarian' : 'Belum ada data aktivitas investasi'}
                            </td>
                          </tr>
                        )}

                        {/* Empty row */}
                        <tr>
                          <td className="py-2" colSpan={5}></td>
                        </tr>
                        
                        {/* ARUS KAS DARI AKTIVITAS PENDANAAN Section - Header */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900" colSpan={5}>
                            ARUS KAS DARI AKTIVITAS PENDANAAN
                          </td>
                        </tr>
                        
                        {/* Data ARUS KAS DARI AKTIVITAS PENDANAAN */}
                        {filteredFinancingActivities.length > 0 ? (
                          filteredFinancingActivities.map((item: any, index: number) => (
                            <tr key={`financing-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                -
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                -
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                {formatRupiah(item.amount || 0)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-2 px-4 text-sm text-gray-500 italic" colSpan={5}>
                              {searchQuery.trim() ? 'Tidak ada data aktivitas pendanaan yang sesuai dengan pencarian' : 'Belum ada data aktivitas pendanaan'}
                            </td>
                          </tr>
                        )}

                        {/* Empty row */}
                        <tr>
                          <td className="py-2" colSpan={5}></td>
                        </tr>
                        
                        {/* NET CASH FLOW */}
                        <tr className="bg-blue-50 border-t-2 border-blue-400">
                          <td className="py-3 px-4 text-sm font-bold text-blue-900 border-r border-blue-300" colSpan={2}>
                            NET CASH FLOW
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-blue-900 text-right border-r border-blue-300">
                            {formatRupiah(arusKasData.summary?.net_cashflow || 0)}
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-blue-900 text-right border-r border-blue-300">
                            -
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-blue-900 text-right">
                            -
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada data arus kas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
