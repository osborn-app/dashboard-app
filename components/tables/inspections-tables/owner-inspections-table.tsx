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
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";

export type OwnerInspection = {
  id: number;
  inspector_name: string;
  kilometer: number;
  inspection_date: string;
  status: "pending_repair" | "completed";
  oil_status: "aman" | "tidak_aman" | null;
  tire_status: "aman" | "tidak_aman" | null;
  battery_status: "aman" | "tidak_aman" | null;
  description: string | null;
  repair_photo_url: string | null;
  repair_completion_date: string | null;
  repair_duration_days?: number | null;
  repair_duration_minutes?: number | null;
  fleet?: {
    id: number;
    name: string;
    type: string;
    color: string;
    plate_number: string;
    type_label: string;
    status_label: string;
  };
};

// Columns untuk Owner Inspections
const createOwnerInspectionsColumns = (): ColumnDef<OwnerInspection>[] => [
  {
    accessorKey: "fleet.name",
    header: "Fleet",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{data.fleet?.name || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "fleet.plate_number",
    header: "Plat",
    cell: ({ row }) => {
      const data = row.original;
      return <span>{data.fleet?.plate_number || "N/A"}</span>;
    },
  },
  {
    accessorKey: "fleet.type_label",
    header: "Type",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <span className="capitalize">{data.fleet?.type_label || "N/A"}</span>
      );
    },
  },
  {
    accessorKey: "inspector_name",
    header: "Inspektor",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <span className="font-medium">{data.inspector_name || "N/A"}</span>
      );
    },
  },
  {
    accessorKey: "inspection_date",
    header: "Tanggal Inspeksi",
    cell: ({ row }) => {
      const data = row.original;
      return <span>{formatDateTime(new Date(data.inspection_date))}</span>;
    },
  },
  {
    accessorKey: "repair_duration_days",
    header: "Estimasi",
    cell: ({ row }) => {
      const data = row.original;
      const days = data.repair_duration_days || 0;
      const minutes = data.repair_duration_minutes || 0;
      const totalMinutes = days * 24 * 60 + minutes;

      if (totalMinutes === 0) {
        return <span className="text-muted-foreground">Langsung selesai</span>;
      }

      // Format duration display
      const displayDays = Math.floor(totalMinutes / (24 * 60));
      const remainingMinutes = totalMinutes % (24 * 60);
      const displayHours = Math.floor(remainingMinutes / 60);
      const displayMinutes = remainingMinutes % 60;

      let durationText = "";
      if (displayDays > 0) {
        durationText += `${displayDays} hari`;
      }
      if (displayHours > 0) {
        if (durationText) durationText += " ";
        durationText += `${displayHours} jam`;
      }
      if (displayMinutes > 0) {
        if (durationText) durationText += " ";
        durationText += `${displayMinutes} menit`;
      }

      return (
        <div className="flex flex-col">
          <span className="font-medium">{durationText}</span>
          {data.status === "completed" && data.repair_completion_date ? (
            <span className="text-xs text-muted-foreground">
              Selesai:{" "}
              {new Date(data.repair_completion_date).toLocaleDateString(
                "id-ID",
              )}
            </span>
          ) : data.inspection_date ? (
            <span className="text-xs text-muted-foreground">
              Estimasi selesai:{" "}
              {new Date(
                new Date(data.inspection_date).getTime() +
                  totalMinutes * 60 * 1000,
              ).toLocaleDateString("id-ID")}
            </span>
          ) : null}
        </div>
      );
    },
  },
];

interface OwnerInspectionsTableProps {
  data: OwnerInspection[];
  status: "pending_repair" | "completed";
  pageNo?: number;
  totalUsers?: number;
  pageCount?: number;
  pageSizeOptions?: number[];
}

export default function OwnerInspectionsTable({
  data,
  status,
  pageNo = 1,
  totalUsers = 0,
  pageCount = 1,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: OwnerInspectionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || pageNo;
  const limit = Number(searchParams.get("limit")) || 10;

  const columns = createOwnerInspectionsColumns();

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

  const handleRowClick = (rowData: OwnerInspection) => {
    // Navigate to detail page when row is clicked
    window.open(`/dashboard/inspections/${rowData.id}/detail`, "_blank");
  };

  return (
    <>
      <ScrollArea className="rounded-md border h-[calc(75vh-220px)]">
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
                  className="cursor-pointer hover:bg-muted/50"
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
}
