"use client";

import {
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { columns } from "@/components/tables/fleet-tables/columns";

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
import { useUser } from "@/context/UserContext";
import { useFleetTableData } from "@/hooks/api/useFleet";
import { useGetBrandsList } from "@/hooks/api/useBrand";
import Spinner from "@/components/spinner";
import { Select as AntdSelect } from "antd";
const { Option } = AntdSelect;

interface DataTableProps<TData, TValue> {
  data: TData[];
  searchKey: string;
  pageNo: number;
  totalUsers: number;
  pageSizeOptions?: number[];
  pageCount: number;
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export function FleetTable<TData, TValue>({
  data,
  pageNo,
  searchKey,
  totalUsers,
  pageCount,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Search params
  const page = searchParams?.get("page") ?? "1";
  const q = searchParams?.get("q");
  const status = searchParams?.get("status");
  const brand = searchParams?.get("brand");
  const pageAsNumber = Number(page);
  const fallbackPage =
    isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;
  const per_page = searchParams?.get("limit") ?? "10";
  const perPageAsNumber = Number(per_page);
  const fallbackPerPage = isNaN(perPageAsNumber) ? 10 : perPageAsNumber;
  const { user } = useUser();

  const [searchQuery, setSearchQuery] = React.useState<string | undefined>(
    q ?? "",
  );
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>(
    status ?? "",
  );
  const [brandFilter, setBrandFilter] = React.useState<string | undefined>(
    brand ?? "",
  );
  const [brandSearchTerm, setBrandSearchTerm] = React.useState<string>("");
  const [searchDebounce] = useDebounce(searchQuery, 500);
  const [statusDebounce] = useDebounce(statusFilter, 300);
  const [brandDebounce] = useDebounce(brandFilter, 300);

  // Build query parameters for API call
  const queryParams = {
    page: fallbackPage,
    limit: fallbackPerPage,
    ...(searchDebounce && { q: searchDebounce }),
    ...(statusDebounce && { status: statusDebounce }),
    ...(brandDebounce && { brand: brandDebounce }),
  };

  // Use the hook to fetch data with network visibility
  const { data: fleetData, isLoading, error } = useFleetTableData(queryParams);
  
  // Get brands list for filter dropdown
  const { data: brandsList } = useGetBrandsList();

  // Filter brands based on search term
  const filteredBrands = React.useMemo(() => {
    if (!brandsList || !brandSearchTerm) return brandsList || [];
    
    return brandsList.filter((brand: any) =>
      brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
    );
  }, [brandsList, brandSearchTerm]);

  // Use fetched data or fallback to props data
  const tableData = fleetData?.items || data || [];
  const tablePageCount = fleetData?.meta?.total_items ? Math.ceil(fleetData.meta.total_items / fallbackPerPage) : pageCount;
  const tableTotalUsers = fleetData?.meta?.total_items || totalUsers;

  // Create query string
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

  const filteredColumns = columns.filter((column) => {
    if (column.id === "actions" && user?.role === "owner") {
      return false;
    }

    return true;
  });

  // Handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: fallbackPage - 1,
      pageSize: fallbackPerPage,
    });

  React.useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page: pageIndex + 1,
        limit: pageSize,
        q: searchDebounce || undefined,
        status: statusDebounce || undefined,
        brand: brandDebounce || undefined,
      })}`,
      {
        scroll: false,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, searchDebounce, statusDebounce, brandDebounce]);

  const table = useReactTable({
    data: tableData,
    columns: filteredColumns,
    pageCount: tablePageCount ?? -1,
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
    setStatusFilter(value === "all" ? "" : value);
  };

  // Handle brand filter change
  const handleBrandFilterChange = (value: string) => {
    setBrandFilter(value === "all" ? "" : value);
  };

  // Handle brand search
  const handleBrandSearch = (value: string) => {
    setBrandSearchTerm(value);
  };

  React.useEffect(() => {
    if (searchDebounce !== undefined) {
      router.push(
        `${pathname}?${createQueryString({
          page: null,
          limit: null,
          q: searchDebounce,
          status: statusDebounce || undefined,
          brand: brandDebounce || undefined,
        })}`,
        {
          scroll: false,
        },
      );
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    } else {
      // Handle case when search is cleared or undefined
      if (pageIndex !== 0) {
        // Reset page to 0 only if pageIndex is not 0
        router.push(
          `${pathname}?${createQueryString({
            page: null,
            limit: null,
            q: null,
            status: statusDebounce || undefined,
            brand: brandDebounce || undefined,
          })}`,
          {
            scroll: false,
          },
        );
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDebounce]);

  // Handle status filter changes
  React.useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page: null,
        limit: null,
        q: searchDebounce || undefined,
        status: statusDebounce || undefined,
        brand: brandDebounce || undefined,
      })}`,
      {
        scroll: false,
      },
    );
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusDebounce]);

  // Handle brand filter changes
  React.useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page: null,
        limit: null,
        q: searchDebounce || undefined,
        status: statusDebounce || undefined,
        brand: brandDebounce || undefined,
      })}`,
      {
        scroll: false,
      },
    );
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandDebounce]);

  // Reset search query when URL q parameter is null or undefined
  React.useEffect(() => {
    if (!q) {
      setSearchQuery("");
    }
  }, [q]);

  // Reset status filter when URL status parameter is null or undefined
  React.useEffect(() => {
    if (!status) {
      setStatusFilter("");
    }
  }, [status]);

  // Reset brand filter when URL brand parameter is null or undefined
  React.useEffect(() => {
    if (!brand) {
      setBrandFilter("");
      setBrandSearchTerm("");
    }
  }, [brand]);

  // Show loading state
  if (isLoading) {
    return <Spinner />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading fleet data</p>
          <p className="text-sm text-gray-500">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
        <Input
          placeholder={`Cari fleets...`}
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="w-full md:max-w-sm"
        />
        <div className="flex flex-col gap-2 md:flex-row md:gap-4">
          <Select
            value={statusFilter || "all"}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="available">Tidak Disewa</SelectItem>
              <SelectItem value="ordered">Sedang Disewa</SelectItem>
            </SelectContent>
          </Select>
          <AntdSelect
            showSearch
            value={brandFilter || "all"}
            onChange={handleBrandFilterChange}
            onSearch={handleBrandSearch}
            placeholder="Filter Brand"
            style={{ width: "100%", minWidth: "180px" }}
            filterOption={false}
            allowClear
            className="w-full md:w-[180px]"
          >
            <Option value="all">Semua Brand</Option>
            {filteredBrands?.map((brand: any) => (
              <Option key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </Option>
            ))}
          </AntdSelect>
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
                  className="cursor-pointer hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                  onClick={() =>
                    router.push(
                      `/dashboard/fleets/${(row.original as any).id}/detail`,
                    )
                  }
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell
                        key={cell.id}
                        className={
                          user?.role !== "owner"
                            ? "last:flex last:justify-end"
                            : ""
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data yang dapat ditampilkan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="flex flex-col gap-2 sm:flex-row items-center justify-end space-x-2 py-4">
        <div className="flex items-center justify-between w-full">
          {/* <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div> */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
              <p className="whitespace-nowrap text-sm font-medium">
                Data per halaman
              </p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
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
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
          <div className="flex w-[120px] items-center justify-center text-sm font-medium">
            Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
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
              <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to previous page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to next page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to last page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}