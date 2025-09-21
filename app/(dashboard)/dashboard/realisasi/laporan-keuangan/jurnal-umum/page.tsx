"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Loader2, Download, RefreshCw, FileText, Search, X } from "lucide-react";
import { useGetGeneralJournal, GetGeneralJournalParams, GeneralJournalEntry, GeneralJournalResponse } from "@/hooks/api/useFinancialReports";
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import BreadCrumb from "@/components/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { RencanaTable } from "@/components/tables/rencana-tables/rencana-table";
import { createJurnalUmumRowColumns, JurnalUmumRowItem } from "@/components/tables/jurnal-umum-tables/columns";
import { useMemo } from "react";

const breadcrumbItems = [
  { title: "Realisasi", link: "/dashboard/realisasi" },
  { title: "Jurnal Umum", link: "/dashboard/realisasi/laporan-keuangan/jurnal-umum" }
];

// Helper function to convert API response to JurnalUmumRowItem format for merged cells
const convertApiResponseToJurnalUmumRowItem = (transaction: GeneralJournalEntry): JurnalUmumRowItem => {
  // Create rows for debit and credit entries
  const rows = transaction.entries.map(entry => ({
    namaAkun: `${entry.account.code} - ${entry.account.name}`,
    debit: entry.entry_type === 'DEBIT' ? entry.amount : 0,
    kredit: entry.entry_type === 'CREDIT' ? entry.amount : 0
  }));
  
  return {
    id: transaction.id.toString(),
    tanggal: transaction.transaction_date,
    planningId: transaction.source_id.toString(),
    transactionGroup: `group_${transaction.id}`,
    isFirstInGroup: true,
    status: transaction.is_active ? 'Aktif' : 'Tidak Aktif',
    keterangan: transaction.description,
    rencanaId: transaction.id.toString(),
    rows
  };
};

export default function JurnalUmumPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: dayjs().startOf('month').toDate(),
    to: dayjs().endOf('month').toDate(),
  });
  const [limit, setLimit] = useState<number>(1000);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Prepare params for API call
  const params: GetGeneralJournalParams = {
    startDate: dateRange.from ? dayjs(dateRange.from).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dateRange.to ? dayjs(dateRange.to).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD'),
    limit: limit,
    q: debouncedSearchQuery.trim() || undefined,
  };

  const { data: journalData, isLoading, error, refetch } = useGetGeneralJournal(params);
  
  // Extract transactions and summary from response
  const journalEntries = journalData?.transactions || [];
  const summary = journalData?.summary || { total_debit: 0, total_credit: 0, balance: 0, transaction_count: 0 };

  // Convert API response to flat array for table display with merged cells
  const jurnalUmumData = useMemo(() => {
    if (!journalEntries || !Array.isArray(journalEntries)) {
      return [];
    }
    
    const flatData: JurnalUmumRowItem[] = [];
    journalEntries.forEach((transaction: GeneralJournalEntry) => {
      const rowItem = convertApiResponseToJurnalUmumRowItem(transaction);
      // Add multiple rows for each transaction (debit and credit)
      rowItem.rows.forEach((_, index) => {
        flatData.push({
          ...rowItem,
          // Add a unique key for each row
          id: `${rowItem.id}_${index}`,
          isFirstInGroup: index === 0,
          // Add fields needed by RencanaTable
          status: transaction.is_active ? 'Aktif' : 'Tidak Aktif',
          keterangan: transaction.description,
          rencanaId: transaction.id.toString()
        });
      });
    });
    
    return flatData;
  }, [journalEntries]);

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

  const handleRefresh = () => {
    refetch();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    if (!journalEntries || journalEntries.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    setIsExporting(true);
    try {
      // Flatten the data for export
      const exportData = journalEntries.flatMap((transaction: GeneralJournalEntry) => 
        transaction.entries.map((entry: any) => ({
          'Tanggal Transaksi': dayjs(transaction.transaction_date).format('DD/MM/YYYY HH:mm'),
          'Nomor Referensi': transaction.reference_number,
          'Deskripsi Transaksi': transaction.description,
          'Total Jumlah': transaction.total_amount,
          'Kategori': transaction.category?.name || '-',
          'Catatan': transaction.notes || '-',
          'Tipe Sumber': transaction.source_type,
          'ID Sumber': transaction.source_id,
          'Kode Akun': entry.account.code,
          'Nama Akun': entry.account.name,
          'Tipe Akun': entry.account.type,
          'Tipe Entry': entry.entry_type,
          'Jumlah': entry.amount,
          'Deskripsi Entry': entry.description,
          'Total Debit Transaksi': transaction.summary?.total_debit || 0,
          'Total Credit Transaksi': transaction.summary?.total_credit || 0,
          'Balance Transaksi': transaction.summary?.balance || 0,
        }))
      );

      // Add summary data to export
      const summaryData = [
        {
          'Tanggal Transaksi': 'SUMMARY',
          'Nomor Referensi': 'TOTAL',
          'Deskripsi Transaksi': 'Ringkasan Jurnal Umum',
          'Total Jumlah': summary.total_debit + summary.total_credit,
          'Kategori': '-',
          'Catatan': `Periode: ${dayjs(dateRange.from).format('DD/MM/YYYY')} - ${dayjs(dateRange.to).format('DD/MM/YYYY')}`,
          'Tipe Sumber': '-',
          'ID Sumber': '-',
          'Kode Akun': '-',
          'Nama Akun': 'TOTAL DEBIT',
          'Tipe Akun': '-',
          'Tipe Entry': 'DEBIT',
          'Jumlah': summary.total_debit,
          'Deskripsi Entry': 'Total Debit Keseluruhan',
          'Total Debit Transaksi': summary.total_debit,
          'Total Credit Transaksi': summary.total_credit,
          'Balance Transaksi': summary.balance,
        },
        {
          'Tanggal Transaksi': 'SUMMARY',
          'Nomor Referensi': 'TOTAL',
          'Deskripsi Transaksi': 'Ringkasan Jurnal Umum',
          'Total Jumlah': summary.total_debit + summary.total_credit,
          'Kategori': '-',
          'Catatan': `Jumlah Transaksi: ${summary.transaction_count}`,
          'Tipe Sumber': '-',
          'ID Sumber': '-',
          'Kode Akun': '-',
          'Nama Akun': 'TOTAL CREDIT',
          'Tipe Akun': '-',
          'Tipe Entry': 'CREDIT',
          'Jumlah': summary.total_credit,
          'Deskripsi Entry': 'Total Credit Keseluruhan',
          'Total Debit Transaksi': summary.total_debit,
          'Total Credit Transaksi': summary.total_credit,
          'Balance Transaksi': summary.balance,
        }
      ];

      const finalExportData = [...exportData, ...summaryData];

      if (format === 'csv') {
        const csvContent = convertToCSV(finalExportData);
        downloadFile(csvContent, `jurnal_umum_${dayjs().format('YYYY-MM-DD')}.csv`, 'text/csv');
      } else {
        const excelContent = convertToExcel(finalExportData);
        downloadFile(excelContent, `jurnal_umum_${dayjs().format('YYYY-MM-DD')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', true);
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jurnal Umum");
    
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


  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Error loading journal entries: {error.message}
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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Jurnal Umum
            </h1>
            <p className="text-muted-foreground">
              Lihat dan kelola semua transaksi keuangan dalam bentuk jurnal
            </p>
          </div>
      </div>
      <Separator />

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Kontrol</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search dan Filter Section */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan nomor referensi, deskripsi, atau nama akun..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery !== debouncedSearchQuery ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                ) : searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
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

            {/* Limit Data */}
            <div className="min-w-[120px]">
              <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1,000</SelectItem>
                  <SelectItem value="2000">2,000</SelectItem>
                  <SelectItem value="5000">5,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {debouncedSearchQuery && (
                <Button onClick={handleClearSearch} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
              )}
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => handleExport('excel')} 
                variant="outline" 
                size="sm"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Excel
              </Button>
              <Button 
                onClick={() => handleExport('csv')} 
                variant="outline" 
                size="sm"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Information */}
      <div className="text-sm text-muted-foreground mb-4">
        Periode: {dayjs(dateRange.from).format('DD MMM YYYY')} - {dayjs(dateRange.to).format('DD MMM YYYY')}
        {debouncedSearchQuery && (
          <span className="ml-2 text-blue-600">
            • Filter: "{debouncedSearchQuery}"
          </span>
        )}
      </div>

      {/* Journal Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              Jurnal Umum Realisasi
              {debouncedSearchQuery && (
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  Hasil pencarian untuk: "{debouncedSearchQuery}"
                </div>
              )}
            </div>
            {journalEntries && (
              <span className="text-sm font-normal text-muted-foreground">
                {journalEntries.length} transaksi
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading jurnal umum data...</p>
              </div>
            </div>
          ) : jurnalUmumData.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">
                  {debouncedSearchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Tidak ada data jurnal umum'}
                </p>
                {debouncedSearchQuery && (
                  <p className="text-gray-500 text-sm mt-2">
                    Coba ubah kata kunci pencarian atau hapus filter
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <RencanaTable
                columns={createJurnalUmumRowColumns()}
                data={jurnalUmumData}
                mergedColumns={['tanggal']} // Only merge tanggal column
              />
              
              {/* Footer dengan Total Debit dan Credit */}
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-end items-center text-base font-medium">
                  <div className="flex gap-12">
                    <div>
                      <span className="text-dark">Debit:</span>
                      <span className="ml-2 font-mono text-md">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.total_debit)}
                      </span>
                    </div>
                    <div>
                      <span className="text-dark">Credit:</span>
                      <span className="ml-2 font-mono text-md">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.total_credit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}