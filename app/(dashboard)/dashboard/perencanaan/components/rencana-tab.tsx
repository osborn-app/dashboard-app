"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Calendar, RefreshCw } from 'lucide-react';
import { RencanaTable } from '@/components/tables/rencana-tables/rencana-table';
import { createRencanaColumns, RencanaItem } from '@/components/tables/rencana-tables/columns';
import { CreateRencanaDialog } from './create-rencana-dialog';
import { useGetPlanningEntries, useCreatePlanningEntry, useUpdatePlanningEntry, useDeletePlanningEntry } from '@/hooks/api/usePerencanaan';
import { useToast } from '@/hooks/use-toast';

interface RencanaTabProps {
  planningId: string;
}

// Helper function to convert API response to RencanaItem format
const convertApiResponseToRencanaItem = (apiItem: any): RencanaItem => {
  console.log('Converting API item:', apiItem);
  
  // Validate apiItem
  if (!apiItem) {
    console.error('API item is undefined or null');
    return {
      id: '0',
      tanggal: '',
      namaAkun: 'Unknown Account',
      debit: 0,
      kredit: 0,
      keterangan: '',
      status: 'belum',
      planningId: '0',
      rencanaId: '0',
      transactionGroup: 'group_0',
      isFirstInGroup: true
    };
  }
  
  const debitName = apiItem.account_debit?.name || 'Unknown Debit';
  const creditName = apiItem.account_credit?.name || 'Unknown Credit';
  
  return {
    id: apiItem.id?.toString() || '0',
    tanggal: apiItem.date || '',
    namaAkun: `${debitName} → ${creditName}`,
    debit: apiItem.amount || 0,
    kredit: apiItem.amount || 0,
    keterangan: apiItem.note || '',
    status: 'belum', // Default status, bisa diupdate sesuai kebutuhan
    planningId: apiItem.planning_id?.toString() || '0',
    rencanaId: apiItem.id?.toString() || '0', // Add missing property
    transactionGroup: `group_${apiItem.id || 0}`, // Add missing property
    isFirstInGroup: true // Add missing property
  };
};

// Helper function to convert RencanaItem to CreateRencanaFormData
const convertRencanaItemToFormData = (item: RencanaItem): any => {
  return {
    name: item.keterangan || '',
    planningDate: item.tanggal || '',
    accounts: [
      {
        id: item.id,
        accountName: item.namaAkun,
        debit: item.debit,
        credit: item.kredit
      }
    ]
  };
};

export function RencanaTab({ planningId }: RencanaTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const { toast } = useToast();

  // Build query parameters for API
  const queryParams = useMemo(() => ({
    ...(searchQuery ? { q: searchQuery } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
    page: 1,
    limit: 100
  }), [searchQuery, dateFrom, dateTo]);

  // Use API hooks
  const { data: entriesResponse, isLoading, error, refetch } = useGetPlanningEntries(planningId, queryParams);
  const createMutation = useCreatePlanningEntry(planningId);
  const updateMutation = useUpdatePlanningEntry(planningId, editingItem?.id || '');

  // Convert API response to RencanaItem format
  const rencanaData = useMemo(() => {
    console.log('Processing entries response:', entriesResponse);
    if (!entriesResponse?.items || !Array.isArray(entriesResponse.items)) {
      console.log('No valid items in response');
      return [];
    }
    return entriesResponse.items.map(convertApiResponseToRencanaItem);
  }, [entriesResponse]);

  const handleCreateRencana = async (data: any) => {
    try {
      console.log('Form data received:', data);
      
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
      if (!firstAccount?.account_id) {
        toast({
          title: 'Error',
          description: 'Pilih akun terlebih dahulu',
          variant: 'destructive',
        });
        return;
      }
      
      // Convert form data to API format
      const debitAmount = parseFloat(firstAccount.debit || '0');
      const creditAmount = parseFloat(firstAccount.credit || '0');
      const totalAmount = debitAmount + creditAmount;
      
      // Validate amount
      if (totalAmount <= 0) {
        toast({
          title: 'Error',
          description: 'Jumlah debit atau kredit harus lebih dari 0',
          variant: 'destructive',
        });
        return;
      }
      
      const apiData = {
        date: data.planningDate,
        account_debit_id: parseInt(firstAccount.account_id),
        account_credit_id: parseInt(firstAccount.account_id), // Same account for both debit and credit
        amount: totalAmount,
        note: data.name || null
      };

      console.log('Creating planning entry with data:', apiData);
      const response = await createMutation.mutateAsync(apiData);
      console.log('Planning entry response:', response);
      
      toast({
        title: 'Success',
        description: 'Rencana berhasil dibuat',
      });
      
    setShowCreateDialog(false);
      setEditingItem(null);
      refetch();
    } catch (error) {
      console.error('Error creating rencana:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat rencana',
        variant: 'destructive',
      });
    }
  };

  const handleEditRencana = (item: RencanaItem) => {
    const formData = convertRencanaItemToFormData(item);
    setEditingItem({ ...formData, id: item.id });
    setShowCreateDialog(true);
  };

  const handleDeleteRencana = async (item: RencanaItem) => {
    try {
      // Use the delete mutation hook with the correct parameters
      const deleteMutation = useDeletePlanningEntry(planningId, item.id);
      await deleteMutation.mutateAsync();
      
      toast({
        title: 'Success',
        description: 'Rencana berhasil dihapus',
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting rencana:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus rencana',
        variant: 'destructive',
      });
    }
  };

  const handleViewRencana = (item: RencanaItem) => {
    console.log('Viewing rencana:', item);
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
      <div className="space-y-3">
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
        <div className="flex items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Input
                type="date"
                placeholder="Tanggal Mulai"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            
            <div className="relative flex-1">
              <Input
                type="date"
                placeholder="Tanggal Selesai"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          
          {/* Account Filter */}
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Semua Akun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Akun</SelectItem>
              <SelectItem value="kas">Kas & Bank</SelectItem>
              <SelectItem value="inventaris">Inventaris</SelectItem>
              <SelectItem value="kendaraan">Kendaraan</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="belum">Belum Terealisasi</SelectItem>
              <SelectItem value="sudah">Sudah Terealisasi</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rencana Table */}
      <Card>
        <CardContent className="p-0">
          <RencanaTable
            columns={createRencanaColumns({
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
      />
    </div>
  );
}