"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { CreateInventoryDialog } from './create-inventory-dialog';
import { UpdateStatusDialog } from './update-status-dialog';
import { InventoryEditDialog } from './inventory-edit-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  getInventory, 
  createInventory, 
  updateInventoryStatus, 
  bulkUpdateInventoryStatus, 
  deleteInventory, 
  getInventoryStatistics,
  updateInventory
} from '@/client/inventoryClient';
import { InventoryTable } from '@/components/tables/inventory-tables/inventory-table';
import { createInventoryColumns, InventoryItem } from '@/components/tables/inventory-tables/columns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/spinner';

interface InventoryStats {
  total: number;
  pending: number;
  verified: number;
  totalValue: number;
}

interface InventoryTableWrapperProps {
  userRole: string;
}

const InventoryTableWrapper = ({ userRole }: InventoryTableWrapperProps) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ total: 0, pending: 0, verified: 0, totalValue: 0 });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [currentFilters, setCurrentFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const { toast } = useToast();
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Get URL parameters
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // Build query parameters for API - use useMemo to prevent infinite loops
  const inventoryParams = useMemo(() => ({
    limit: pageLimit,
    page: page,
    ...(currentFilters.search ? { search: currentFilters.search } : {}),
    ...(currentFilters.status ? { status: currentFilters.status } : {}),
    ...(currentFilters.dateFrom ? { dateFrom: currentFilters.dateFrom } : {}),
    ...(currentFilters.dateTo ? { dateTo: currentFilters.dateTo } : {}),
  }), [pageLimit, page, currentFilters.search, currentFilters.status, currentFilters.dateFrom, currentFilters.dateTo]);

  // Use React Query for inventory data
  const { data: inventoryData, isFetching: isFetchingInventory } = useQuery({
    queryKey: ['inventory', inventoryParams],
    queryFn: () => getInventory(inventoryParams),
    enabled: true,
  });

  // Use React Query for statistics
  const { data: statsData, isFetching: isFetchingStats } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: getInventoryStatistics,
    enabled: true,
  });

  // Update inventory state when data changes
  useEffect(() => {
    if (inventoryData?.data) {
      if (inventoryData.data?.data) {
        setInventory(inventoryData.data.data);
      } else if (inventoryData.data?.items) {
        setInventory(inventoryData.data.items);
      } else if (Array.isArray(inventoryData.data)) {
        setInventory(inventoryData.data);
      } else {
        setInventory([]);
      }
    }
  }, [inventoryData]);

  // Update stats state when data changes
  useEffect(() => {
    if (statsData?.data) {
      if (statsData.data?.data) {
        setStats({
          total: statsData.data.data.total || 0,
          pending: statsData.data.data.pending || 0,
          verified: statsData.data.data.verified || 0,
          totalValue: statsData.data.data.totalValue || 0,
        });
      } else if (statsData.data) {
        setStats({
          total: statsData.data.total || 0,
          pending: statsData.data.pending || 0,
          verified: statsData.data.verified || 0,
          totalValue: statsData.data.totalValue || 0,
        });
      }
    }
  }, [statsData]);

  // Memoized handler to avoid re-renders in child effect dependencies
  const handleFiltersChange = useCallback((filters: {
    search: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  }) => {
    setCurrentFilters(prev => {
      if (
        prev.search === filters.search &&
        prev.status === filters.status &&
        prev.dateFrom === filters.dateFrom &&
        prev.dateTo === filters.dateTo
      ) {
        return prev; // no change, avoid rerender
      }
      return filters;
    });
  }, []);

  const handleCreateInventory = async (newItem: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'totalPrice'>) => {
    try {
      const response = await createInventory(newItem);
      
      if (response.data?.data) {
        const createdItem = response.data.data;
        setInventory([createdItem, ...inventory]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          [createdItem.status]: prev[createdItem.status as keyof Pick<InventoryStats, 'pending' | 'verified'>] + 1,
          totalValue: prev.totalValue + (createdItem.quantity * createdItem.unitPrice),
        }));
        
        toast({
          title: 'Success',
          description: 'Inventory item created successfully',
        });
        setShowCreateDialog(false);
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      }
    } catch (error) {
      console.error('Error creating inventory:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat item inventaris',
        variant: 'destructive',
      });
    }
  };

  const handleEditInventory = (item: InventoryItem) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleViewDetail = (item: InventoryItem) => {
    router.push(`/dashboard/inventaris/${item.id}`);
  };

  const handleUpdateStatusFromCell = async (item: InventoryItem, newStatus: 'pending' | 'verified') => {
    try {
      await updateInventoryStatus(item.id, { status: newStatus });
      
      // Update local state
      setInventory(prev => prev.map(inv => 
        inv.id === item.id ? { ...inv, status: newStatus, updatedAt: new Date().toISOString() } : inv
      ));
      
      // Reload statistics
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      
      toast({
        title: 'Success',
        description: `Status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengupdate status inventaris',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateInventory = async (updatedData: Partial<InventoryItem>) => {
    if (!editingItem) return;
    
    try {
      const response = await updateInventory(editingItem.id, updatedData);
      
      if (response.data?.data) {
        // Update local state
        setInventory(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...updatedData, updatedAt: new Date().toISOString() }
            : item
        ));
        
        toast({
          title: 'Success',
          description: 'Inventory item updated successfully',
        });
        
        setShowEditDialog(false);
        setEditingItem(null);
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengupdate item inventaris',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInventory = async (item: InventoryItem) => {
    try {
      await deleteInventory(item.id);
      
      // Remove from local state
      setInventory(prev => prev.filter(inv => inv.id !== item.id));
      
      // Reload statistics
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      
      toast({
        title: 'Success',
        description: 'Inventory item deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus item inventaris',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (ids: number[], status: 'pending' | 'verified') => {
    try {
      if (ids.length === 1) {
        // Single item update
        await updateInventoryStatus(ids[0], { status });
      } else {
        // Bulk update
        await bulkUpdateInventoryStatus({ ids, status });
      }
      
      // Update local state
      setInventory(prev => prev.map(item => 
        ids.includes(item.id) ? { ...item, status, updatedAt: new Date().toISOString() } : item
      ));
      
      // Reload statistics
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      
      toast({
        title: 'Success',
        description: `Status updated to ${status} for ${ids.length} item(s)`,
      });
      setShowStatusDialog(false);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengupdate status inventaris',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* Header with Add Button */}
      <div className="flex items-start justify-between mb-6">
        <div></div> {/* Empty div for spacing */}
        {userRole !== "owner" && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Inventaris
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventaris</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Total item inventaris
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu verifikasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              Sudah diverifikasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total nilai inventaris
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          {/* <CardTitle>Daftar Inventaris</CardTitle>
          <CardDescription>
            {inventory.length} item inventaris
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <InventoryTable
            columns={createInventoryColumns({
              onEdit: handleEditInventory,
              onDelete: handleDeleteInventory,
              onViewDetail: handleViewDetail,
              onUpdateStatus: handleUpdateStatusFromCell
            })}
            data={inventory}
            searchKey="assetName"
            totalItems={inventory.length}
            pageCount={Math.ceil(inventory.length / 10)}
            pageNo={1}
            onFiltersChange={handleFiltersChange}
            // isLoading={isFetchingInventory}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateInventoryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateInventory}
      />

      <UpdateStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onSubmit={handleUpdateStatus}
        selectedCount={selectedItems.length}
        selectedItems={selectedItems}
      />

      {editingItem && (
        <InventoryEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          item={editingItem}
          onSubmit={handleUpdateInventory}
        />
      )}
    </>
  );
};

export default InventoryTableWrapper;
