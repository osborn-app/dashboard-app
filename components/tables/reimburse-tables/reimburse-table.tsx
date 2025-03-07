"use client";
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import React from "react";
import { useDebounce } from "use-debounce";

import { Button } from "@/components/ui/button";
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
import {
  ArrowDownIcon,
  ArrowUpDown,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  pageNo: number;
  totalUsers: number;
  pageSizeOptions?: number[];
  pageCount: number;
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
  sorting: any[];
  setSorting: any;
}

export function ReimburseTable<TData, TValue>({
  columns,
  data,
  pageNo,
  searchKey,
  totalUsers,
  pageCount,
  pageSizeOptions = [10, 20, 30, 40, 50],
  searchQuery,
  sorting,
  setSorting,
}: DataTableProps<TData, TValue> & { searchQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Search params
  const page = searchParams?.get("page") ?? "1";
  const status = searchParams?.get("status") ?? "pending";
  const date = searchParams?.get("date");
  // const end_date = searchParams?.get("end_date");

  const reimburseColumn = searchParams?.get("reimburse_column");
  const reimburseBy = searchParams?.get("reimburse_by");

  const pageAsNumber = Number(page);
  const fallbackPage =
    isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;
  const per_page = searchParams?.get("limit") ?? "10";
  const perPageAsNumber = Number(per_page);
  const fallbackPerPage = isNaN(perPageAsNumber) ? 10 : perPageAsNumber;

  const [searchDebounce] = useDebounce(searchQuery, 500);

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

  // Handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: fallbackPage - 1,
      pageSize: fallbackPerPage,
    });

  React.useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        status: status,
        page: pageIndex + 1,
        limit: pageSize,
        q: searchDebounce || undefined,
        date: date || undefined,
        reimburse_by: reimburseBy || undefined,
        reimburse_column: reimburseColumn || undefined,
      })}`,
      {
        scroll: false,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  // const table = useReactTable({
  //   data,
  //   columns,
  //   pageCount: pageCount ?? -1,
  //   getCoreRowModel: getCoreRowModel(),
  //   getFilteredRowModel: getFilteredRowModel(),
  //   state: {
  //     sorting,
  //     pagination: { pageIndex, pageSize },
  //   },
  //   onPaginationChange: setPagination,
  //   onSortingChange: setSorting,
  //   getPaginationRowModel: getPaginationRowModel(),
  //   manualPagination: true,
  //   manualFiltering: true,
  //   manualSorting: true,
  //   getSortedRowModel: getSortedRowModel(),
  // });

  const table = useReactTable({
    data: data ?? [],
    columns,
    pageCount: pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    getSortedRowModel: getSortedRowModel(),
  });

  // React.useEffect(() => {
  //   if (searchDebounce !== undefined) {
  //     router.push(
  //       `${pathname}?${createQueryString({
  //         status: status,
  //         page: null,
  //         limit: null,
  //         q: searchDebounce,
  //       })}`,
  //       {
  //         scroll: false,
  //       },
  //     );
  //     setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  //   } else {
  //     // Handle case when search is cleared or undefined
  //     if (pageIndex !== 0) {
  //       // Reset page to 0 only if pageIndex is not 0
  //       router.push(
  //         `${pathname}?${createQueryString({
  //           status: status,
  //           page: null,
  //           limit: null,
  //           q: null,
  //         })}`,
  //         {
  //           scroll: false,
  //         },
  //       );
  //       setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchDebounce]);

  // Reset search query when URL q parameter is null or undefined
  // React.useEffect(() => {
  //   if (!q) {
  //     setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  //   }
  // }, [q]);

  // React.useEffect(() => {
  //   router.push(
  //     `${pathname}?${createQueryString({
  //       status: status,
  //     })}`,
  //   );
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [status]);

  return (
    <>
      <ScrollArea className="rounded-md border h-[calc(80vh-300px)]">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getIsSorted() ? (
                          {
                            asc: <ArrowDownIcon className="h-4 w-4" />,
                            desc: <ArrowUpIcon className="h-4 w-4" />,
                          }[(header.column.getIsSorted() as string) ?? null]
                        ) : (
                          <>
                            {header.column.getCanSort() ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              ""
                            )}
                          </>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  className="hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell: any) => {
                    return (
                      <TableCell
                        key={cell.id}
                        className="last:flex last:justify-end"
                        onClick={() => {
                          if (
                            row?.original?.status !== "pending" &&
                            !cell.id.includes("actions")
                          ) {
                            console.log(cell.id);
                            console.log(!cell.id.includes("actions"));

                            router.push(
                              `/dashboard/reimburse/${row.original.id}/detail`,
                            );
                          }
                        }}
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
        {/* <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
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
        </div> */}
      </div>
    </>
  );
}
