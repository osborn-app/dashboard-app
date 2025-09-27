"use client";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import { InventoryTable } from "@/components/tables/inventory-tables/inventory-table";
import { createInventoryColumns } from "@/components/tables/inventory-tables/columns";
import { useGetInventory, useGetInventoryStatistics } from "@/hooks/api/useInventory";
import { SortingState } from "@tanstack/react-table";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CreateInventoryDialog } from './create-inventory-dialog';
import { InventoryEditDialog } from './inventory-edit-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { 
  createInventory, 
  updateInventoryStatus, 
  deleteInventory,
  updateInventory
} from '@/client/inventoryClient';

// Inventory status enum
const InventoryStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
} as const;

const InventoryTableWrapper = () => {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const q = searchParams.get("q");
  const status = searchParams.get("status") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const orderColumn = searchParams.get("order_column") || "";
  const orderBy = searchParams.get("order_by") || "";
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [selectedStatus, setSelectedStatus] = React.useState<string>(status);
  const [searchDebounce] = useDebounce(searchQuery, 500);

  const getInventoryParams = () => ({
    limit: pageLimit,
    page: page,
    q: searchDebounce,
    status: selectedStatus || undefined,
    ...(dateFrom ? { dateFrom: dateFrom } : {}),
    ...(dateTo ? { dateTo: dateTo } : {}),
    ...(orderBy ? { order_by: orderBy } : {}),
    ...(orderColumn ? { order_column: orderColumn } : {}),
  });

  const { data: inventoryData, isFetching: isFetchingInventory } = useGetInventory(
    getInventoryParams(),
    {
      enabled: true,
    }
  );

  const { data: statsData } = useGetInventoryStatistics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const newSearchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [],
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleClearDate = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Pending", value: InventoryStatus.PENDING },
    { label: "Verified", value: InventoryStatus.VERIFIED },
  ];

  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      router.push(
        `${pathname}?${createQueryString({
          status: selectedStatus || null,
          dateFrom: dayjs(dateRange?.from)
            .locale("id")
            .format("YYYY-MM-DDT00:00:00Z"),
          dateTo: dayjs(dateRange?.to)
            .locale("id")
            .format("YYYY-MM-DDT23:00:00Z"),
        })}`,
      );
    } else {
      router.push(
        `${pathname}?${createQueryString({
          status: selectedStatus || null,
          dateFrom: null,
          dateTo: null,
        })}`,
      );
    }
  }, [dateRange]);

  useEffect(() => {
    if (
      searchDebounce !== undefined ||
      searchDebounce !== "" ||
      searchDebounce
    ) {
      router.push(
        `${pathname}?${createQueryString({
          status: selectedStatus || null,
          q: searchDebounce,
          page: null,
          limit: pageLimit,
        })}`,
      );
    } else {
      router.push(
        `${pathname}?${createQueryString({
          status: selectedStatus || null,
          q: null,
          page: null,
          limit: null,
        })}`,
      );
    }
  }, [searchDebounce]);

  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        status: selectedStatus || null,
        q: searchQuery || null,
        page: null,
        limit: pageLimit,
      })}`,
    );
  }, [selectedStatus]);

  React.useEffect(() => {
    if (sorting.length > 0) {
      router.push(
        `${pathname}?${createQueryString({
          status: selectedStatus || null,
          order_by: sorting[0]?.desc ? "DESC" : "ASC",
          order_column: sorting[0]?.id,
        })}`,
      );
    } else {
      router.push(
        `${pathname}?${createQueryString({
          status: selectedStatus || null,
          order_by: null,
          order_column: null,
        })}`,
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting]);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCreateInventory = async (data: any) => {
    try {
      await createInventory(data);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      setShowCreateDialog(false);
      toast({ title: 'Success', description: 'Inventory created successfully' });
    } catch (error) {
      console.error('Error creating inventory:', error);
      toast({ title: 'Error', description: 'Failed to create inventory', variant: 'destructive' });
    }
  };

  const handleEditInventory = (item: any) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleUpdateInventory = async (updatedData: any) => {
    if (!editingItem) return;
    
    try {
      await updateInventory(editingItem.id, updatedData);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      setShowEditDialog(false);
      setEditingItem(null);
      toast({ title: 'Success', description: 'Inventory updated successfully' });
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({ title: 'Error', description: 'Failed to update inventory', variant: 'destructive' });
    }
  };

  const handleDeleteInventory = async (item: any) => {
    try {
      await deleteInventory(item.id);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast({ title: 'Success', description: 'Inventory deleted successfully' });
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast({ title: 'Error', description: 'Failed to delete inventory', variant: 'destructive' });
    }
  };

  const handleViewDetail = (item: any) => {
    router.push(`/dashboard/inventaris/${item.id}`);
  };

  const handleUpdateStatusFromCell = async (item: any, newStatus: 'pending' | 'verified') => {
    try {
      await updateInventoryStatus(item.id, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast({ title: 'Success', description: `Status updated to ${newStatus}` });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CalendarDateRangePicker
            onDateRangeChange={handleDateRangeChange}
            onClearDate={handleClearDate}
            dateRange={dateRange}
          />
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Search inventory by name"
          />
        </div>
        
        <Button
          onClick={() => setShowCreateDialog(true)}
          className={cn("flex items-center gap-2")}
        >
          <Plus className="h-4 w-4" />
          Add Inventory
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventaris</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.data?.total || 0}</div>
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
            <div className="text-2xl font-bold">{statsData?.data?.pending || 0}</div>
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
            <div className="text-2xl font-bold">{statsData?.data?.verified || 0}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(statsData?.data?.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Total nilai inventaris
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {isFetchingInventory && <Spinner />}
        {!isFetchingInventory && inventoryData && (
          <InventoryTable
            columns={createInventoryColumns({
              onEdit: handleEditInventory,
              onDelete: handleDeleteInventory,
              onViewDetail: handleViewDetail,
              onUpdateStatus: handleUpdateStatusFromCell
            })}
            data={inventoryData?.data?.data || []}
            searchKey="assetName"
            totalUsers={inventoryData?.data?.meta?.total_items || 0}
            pageCount={Math.ceil((inventoryData?.data?.meta?.total_items || 0) / pageLimit)}
            pageNo={page}
            searchQuery={searchQuery}
            sorting={sorting}
            setSorting={setSorting}
          />
        )}
      </div>

      {/* Dialogs */}
      <CreateInventoryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateInventory}
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