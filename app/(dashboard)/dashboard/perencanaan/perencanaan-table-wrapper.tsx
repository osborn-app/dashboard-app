"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { CreatePerencanaanDialog } from './components/create-perencanaan-dialog';
import { EditPerencanaanDialog } from './components/edit-perencanaan-dialog';
import { DeletePerencanaanDialog } from './components/delete-perencanaan-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  getPerencanaan, 
  createPerencanaan, 
  updatePerencanaan, 
  deletePerencanaan
} from '@/client/perencanaanClient';
import { dummyPerencanaanData, dummyRencanaAnggaran } from './data/dummy-data';
import { PerencanaanTable } from '@/components/tables/perencanaan-tables/perencanaan-table';
import { createPerencanaanColumns, PerencanaanItem } from '@/components/tables/perencanaan-tables/columns';
import { Perencanaan } from '@/types/perencanaan';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface PerencanaanTableWrapperProps {
  userRole: string;
}

const PerencanaanTableWrapper = ({ userRole }: PerencanaanTableWrapperProps) => {
  // Calculate total value from rencana anggaran
  const calculateTotalValue = (planningId: string) => {
    const rencana = dummyRencanaAnggaran.find(r => r.planningId === planningId);
    return rencana ? rencana.generalAmount : 0;
  };

  // Update perencanaan data with calculated total values
  const perencanaanWithTotals = dummyPerencanaanData.map(item => ({
    ...item,
    totalValue: calculateTotalValue(item.id)
  }));

  const [perencanaan, setPerencanaan] = useState<Perencanaan[]>(perencanaanWithTotals);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Perencanaan | null>(null);
  const [deletingItem, setDeletingItem] = useState<Perencanaan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Get URL parameters
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;

  // Build query parameters for API
  const perencanaanParams = useMemo(() => ({
    limit: pageLimit,
    page: page,
    ...(searchQuery ? { search: searchQuery } : {}),
  }), [pageLimit, page, searchQuery]);

  // Filter data based on search query
  const filteredPerencanaan = useMemo(() => {
    if (!searchQuery) return perencanaan;
    return perencanaan.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [perencanaan, searchQuery]);

  const handleCreatePerencanaan = async (newItem: Omit<Perencanaan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Simulate API call with dummy data
      const createdItem: Perencanaan = {
        ...newItem,
        id: (perencanaan.length + 1).toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setPerencanaan([createdItem, ...perencanaan]);
      
      toast({
        title: 'Success',
        description: 'Perencanaan berhasil dibuat',
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating perencanaan:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat perencanaan',
        variant: 'destructive',
      });
    }
  };

  const handleEditPerencanaan = (item: Perencanaan) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleUpdatePerencanaan = async (updatedData: Partial<Perencanaan>) => {
    if (!editingItem) return;
    
    try {
      // Update local state
      setPerencanaan(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...updatedData, updatedAt: new Date().toISOString() }
          : item
      ));
      
      toast({
        title: 'Success',
        description: 'Perencanaan berhasil diupdate',
      });
      
      setShowEditDialog(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating perencanaan:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengupdate perencanaan',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePerencanaan = (item: Perencanaan) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async (item: Perencanaan) => {
    try {
      // Remove from local state
      setPerencanaan(prev => prev.filter(per => per.id !== item.id));
      
      toast({
        title: 'Success',
        description: 'Perencanaan berhasil dihapus',
      });
      
      setShowDeleteDialog(false);
      setDeletingItem(null);
    } catch (error) {
      console.error('Error deleting perencanaan:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus perencanaan',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Search and Add Button Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari Perencanaan......"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {userRole !== "owner" && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Perencanaan
          </Button>
        )}
      </div>

      {/* Perencanaan Table */}
      <Card>
        <CardContent className="p-0">
          <PerencanaanTable
            columns={createPerencanaanColumns({
              onEdit: handleEditPerencanaan,
              onDelete: handleDeletePerencanaan
            })}
            data={filteredPerencanaan}
            searchKey="name"
            totalUsers={filteredPerencanaan.length}
            pageCount={Math.ceil(filteredPerencanaan.length / 10)}
            pageNo={1}
            searchQuery={searchQuery}
            sorting={[]}
            setSorting={() => {}}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreatePerencanaanDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreatePerencanaan}
      />

      {editingItem && (
        <EditPerencanaanDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          item={editingItem}
          onSubmit={handleUpdatePerencanaan}
        />
      )}

      <DeletePerencanaanDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        item={deletingItem}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default PerencanaanTableWrapper;
