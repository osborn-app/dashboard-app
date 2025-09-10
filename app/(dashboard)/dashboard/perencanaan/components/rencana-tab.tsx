"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Calendar, RefreshCw } from 'lucide-react';
import { dummyRencanaTransactions } from '../data/dummy-data';
import { RencanaTable } from '@/components/tables/rencana-tables/rencana-table';
import { createRencanaColumns, RencanaItem } from '@/components/tables/rencana-tables/columns';
import { CreateRencanaDialog } from './create-rencana-dialog';

interface RencanaTabProps {
  planningId: string;
}

export function RencanaTab({ planningId }: RencanaTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<RencanaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Filter rencana data by planning ID
  const rencanaData = dummyRencanaTransactions.filter(item => item.planningId === planningId);

  const handleCreateRencana = (data: any) => {
    console.log('Creating rencana:', data);
    setShowCreateDialog(false);
  };

  const handleEditRencana = (item: RencanaItem) => {
    setEditingItem(item);
    setShowCreateDialog(true);
  };

  const handleDeleteRencana = (item: RencanaItem) => {
    console.log('Deleting rencana:', item);
  };

  const handleViewRencana = (item: RencanaItem) => {
    console.log('Viewing rencana:', item);
  };

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
          
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Rekap Rencana
          </Button>
          
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Rencana
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
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            
            <div className="relative flex-1">
              <Input
                type="date"
                placeholder="Tanggal Selesai"
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
