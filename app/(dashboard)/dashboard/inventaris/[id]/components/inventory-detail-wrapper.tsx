"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, Package, Calendar, DollarSign, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getInventoryById, updateInventoryStatus, deleteInventory } from '@/client/inventoryClient';
import { InventoryItem } from '@/components/tables/inventory-tables/columns';
import { InventoryEditDialog } from '../../components/inventory-edit-dialog';
import Spinner from '@/components/spinner';

interface InventoryDetailWrapperProps {
  inventoryId: number;
  userRole: string;
}

const InventoryDetailWrapper = ({ inventoryId, userRole }: InventoryDetailWrapperProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Use React Query for inventory data
  const { data: inventoryData, isFetching, error } = useQuery({
    queryKey: ['inventory', inventoryId],
    queryFn: () => getInventoryById(inventoryId),
    enabled: true,
  });

  const inventory = inventoryData?.data?.data || inventoryData?.data;

  const handleEdit = () => {
    if (inventory) {
      setEditingItem(inventory);
      setShowEditDialog(true);
    }
  };

  const handleUpdateInventory = async (updatedData: Partial<InventoryItem>) => {
    if (!editingItem) return;
    
    try {
      // Update local state
      queryClient.setQueryData(['inventory', inventoryId], (oldData: any) => {
        if (oldData?.data?.data) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: { ...oldData.data.data, ...updatedData, updatedAt: new Date().toISOString() }
            }
          };
        } else if (oldData?.data) {
          return {
            ...oldData,
            data: { ...oldData.data, ...updatedData, updatedAt: new Date().toISOString() }
          };
        }
        return oldData;
      });
      
      toast({
        title: 'Success',
        description: 'Inventory item updated successfully',
      });
      
      setShowEditDialog(false);
      setEditingItem(null);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengupdate item inventaris',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!inventory) return;
    
    if (!confirm('Apakah Anda yakin ingin menghapus item inventaris ini?')) {
      return;
    }

    try {
      await deleteInventory(inventory.id);
      
      toast({
        title: 'Success',
        description: 'Inventory item deleted successfully',
      });
      
      router.push('/dashboard/inventaris');
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus item inventaris',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (newStatus: 'pending' | 'verified') => {
    if (!inventory) return;
    
    try {
      await updateInventoryStatus(inventory.id, { status: newStatus });
      
      // Update local state
      queryClient.setQueryData(['inventory', inventoryId], (oldData: any) => {
        if (oldData?.data?.data) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: { ...oldData.data.data, status: newStatus, updatedAt: new Date().toISOString() }
            }
          };
        } else if (oldData?.data) {
          return {
            ...oldData,
            data: { ...oldData.data, status: newStatus, updatedAt: new Date().toISOString() }
          };
        }
        return oldData;
      });
      
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error || !inventory) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Item inventaris tidak ditemukan</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/dashboard/inventaris')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Inventaris
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Back Button and Actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/inventaris')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          
          {userRole !== "owner" && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
          )}
        </div>

        {/* Main Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  {inventory.assetName}
                </CardTitle>
                <CardDescription className="mt-2">
                  Detail lengkap item inventaris
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`flex items-center gap-1 border ${
                    inventory.status === "verified" 
                      ? "bg-green-100 text-green-700 border-green-200" 
                      : "bg-yellow-100 text-yellow-700 border-yellow-200"
                  }`}
                >
                  {inventory.status === "verified" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {inventory.status === "verified" ? "Verified" : "Pending"}
                </Badge>
                {userRole !== "owner" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newStatus = inventory.status === "verified" ? "pending" : "verified";
                      handleUpdateStatus(newStatus);
                    }}
                    className="text-xs"
                  >
                    {inventory.status === "verified" ? "Set Pending" : "Set Verified"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ID Inventaris</p>
                    <p className="text-lg font-mono">#{inventory.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nama Aset</p>
                    <p className="text-lg">{inventory.assetName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Jumlah</p>
                    <p className="text-lg font-semibold">{inventory.quantity} unit</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Harga Satuan</p>
                    <p className="text-lg font-semibold">{formatCurrency(inventory.unitPrice)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Harga</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(inventory.totalPrice)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tanggal Pembelian</p>
                    <p className="text-lg">{formatDate(inventory.purchaseDate)}</p>
                  </div>
                </div>

                {/* Installment Information */}
                {inventory.isInstallment && (
                  <>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Cicilan per Bulan</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(inventory.installmentAmount || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Tanggal Berakhir Cicilan</p>
                        <p className="text-lg">{formatDate(inventory.installmentEndDate || '')}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tambahan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tanggal Dibuat</p>
                <p className="text-lg">{formatDate(inventory.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terakhir Diupdate</p>
                <p className="text-lg">{formatDate(inventory.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
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

export default InventoryDetailWrapper;
