"use client";

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Calendar, RefreshCw } from 'lucide-react';
import { RencanaTable } from '@/components/tables/rencana-tables/rencana-table';
import { createRencanaRowColumns, RencanaRowItem } from '@/components/tables/rencana-tables/columns';
import { CreateRencanaDialog } from './create-rencana-dialog';
import { useGetPlanningEntries, useCreatePlanningEntry, useUpdatePlanningEntry, useDeletePlanningEntry, useGetPlanningAccounts } from '@/hooks/api/usePerencanaan';
import { useToast } from '@/hooks/use-toast';
import { convertDateToISO } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RencanaTabProps {
  planningId: string;
}

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

// Helper function to convert API response to RencanaRowItem format
const convertApiResponseToRencanaItem = (apiItem: any, accountMap: Map<string, {name: string, code: string}>): RencanaRowItem => {
  // Validate apiItem
  if (!apiItem) {
    return {
      id: '0',
      tanggal: '',
      status: 'Belum Terealisasi',
      keterangan: '',
      planningId: '0',
      rencanaId: '0',
      transactionGroup: 'group_0',
      isFirstInGroup: true,
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
  
  // Format nama akun
  const namaAkun = debitAccount && creditAccount 
    ? `${debitCode} - ${debitName} dan ${creditCode} - ${creditName}`
    : `Debit: ${debitName} | Credit: ${creditName}`;
  
  return {
    id: apiItem.id?.toString() || '0',
    tanggal: apiItem.date || '',
    status: 'Belum Terealisasi',
    keterangan: apiItem.note || '',
    planningId: apiItem.planning_id?.toString() || '0',
    rencanaId: apiItem.id?.toString() || '0',
    transactionGroup: `group_${apiItem.id || 0}`,
    isFirstInGroup: true,
    rows: [
      {
        namaAkun,
        debit: apiItem.amount || 0,
        kredit: apiItem.amount || 0,
        account_debit_id: apiItem.account_debit_id?.toString() || '',
        account_credit_id: apiItem.account_credit_id?.toString() || ''
      }
    ]
  };
};

// Helper function to convert API response to RencanaRowItem format for merged cells
const convertApiResponseToRencanaRowItem = (apiItem: any, accountMap: Map<string, {name: string, code: string}>): RencanaRowItem => {
  // Validate apiItem
  if (!apiItem) {
    return {
      id: '0',
      tanggal: '',
      status: 'Belum Terealisasi',
      keterangan: '',
      planningId: '0',
      rencanaId: '0',
      transactionGroup: 'group_0',
      isFirstInGroup: true,
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
      kredit: 0,
      account_debit_id: apiItem.account_debit_id?.toString() || '',
      account_credit_id: apiItem.account_credit_id?.toString() || ''
    },
    {
      namaAkun: `${creditCode} - ${creditName}`,
      debit: 0,
      kredit: apiItem.amount || 0,
      account_debit_id: apiItem.account_debit_id?.toString() || '',
      account_credit_id: apiItem.account_credit_id?.toString() || ''
    }
  ];
  
  return {
    id: apiItem.id?.toString() || '0',
    tanggal: apiItem.date || '',
    status: 'Belum Terealisasi',
    keterangan: apiItem.note || '',
    planningId: apiItem.planning_id?.toString() || '0',
    rencanaId: apiItem.id?.toString() || '0',
    transactionGroup: `group_${apiItem.id || 0}`,
    isFirstInGroup: true,
    rows
  };
};

// Helper function to convert RencanaRowItem to CreateRencanaFormData
const convertRencanaItemToFormData = (item: RencanaRowItem): any => {
  return {
    name: item.keterangan || '',
    planningDate: item.tanggal || '',
    accounts: [
      {
        id: item.id,
        accountName: item.rows[0]?.namaAkun || '',
        debit: item.rows[0]?.debit || 0,
        credit: item.rows[1]?.kredit || 0
      }
    ]
  };
};

export function PerencanaanRencanaTab({ planningId }: RencanaTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<RencanaRowItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  
  const { toast } = useToast();

  // Build query parameters for API
  const queryParams = useMemo(() => ({
    ...(searchQuery ? { q: searchQuery } : {}),
    ...(dateFrom ? { date_from: convertDateToISO(dateFrom) } : {}),
    ...(dateTo ? { date_to: convertDateToISO(dateTo) } : {}),
    page: 1,
    limit: 100
  }), [searchQuery, dateFrom, dateTo]);

  // Use API hooks
  const { data: entriesResponse, isLoading, error, refetch } = useGetPlanningEntries(planningId, queryParams);
  const { data: accountsResponse } = useGetPlanningAccounts({ page: 1, limit: 1000 });
  const createMutation = useCreatePlanningEntry(planningId);
  const updateMutation = useUpdatePlanningEntry(planningId, editingItem?.id ? editingItem.id.split('_')[0] : '');

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
  const rencanaData = useMemo(() => {
    if (!entriesResponse?.items || !Array.isArray(entriesResponse.items)) {
      return [];
    }
    
    const flatData: RencanaRowItem[] = [];
    entriesResponse.items.forEach((item: PlanningEntryResponse) => {
      const rowItem = convertApiResponseToRencanaRowItem(item, accountMap);
      // Add multiple rows for each transaction (debit and credit)
      rowItem.rows.forEach((_, index) => {
        flatData.push({
          ...rowItem,
          // Add a unique key for each row
          id: `${rowItem.id}_${index}`,
          isFirstInGroup: index === 0
        });
      });
    });
    
    return flatData;
  }, [entriesResponse, accountMap]);

  const handleCreateRencana = async (data: any) => {
    try {
      
      // Validate form data structure
      if (!data || !data.accounts || !Array.isArray(data.accounts) || data.accounts.length === 0) {
        toast({
          title: 'Error',
          description: 'Data form tidak valid',
          variant: 'destructive',
        });
        return;
      }
      
      const firstAccount = data.accounts[0];
      
      // Validate account selection
      if (!firstAccount?.account_debit_id || !firstAccount?.account_credit_id) {
        toast({
          title: 'Error',
          description: 'Pilih akun debit dan credit terlebih dahulu',
          variant: 'destructive',
        });
        return;
      }
      
      // Convert form data to API format
      const debitAmount = parseFloat(firstAccount.debit || '0');
      const creditAmount = parseFloat(firstAccount.credit || '0');
      
      // Validate amount - debit and credit should be equal for proper journal entry
      if (debitAmount <= 0 || creditAmount <= 0) {
        toast({
          title: 'Error',
          description: 'Jumlah debit dan kredit harus lebih dari 0',
          variant: 'destructive',
        });
        return;
      }
      
      if (debitAmount !== creditAmount) {
        toast({
          title: 'Error',
          description: 'Jumlah debit dan kredit harus sama',
          variant: 'destructive',
        });
        return;
      }
      
      const totalAmount = debitAmount; // Use debit amount as total
      
      const apiData = {
        date: convertDateToISO(data.planningDate),
        account_debit_id: parseInt(firstAccount.account_debit_id),
        account_credit_id: parseInt(firstAccount.account_credit_id),
        amount: totalAmount,
        note: data.name || null
      };

      // Check if we're in edit mode or create mode
      if (editingItem) {
        // Use updateMutation for edit mode
        const response = await updateMutation.mutateAsync(apiData);
        
        toast({
          title: 'Success',
          description: 'Rencana berhasil diperbarui',
        });
      } else {
        // Use createMutation for create mode
        const response = await createMutation.mutateAsync(apiData);
        
        toast({
          title: 'Success',
          description: 'Rencana berhasil dibuat',
        });
      }
      
      setShowCreateDialog(false);
      setEditingItem(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: editingItem ? 'Gagal memperbarui rencana' : 'Gagal membuat rencana',
        variant: 'destructive',
      });
    }
  };

  const handleEditRencana = (item: RencanaRowItem) => {
    const baseId = item.id.split('_')[0];
    
    // Convert RencanaRowItem back to form data format
    const formData = {
      name: item.keterangan || '',
      planningDate: item.tanggal || '',
      accounts: [{
        id: '1',
        accountName: '',
        account_debit_id: item.rows[0]?.account_debit_id || '',
        account_credit_id: item.rows[0]?.account_credit_id || '',
        debit: item.rows[0]?.debit || 0,
        credit: item.rows[1]?.kredit || 0
      }]
    };
    setEditingItem({ ...formData, id: item.id });
    setShowCreateDialog(true);
  };

  const handleDeleteFromDialog = () => {
    // Refresh the data after deletion
    refetch();
  };

  const handleDeleteRencana = useCallback(async (item: RencanaRowItem) => {
    try {
      // Set the item to be deleted first
      setDeletingItem(item);
      
      // Import the API client directly
      const { deletePlanningEntry } = await import('@/client/perencanaanClient');
      await deletePlanningEntry(planningId, item.id.split('_')[0]);
      
      toast({
        title: 'Success',
        description: 'Rencana berhasil dihapus',
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus rencana',
        variant: 'destructive',
      });
    } finally {
      setDeletingItem(null);
    }
  }, [planningId, refetch, toast]);

  const handleViewRencana = (item: RencanaRowItem) => {
    // View rencana functionality
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rencana data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600">Error loading rencana data</p>
          <Button onClick={() => refetch()} className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Section */}
      <div className="space-y-4">
        {/* Top Row: Search and Action Buttons */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari akun....."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Rekap Rencana
          </Button>
          
          <Button 
            onClick={() => {
              setEditingItem(null); // Reset editing item when creating new
              setShowCreateDialog(true);
            }} 
            size="sm"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Membuat...
              </>
            ) : (
              <>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Rencana
              </>
            )}
          </Button>
        </div>
        
        {/* Bottom Row: Date Range and Filters */}
        <div className="grid grid-cols-12 gap-4 w-full">
          {/* Date Range - Takes 4 columns */}
          <div className="col-span-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                type="date"
                placeholder="mm/dd/yyyy"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            
            <div className="relative flex-1">
              <Input
                type="date"
                placeholder="mm/dd/yyyy"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          
          {/* Account Filter - Takes 4 columns */}
          <div className="col-span-4">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Akun" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Cari akun..."
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    className="h-8"
                  />
                </div>
                <ScrollArea className="max-h-60 overflow-y-auto">
                  <SelectItem value="all">Semua Akun</SelectItem>
                  {accountsResponse?.items
                    ?.filter((account: any) => 
                      account.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
                      account.code.toLowerCase().includes(accountSearch.toLowerCase())
                    )
                    ?.map((account: any) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs">{account.code}</span>
                          <span className="text-sm">{account.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          
          {/* Status Filter - Takes 4 columns */}
          <div className="col-span-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="belum">Belum Terealisasi</SelectItem>
                <SelectItem value="sudah">Sudah Terealisasi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Rencana Table */}
      <Card>
        <CardContent className="p-0">
          <RencanaTable
            columns={createRencanaRowColumns({
              onEdit: handleEditRencana,
              onDelete: handleDeleteRencana,
              onView: handleViewRencana
            })}
            data={rencanaData}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <CreateRencanaDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateRencana}
        editingData={editingItem}
        planningId={planningId}
        entryId={editingItem?.id ? parseInt(editingItem.id.split('_')[0]) : undefined}
        onDelete={handleDeleteFromDialog}
      />
    </div>
  );
}