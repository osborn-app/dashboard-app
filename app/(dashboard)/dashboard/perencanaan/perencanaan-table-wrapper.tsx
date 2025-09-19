"use client";

import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { CreatePerencanaanDialog, EditPerencanaanDialog, DeletePerencanaanDialog } from './components/dialogs';
import { useToast } from '@/hooks/use-toast';
import { 
  useGetPerencanaan,
  usePostPerencanaan,
  useEditPerencanaan,
  useDeletePerencanaan
} from '@/hooks/api/usePerencanaan';
import { PerencanaanTable } from '@/components/tables/perencanaan-tables/perencanaan-table';
import { createPerencanaanColumns, PerencanaanItem } from '@/components/tables/perencanaan-tables/columns';
import { Perencanaan, CreatePerencanaanData } from '@/types/perencanaan';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface PerencanaanTableWrapperProps {
  userRole: string;
}

const PerencanaanTableWrapper = ({ userRole }: PerencanaanTableWrapperProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Perencanaan | null>(null);
  const [deletingItem, setDeletingItem] = useState<Perencanaan | null>(null);
  const { toast } = useToast();
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get URL parameters
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const q = searchParams.get("q");
  const [searchQuery, setSearchQuery] = useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQuery, 500);

  // Build query parameters for API
  const perencanaanParams = useMemo(() => ({
    limit: pageLimit,
    page: page,
    ...(searchDebounce ? { q: searchDebounce } : {}),
  }), [pageLimit, page, searchDebounce]);

  // Use API hooks
  const { data: perencanaanResponse, isLoading, error } = useGetPerencanaan(perencanaanParams);
  const createMutation = usePostPerencanaan();
  const updateMutation = useEditPerencanaan(editingItem?.id || '');
  const deleteMutation = useDeletePerencanaan(Number(deletingItem?.id) || 0);

  // Extract data from API response - backend uses 'items' instead of 'data'
  const perencanaan = useMemo(() => 
    perencanaanResponse?.items || perencanaanResponse?.data || [], 
    [perencanaanResponse]
  );
  
  const totalItems = useMemo(() => 
    perencanaanResponse?.meta?.total_items || 
    perencanaanResponse?.meta?.item_count || 
    perencanaan.length, 
    [perencanaanResponse, perencanaan.length]
  );
  
  const totalPages = useMemo(() => 
    perencanaanResponse?.pagination?.total_page || 
    perencanaanResponse?.meta?.total_pages || 
    1, 
    [perencanaanResponse]
  );

  // Handler untuk update URL search params
  const updateSearchParams = useCallback((newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 0) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    updateSearchParams({ q: value, page: 1 }); // Reset to page 1 when searching
  }, [updateSearchParams]);

  const handleCreatePerencanaan = async (newItem: CreatePerencanaanData) => {
    try {
      const response = await createMutation.mutateAsync(newItem);
      
      toast({
        title: 'Success',
        description: 'Perencanaan berhasil dibuat',
      });
      
      setShowCreateDialog(false);
      
      // Navigate to detail page after successful creation
      if (response?.data?.id) {
        router.push("/dashboard/perencanaan");
      }
    } catch (error) {
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
      await updateMutation.mutateAsync(updatedData);
      
      toast({
        title: 'Success',
        description: 'Perencanaan berhasil diupdate',
      });
      
      setShowEditDialog(false);
      setEditingItem(null);
    } catch (error) {
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
      await deleteMutation.mutateAsync(Number(item.id));
      
      toast({
        title: 'Success',
        description: 'Perencanaan berhasil dihapus',
      });
      
      setShowDeleteDialog(false);
      setDeletingItem(null);
    } catch (error) {
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
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari Perencanaan......"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {userRole !== "owner" && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
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
                Tambah Perencanaan
              </>
            )}
          </Button>
        )}
      </div>

      {/* Perencanaan Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-red-600">Belum ada data perencanaan</p>
              </div>
            </div>
          ) : (
            <PerencanaanTable
              columns={createPerencanaanColumns({
                onEdit: handleEditPerencanaan,
                onDelete: handleDeletePerencanaan
              })}
              data={perencanaan}
              searchKey="name"
              totalUsers={totalItems}
              pageCount={totalPages}
              pageNo={page}
              searchQuery={searchQuery}
              sorting={[]}
              setSorting={() => {}}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreatePerencanaanDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreatePerencanaan}
        isLoading={createMutation.isPending}
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
