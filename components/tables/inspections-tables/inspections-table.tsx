"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Inspection, Fleet } from "./columns";
import { useRouter } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

// Type guard to check if data is Fleet
const isFleet = (data: any): data is Fleet => {
  return "name" in data && "type" in data && !("inspector_name" in data);
};

// Type guard to check if data is Inspection
const isInspection = (data: any): data is Inspection => {
  return "inspector_name" in data;
};

interface InspectionsTableProps {
  columns: ColumnDef<any>[];
  data: any[];
  status: "active" | "pending_repair" | "completed";
  searchKey?: string;
  pageNo?: number;
  totalUsers?: number;
  pageCount?: number;
  pageSizeOptions?: number[];
}

export const InspectionsTable: React.FC<InspectionsTableProps> = ({
  columns,
  data,
  status,
  searchKey,
  pageNo = 1,
  totalUsers = 0,
  pageCount = 1,
  pageSizeOptions = [10, 20, 30, 40, 50],
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || pageNo;
  const limit = Number(searchParams.get("limit")) || 10;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleRowClick = (rowData: any) => {
    // Navigate to detail page when row is clicked
    if (status === "pending_repair" || status === "completed") {
      if (isInspection(rowData)) {
        // Untuk pending_repair, arahkan ke preview
        if (status === "pending_repair") {
          router.push(`/dashboard/inspections/${rowData.id}/preview`);
        } else {
          // Untuk completed, arahkan ke detail
          router.push(`/dashboard/inspections/${rowData.id}/detail`);
        }
      }
    }
  };

  return (
    <>
      <ScrollArea className="rounded-md border h-[calc(110vh-220px)]">
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
                  className={`${
                    status === "pending_repair" || status === "completed"
                      ? "cursor-pointer hover:bg-muted/50"
                      : ""
                  }`}
                  onClick={() => handleRowClick(row.original)}
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
      <div className="flex flex-col gap-2 sm:flex-row items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap text-sm font-medium">
            Data per halaman
          </p>
          <Select
            value={`${limit}`}
            onValueChange={(value) => {
              const newSearchParams = new URLSearchParams(
                searchParams.toString(),
              );
              newSearchParams.set("limit", value);
              newSearchParams.set("page", "1");
              router.push(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={limit} />
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {pageCount}
          </span>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              const newSearchParams = new URLSearchParams(
                searchParams.toString(),
              );
              newSearchParams.set("page", "1");
              router.push(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            disabled={page <= 1}
          >
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              const newSearchParams = new URLSearchParams(
                searchParams.toString(),
              );
              newSearchParams.set("page", String(page - 1));
              router.push(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            disabled={page <= 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              const newSearchParams = new URLSearchParams(
                searchParams.toString(),
              );
              newSearchParams.set("page", String(page + 1));
              router.push(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            disabled={page >= pageCount}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              const newSearchParams = new URLSearchParams(
                searchParams.toString(),
              );
              newSearchParams.set("page", String(pageCount));
              router.push(`${pathname}?${newSearchParams.toString()}`, {
                scroll: false,
              });
            }}
            disabled={page >= pageCount}
          >
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
