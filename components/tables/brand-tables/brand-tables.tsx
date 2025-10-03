"use client";

import {
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState, useMemo } from "react";
import { columns } from "./columns";
import BrandCreateEditDialog from "@/app/(dashboard)/dashboard/brand/components/brand-create-edit-dialog";
import DeleteBrandDialog from "@/app/(dashboard)/dashboard/brand/components/delete-brand-dialog";

import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useGetBrands } from "@/hooks/api/useBrand";
import Spinner from "@/components/spinner";

interface BrandTablesProps {
  onEdit?: (brand: any) => void;
  onDelete?: (brand: any) => void;
}

export default function BrandTables({ onEdit, onDelete }: BrandTablesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [deletingBrand, setDeletingBrand] = useState<any>(null);

  // Search and filter states
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch] = useDebounce(search, 500);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Number(searchParams.get("page")) - 1 || 0,
    pageSize: Number(searchParams.get("limit")) || 10,
  });

  // Get brands data
  const { data: brandsData, isLoading, error } = useGetBrands({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    q: debouncedSearch,
  });

  const brands = brandsData?.items || [];
  const totalItems = brandsData?.meta?.total_items || 0;
  const totalPages = brandsData?.meta?.total_pages || 0;

  // Table columns with callbacks
  const tableColumns = useMemo(() => 
    columns(
      (brand) => {
        setEditingBrand(brand);
      },
      (brand) => {
        setDeletingBrand(brand);
      }
    ), 
    []
  );

  // React Table setup
  const table = useReactTable({
    data: brands,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    pageCount: totalPages,
    manualPagination: true,
  });

  // Update URL when search changes
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    params.set("page", String(pagination.pageIndex + 1));
    params.set("limit", String(pagination.pageSize));
    
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, pagination.pageIndex, pagination.pageSize, pathname, router, searchParams]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Cari brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <ScrollArea className="h-[calc(80vh-220px)] w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <Spinner />
                      <span className="ml-2">Loading brands...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center"
                  >
                    <div className="text-red-500">
                      Error loading brands. Please try again.
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center"
                  >
                    No brands found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Data per halaman
          </span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => {
              setPagination(prev => ({ ...prev, pageSize: Number(value), pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Halaman {pagination.pageIndex + 1} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit/Create Dialog */}
      <BrandCreateEditDialog 
        open={!!editingBrand}
        onOpenChange={(open) => !open && setEditingBrand(null)}
        brand={editingBrand}
      />
      
      {/* Delete Dialog */}
      <DeleteBrandDialog 
        open={!!deletingBrand}
        onOpenChange={(open) => !open && setDeletingBrand(null)}
        brand={deletingBrand}
      />
    </div>
  );
}
