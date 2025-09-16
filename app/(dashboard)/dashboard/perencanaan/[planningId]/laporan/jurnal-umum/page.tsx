"use client";

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGetPlanningEntries, useGetPlanningAccounts } from '@/hooks/api/usePerencanaan';
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
  console.log('Converting API item to jurnal umum row format:', apiItem);
  
  // Validate apiItem
  if (!apiItem) {
    console.error('API item is undefined or null');
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

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Build query parameters untuk API
  const queryParams = useMemo(() => ({
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(dateFrom ? { date_from: dateFrom.toISOString() } : {}),
    ...(dateTo ? { date_to: dateTo.toISOString() } : {}),
    page: 1,
    limit: 100
  }), [searchQuery, dateFrom, dateTo]);

  // Fetch data dari API
  const { data: entriesResponse, isLoading, error } = useGetPlanningEntries(planningId, queryParams);
  const { data: accountsResponse } = useGetPlanningAccounts({ page: 1, limit: 1000 });

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
    console.log('Processing jurnal umum entries response:', entriesResponse);
    if (!entriesResponse?.items || !Array.isArray(entriesResponse.items)) {
      console.log('No valid items in response');
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
    console.log('Searching with params:', queryParams);
  };

  // Handle rekap
  const handleRekap = () => {
    toast({
      title: 'Rekap Jurnal Umum',
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
          <CardTitle>Jurnal Umum Perencanaan</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search dan Filter Section */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1 min-w-[300px]">
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
              Rekap Jurnal Umum Perencanaan
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
  );
}
