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

export function TransactionTable<TData, TValue>({
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                {table.getHeaderGroups().map((headerGroup) => (
                  headerGroup.headers.map((header) => {
                    const isLastColumn = headerGroup.headers.indexOf(header) === headerGroup.headers.length - 1;
                    return (
                      <th
                        key={header.id}
                        className={`py-3 px-4 font-semibold text-gray-800 text-left ${
                          isLastColumn ? '' : 'border-r border-gray-300'
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    );
                  })
                ))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: any, index: number) => {
                  const isFirstInGroup = row.original.isFirstInGroup;
                  
                  // Calculate rowspan for merged cells
                  const groupRows = table.getRowModel().rows.filter((r: any) => 
                    r.original.transactionGroup === row.original.transactionGroup
                  );
                  const rowSpan = groupRows.length;
                  
                  return (
                    <tr key={row.id} className="border-b border-gray-300 hover:bg-gray-50">
                      {row.getVisibleCells().map((cell: any, cellIndex: number) => {
                        const columnId = cell.column.id;
                        const isLastColumn = cellIndex === row.getVisibleCells().length - 1;
                        
                        // Columns that should be merged (rowspan) - only show in first row of group
                        const mergedColumns = ['tanggal', 'kategori', 'keterangan', 'actions'];
                        const shouldMerge = mergedColumns.includes(columnId);
                        
                        // Skip rendering merged columns for non-first rows
                        if (shouldMerge && !isFirstInGroup) {
                          return null;
                        }
                        
                        return (
                          <td
                            key={cell.id}
                            className={`py-3 px-4 text-gray-900 ${
                              isLastColumn ? '' : 'border-r border-gray-300'
                            } ${columnId === 'actions' ? 'text-center' : ''}`}
                            rowSpan={shouldMerge && isFirstInGroup ? rowSpan : undefined}
                            style={shouldMerge && isFirstInGroup ? { verticalAlign: 'middle' } : {}}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500 border-b border-gray-300"
                  >
                    Tidak ada data yang dapat ditampilkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
}
