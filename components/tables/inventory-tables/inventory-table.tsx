"use client";
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  pageNo: number;
  totalItems: number;
  pageSizeOptions?: number[];
  pageCount: number;
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
  onFiltersChange?: (filters: {
    search: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
  isLoading?: boolean;
}

export function InventoryTable<TData, TValue>({
  columns,
  data,
  pageNo,
  searchKey,
  totalItems,
  pageCount,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onFiltersChange,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Search params from URL
  const page = searchParams?.get("page") ?? "1";
  const q = searchParams?.get("q");
  const status = searchParams?.get("status");
  const dateFrom = searchParams?.get("dateFrom");
  const dateTo = searchParams?.get("dateTo");
  
  const pageAsNumber = Number(page);
  const fallbackPage =
    isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;
  const per_page = searchParams?.get("limit") ?? "10";
  const perPageAsNumber = Number(per_page);
  const fallbackPerPage = isNaN(perPageAsNumber) ? 10 : perPageAsNumber;

  // Local state for filters - initialize from URL params
  const [searchQuery, setSearchQuery] = React.useState<string>(() => {
    return searchParams?.get("q") || "";
  });
  const [statusFilter, setStatusFilter] = React.useState<string>(() => {
    return searchParams?.get("status") || "all";
  });
  const [dateFromFilter, setDateFromFilter] = React.useState<string>(() => {
    return searchParams?.get("dateFrom") || "";
  });
  const [dateToFilter, setDateToFilter] = React.useState<string>(() => {
    return searchParams?.get("dateTo") || "";
  });

  // Sync local state with URL params when they change
  React.useEffect(() => {
    const urlSearch = searchParams?.get("q") || "";
    const urlStatus = searchParams?.get("status") || "all";
    const urlDateFrom = searchParams?.get("dateFrom") || "";
    const urlDateTo = searchParams?.get("dateTo") || "";

    setSearchQuery(urlSearch);
    setStatusFilter(urlStatus);
    setDateFromFilter(urlDateFrom);
    setDateToFilter(urlDateTo);
  }, [searchParams]);
  
  const [searchDebounce] = useDebounce(searchQuery, 500);
  const [statusDebounce] = useDebounce(statusFilter, 300);
  const [dateFromDebounce] = useDebounce(dateFromFilter, 300);
  const [dateToDebounce] = useDebounce(dateToFilter, 300);

  // Create query string helper
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const newSearchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      return newSearchParams.toString();
    },
    [],
  );

  // Handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: fallbackPage - 1,
      pageSize: fallbackPerPage,
    });

  // Update URL when pagination changes (only pagination, not filters)
  React.useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page: pageIndex + 1,
        limit: pageSize,
        q: searchDebounce || undefined,
        status: statusDebounce === "all" ? undefined : statusDebounce,
        dateFrom: dateFromDebounce || undefined,
        dateTo: dateToDebounce || undefined,
      })}`,
      {
        scroll: false,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  // Notify parent component when filters change (without router.push)
  React.useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        search: searchDebounce,
        status: statusDebounce === "all" ? "" : statusDebounce,
        dateFrom: dateFromDebounce,
        dateTo: dateToDebounce,
      });
    }
  }, [searchDebounce, statusDebounce, dateFromDebounce, dateToDebounce, onFiltersChange]);

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  // Handle search input change
  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Handle date filter changes
  const handleDateFromChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateFromFilter(event.target.value);
  };

  const handleDateToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateToFilter(event.target.value);
  };

  // Reset filters when URL parameters are null or undefined
  React.useEffect(() => {
    if (!q) {
      setSearchQuery("");
    }
    if (!status) {
      setStatusFilter("all");
    }
    if (!dateFrom) {
      setDateFromFilter("");
    }
    if (!dateTo) {
      setDateToFilter("");
    }
  }, [q, status, dateFrom, dateTo]);

  return (
    <>
      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Cari Aset</label>
          <Input
            placeholder="Cari nama aset..."
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tanggal Dari</label>
          <Input
            type="date"
            value={dateFromFilter}
            onChange={handleDateFromChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tanggal Sampai</label>
          <Input
            type="date"
            value={dateToFilter}
            onChange={handleDateToChange}
          />
        </div>
      </div>

      <ScrollArea className="rounded-md border h-[calc(80vh-220px)]">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalItems} total items
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPagination((prev) => ({
                  ...prev,
                  pageSize: Number(value),
                  pageIndex: 0,
                }));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              aria-label="Go to first page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Go to previous page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Go to next page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Go to last page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
