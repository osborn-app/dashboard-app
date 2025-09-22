"use client";

import React, { useState } from 'react';
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { Search, Download, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import { useGetBalanceSheet, GetBalanceSheetParams } from '@/hooks/api/useFinancialReports';
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { formatRupiah } from '@/lib/utils';
import * as XLSX from 'xlsx';

const breadcrumbItems = [
  { title: "Realisasi", link: "/dashboard/realisasi" },
  { title: "Neraca Saldo", link: "/dashboard/realisasi/laporan-keuangan/neraca" }
];

export default function NeracaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: dayjs().startOf('month').toDate(),
    to: dayjs().endOf('month').toDate(),
  });
  const [isExporting, setIsExporting] = useState(false);

  // Prepare params for API call
  const params: GetBalanceSheetParams = {
    asOfDate: dateRange.to ? dayjs(dateRange.to).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD'),
  };

  const { data: balanceSheetData, isLoading, error, refetch } = useGetBalanceSheet(params);

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
    toast.success("Data neraca saldo berhasil diperbarui.");
  };

  // Handle export
  const handleExport = async (format: 'excel' | 'csv') => {
    if (!balanceSheetData) {
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
        'Debit': 'Debit',
        'Kredit': 'Kredit'
      });

      // Add AKTIVA section
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'AKTIVA',
        'Debit': '',
        'Kredit': ''
      });

      // Add AKTIVA LANCAR
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'AKTIVA LANCAR',
        'Debit': '',
        'Kredit': ''
      });

      // Add current assets
      if (balanceSheetData.assets?.current_assets?.length > 0) {
        balanceSheetData.assets.current_assets.forEach((item: any) => {
          exportData.push({
            'No Akun': item.account_code || '-',
            'Nama Akun': item.account_name || '-',
            'Debit': item.running_balance > 0 ? item.running_balance : 0,
            'Kredit': item.running_balance < 0 ? Math.abs(item.running_balance) : 0
          });
        });
      }

      // Add AKTIVA TETAP
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'AKTIVA TETAP',
        'Debit': '',
        'Kredit': ''
      });

      // Add fixed assets
      if (balanceSheetData.assets?.fixed_assets?.length > 0) {
        balanceSheetData.assets.fixed_assets.forEach((item: any) => {
          exportData.push({
            'No Akun': item.account_code || '-',
            'Nama Akun': item.account_name || '-',
            'Debit': item.running_balance > 0 ? item.running_balance : 0,
            'Kredit': item.running_balance < 0 ? Math.abs(item.running_balance) : 0
          });
        });
      }

      // Add TOTAL AKTIVA
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'TOTAL AKTIVA',
        'Debit': balanceSheetData.assets?.total_assets || 0,
        'Kredit': 0
      });

      // Add empty row
      exportData.push({
        'No Akun': '',
        'Nama Akun': '',
        'Debit': '',
        'Kredit': ''
      });

      // Add PASIVA section
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'PASIVA',
        'Debit': '',
        'Kredit': ''
      });

      // Add KEWAJIBAN
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'KEWAJIBAN',
        'Debit': '',
        'Kredit': ''
      });

      // Add current liabilities
      if (balanceSheetData.liabilities?.current_liabilities?.length > 0) {
        balanceSheetData.liabilities.current_liabilities.forEach((item: any) => {
          exportData.push({
            'No Akun': item.account_code || '-',
            'Nama Akun': item.account_name || '-',
            'Debit': item.running_balance < 0 ? Math.abs(item.running_balance) : 0,
            'Kredit': item.running_balance > 0 ? item.running_balance : 0
          });
        });
      }

      // Add long term liabilities
      if (balanceSheetData.liabilities?.long_term_liabilities?.length > 0) {
        balanceSheetData.liabilities.long_term_liabilities.forEach((item: any) => {
          exportData.push({
            'No Akun': item.account_code || '-',
            'Nama Akun': item.account_name || '-',
            'Debit': item.running_balance < 0 ? Math.abs(item.running_balance) : 0,
            'Kredit': item.running_balance > 0 ? item.running_balance : 0
          });
        });
      }

      // Add TOTAL KEWAJIBAN
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'TOTAL KEWAJIBAN',
        'Debit': 0,
        'Kredit': balanceSheetData.liabilities?.total_liabilities || 0
      });

      // Add EKUITAS
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'EKUITAS',
        'Debit': '',
        'Kredit': ''
      });

      // Add equity accounts
      if (balanceSheetData.equity?.accounts?.length > 0) {
        balanceSheetData.equity.accounts.forEach((item: any) => {
          exportData.push({
            'No Akun': item.account_code || '-',
            'Nama Akun': item.account_name || '-',
            'Debit': item.running_balance < 0 ? Math.abs(item.running_balance) : 0,
            'Kredit': item.running_balance > 0 ? item.running_balance : 0
          });
        });
      }

      // Add TOTAL EKUITAS
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'TOTAL EKUITAS',
        'Debit': 0,
        'Kredit': balanceSheetData.equity?.total_equity || 0
      });

      // Add TOTAL PASIVA
      exportData.push({
        'No Akun': '',
        'Nama Akun': 'TOTAL PASIVA',
        'Debit': 0,
        'Kredit': balanceSheetData.total_liabilities_equity || 0
      });

      if (format === 'csv') {
        const csvContent = convertToCSV(exportData);
        downloadFile(csvContent, `neraca_saldo_${dayjs().format('YYYY-MM-DD')}.csv`, 'text/csv');
      } else {
        const excelContent = convertToExcel(exportData);
        downloadFile(excelContent, `neraca_saldo_${dayjs().format('YYYY-MM-DD')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', true);
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Neraca Saldo");
    
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
      account.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.account_code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredCurrentAssets = filterAccounts(balanceSheetData?.assets?.current_assets || []);
  const filteredFixedAssets = filterAccounts(balanceSheetData?.assets?.fixed_assets || []);
  const filteredCurrentLiabilities = filterAccounts(balanceSheetData?.liabilities?.current_liabilities || []);
  const filteredLongTermLiabilities = filterAccounts(balanceSheetData?.liabilities?.long_term_liabilities || []);
  const filteredEquityAccounts = filterAccounts(balanceSheetData?.equity?.accounts || []);

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
          <Heading title="Laporan Neraca Saldo" description="Laporan neraca saldo realisasi keuangan" />
      </div>
      <Separator />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Neraca Saldo Realisasi</CardTitle>
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

              {/* Table Neraca Saldo */}
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
                        Debit
                  </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        Kredit
                  </th>
                </tr>
              </thead>
              <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          Loading data neraca saldo...
                        </td>
                      </tr>
                    ) : balanceSheetData ? (
                      <>
                        {/* AKTIVA Section - Header */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900" colSpan={4}>
                            AKTIVA
                          </td>
                        </tr>
                        
                        {/* AKTIVA LANCAR - Header */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800" colSpan={4}>
                            AKTIVA LANCAR
                          </td>
                        </tr>
                        
                        {/* Data AKTIVA LANCAR */}
                        {filteredCurrentAssets.length > 0 ? (
                          filteredCurrentAssets.map((item: any, index: number) => (
                            <tr key={`current-asset-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                {item.running_balance > 0 ? formatRupiah(item.running_balance) : '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                {item.running_balance < 0 ? formatRupiah(Math.abs(item.running_balance)) : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-2 px-4 text-sm text-gray-500 italic" colSpan={4}>
                              {searchQuery.trim() ? 'Tidak ada data aktiva lancar yang sesuai dengan pencarian' : 'Belum ada data aktiva lancar'}
                            </td>
                          </tr>
                        )}
                        
                        {/* AKTIVA TETAP - Header */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800" colSpan={4}>
                            AKTIVA TETAP
                          </td>
                        </tr>
                        
                        {/* Data AKTIVA TETAP */}
                        {filteredFixedAssets.length > 0 ? (
                          filteredFixedAssets.map((item: any, index: number) => (
                            <tr key={`fixed-asset-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                {item.running_balance > 0 ? formatRupiah(item.running_balance) : '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                {item.running_balance < 0 ? formatRupiah(Math.abs(item.running_balance)) : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-2 px-4 text-sm text-gray-500 italic" colSpan={4}>
                              Belum ada data aktiva tetap
                            </td>
                          </tr>
                        )}
                        
                        {/* TOTAL AKTIVA */}
                        <tr className="bg-gray-100 border-t-2 border-gray-400 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={2}>
                            TOTAL AKTIVA
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right border-r border-gray-300">
                            {formatRupiah(balanceSheetData.assets?.total_assets || 0)}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                            -
                          </td>
                        </tr>

                        {/* Empty row */}
                        <tr>
                          <td className="py-2" colSpan={4}></td>
                        </tr>
                        
                        {/* PASIVA Section - Header */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900" colSpan={4}>
                            PASIVA
                          </td>
                        </tr>
                        
                        {/* KEWAJIBAN - Header */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800" colSpan={4}>
                            KEWAJIBAN
                          </td>
                        </tr>
                        
                        {/* Data KEWAJIBAN LANCAR */}
                        {filteredCurrentLiabilities.length > 0 ? (
                          filteredCurrentLiabilities.map((item: any, index: number) => (
                            <tr key={`current-liability-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                {item.running_balance < 0 ? formatRupiah(Math.abs(item.running_balance)) : '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                {item.running_balance > 0 ? formatRupiah(item.running_balance) : '-'}
                              </td>
                            </tr>
                          ))
                        ) : null}
                        
                        {/* Data KEWAJIBAN JANGKA PANJANG */}
                        {filteredLongTermLiabilities.length > 0 ? (
                          filteredLongTermLiabilities.map((item: any, index: number) => (
                            <tr key={`long-term-liability-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                {item.running_balance < 0 ? formatRupiah(Math.abs(item.running_balance)) : '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                {item.running_balance > 0 ? formatRupiah(item.running_balance) : '-'}
                              </td>
                            </tr>
                          ))
                        ) : null}

                        {/* Show message if no liabilities */}
                        {(filteredCurrentLiabilities.length === 0 && filteredLongTermLiabilities.length === 0) && (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-2 px-4 text-sm text-gray-500 italic" colSpan={4}>
                              Belum ada data kewajiban
                            </td>
                          </tr>
                        )}
                        
                        {/* TOTAL KEWAJIBAN */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={2}>
                            TOTAL KEWAJIBAN
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right border-r border-gray-300">
                            -
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                            {formatRupiah(balanceSheetData.liabilities?.total_liabilities || 0)}
                          </td>
                </tr>
                        
                        {/* EKUITAS - Header */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800" colSpan={4}>
                            EKUITAS
                          </td>
                </tr>
                        
                        {/* Data EKUITAS */}
                        {filteredEquityAccounts.length > 0 ? (
                          filteredEquityAccounts.map((item: any, index: number) => (
                            <tr key={`equity-${index}`} className="bg-white hover:bg-gray-50 border-b border-gray-200">
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_code || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 border-r border-gray-300">
                                {item.account_name || '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right border-r border-gray-300">
                                {item.running_balance < 0 ? formatRupiah(Math.abs(item.running_balance)) : '-'}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700 text-right">
                                {item.running_balance > 0 ? formatRupiah(item.running_balance) : '-'}
                              </td>
                </tr>
                          ))
                        ) : (
                          <tr className="bg-white border-b border-gray-200">
                            <td className="py-2 px-4 text-sm text-gray-500 italic" colSpan={4}>
                              Belum ada data ekuitas
                            </td>
                </tr>
                        )}
                        
                        {/* TOTAL EKUITAS */}
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-300" colSpan={2}>
                            TOTAL EKUITAS
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right border-r border-gray-300">
                            -
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                            {formatRupiah(balanceSheetData.equity?.total_equity || 0)}
                          </td>
                </tr>
                        
                        {/* TOTAL PASIVA */}
                        <tr className="bg-blue-50 border-t-2 border-blue-400">
                          <td className="py-3 px-4 text-sm font-bold text-blue-900 border-r border-blue-300" colSpan={2}>
                            TOTAL PASIVA
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-blue-900 text-right border-r border-blue-300">
                            -
                          </td>
                          <td className="py-3 px-4 text-sm font-bold text-blue-900 text-right">
                            {formatRupiah(balanceSheetData.total_liabilities_equity || 0)}
                          </td>
                </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada data neraca saldo
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