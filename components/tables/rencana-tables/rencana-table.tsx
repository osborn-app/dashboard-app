"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function RencanaTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <ScrollArea className="h-[calc(80vh-200px)]">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 text-left font-medium text-gray-700 bg-gray-50"
                    >
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
              table.getRowModel().rows.map((row: any, index: number) => {
                const isFirstInGroup = row.original.isFirstInGroup;
                
                // Calculate rowspan for merged cells
                const groupRows = table.getRowModel().rows.filter((r: any) => 
                  r.original.transactionGroup === row.original.transactionGroup
                );
                const rowSpan = groupRows.length;
                
                return (
                  <TableRow
                    className="hover:bg-gray-50 transition-colors duration-200 ease-in-out border-b"
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell: any, cellIndex: number) => {
                      const columnId = cell.column.id;
                      
                      // Columns that should be merged (rowspan) - only show in first row of group
                      const mergedColumns = ['tanggal', 'status', 'keterangan', 'actions'];
                      const shouldMerge = mergedColumns.includes(columnId);
                      
                      // Skip rendering merged columns for non-first rows
                      if (shouldMerge && !isFirstInGroup) {
                        return null;
                      }
                      
                      return (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-3 last:flex last:justify-end"
                          rowSpan={shouldMerge && isFirstInGroup ? rowSpan : undefined}
                          style={shouldMerge && isFirstInGroup ? { verticalAlign: 'middle' } : {}}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  Tidak ada data yang dapat ditampilkan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
}
