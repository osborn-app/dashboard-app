"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRupiah, formatDate } from "@/lib/utils";

export interface RencanaItem {
  id: string;
  tanggal: string;
  status: string;
  keterangan: string;
  namaAkun: string;
  debit: number;
  kredit: number;
  planningId: string;
  rencanaId: string;
  transactionGroup: string;
  isFirstInGroup: boolean;
}

export interface RencanaRowItem {
  id: string;
  tanggal: string;
  status: string;
  keterangan: string;
  planningId: string;
  rencanaId: string;
  transactionGroup: string;
  isFirstInGroup: boolean;
  rows: {
    namaAkun: string;
    debit: number;
    kredit: number;
    account_debit_id: string;
    account_credit_id: string;
  }[];
}

interface RencanaColumnsProps {
  onEdit: (item: RencanaItem) => void;
  onDelete: (item: RencanaItem) => void;
  onView?: (item: RencanaItem) => void;
}

interface RencanaRowColumnsProps {
  onEdit: (item: RencanaRowItem) => void;
  onDelete: (item: RencanaRowItem) => void;
  onView?: (item: RencanaRowItem) => void;
}

export const createRencanaColumns = ({
  onEdit,
  onDelete,
  onView,
}: RencanaColumnsProps): ColumnDef<RencanaItem>[] => [
  {
    accessorKey: "tanggal",
    header: "TANGGAL",
    cell: ({ row }) => {
      const tanggal = row.getValue("tanggal") as string;
      return (
        <div className="text-sm text-center">
          {tanggal ? formatDate(tanggal, false) : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="text-sm">
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "keterangan",
    header: "KETERANGAN",
    cell: ({ row }) => {
      const keterangan = row.getValue("keterangan") as string;
      return (
        <div className="text-sm">
          {keterangan}
        </div>
      );
    },
  },
  {
    accessorKey: "namaAkun",
    header: "NAMA AKUN",
    cell: ({ row }) => {
      const namaAkun = row.getValue("namaAkun") as string;
      return (
        <div className="text-sm">
          {namaAkun}
        </div>
      );
    },
  },
  {
    accessorKey: "debit",
    header: "DEBIT",
    cell: ({ row }) => {
      const debit = row.getValue("debit") as number;
      return (
        <div className="text-sm text-right">
          {debit > 0 ? formatRupiah(debit) : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "kredit",
    header: "KREDIT",
    cell: ({ row }) => {
      const kredit = row.getValue("kredit") as number;
      return (
        <div className="text-sm text-right">
          {kredit > 0 ? formatRupiah(kredit) : ""}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "AKSI",
    enableHiding: false,
    cell: ({ row }) => {
      const rencana = row.original;

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(rencana)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      );
    },
  },
];

export const createRencanaRowColumns = ({
  onEdit,
  onDelete,
  onView,
}: RencanaRowColumnsProps): ColumnDef<RencanaRowItem>[] => [
  {
    accessorKey: "tanggal",
    header: "TANGGAL",
    cell: ({ row, table }) => {
      const tanggal = row.getValue("tanggal") as string;
      const currentId = row.original.id.split('_')[0]; // Get base ID without suffix
      const prevRow = table.getRowModel().rows[row.index - 1];
      const prevId = prevRow ? prevRow.original.id.split('_')[0] : null;
      const isFirstRow = row.index === 0 || currentId !== prevId;
      
      if (!isFirstRow) return null; // Hide cell for subsequent rows
      
      return (
        <div 
          className="text-sm text-center flex items-center justify-center"
          style={{ 
            height: `${row.original.rows.length * 40}px`,
            verticalAlign: 'middle'
          }}
        >
          {tanggal ? formatDate(tanggal, false) : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row, table }) => {
      const status = row.getValue("status") as string;
      const currentId = row.original.id.split('_')[0]; // Get base ID without suffix
      const prevRow = table.getRowModel().rows[row.index - 1];
      const prevId = prevRow ? prevRow.original.id.split('_')[0] : null;
      const isFirstRow = row.index === 0 || currentId !== prevId;
      
      if (!isFirstRow) return null; // Hide cell for subsequent rows
      
      return (
        <div 
          className="text-sm flex items-center justify-center"
          style={{ 
            height: `${row.original.rows.length * 40}px`,
            verticalAlign: 'middle'
          }}
        >
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "keterangan",
    header: "KETERANGAN",
    cell: ({ row, table }) => {
      const keterangan = row.getValue("keterangan") as string;
      const currentId = row.original.id.split('_')[0]; // Get base ID without suffix
      const prevRow = table.getRowModel().rows[row.index - 1];
      const prevId = prevRow ? prevRow.original.id.split('_')[0] : null;
      const isFirstRow = row.index === 0 || currentId !== prevId;
      
      if (!isFirstRow) return null; // Hide cell for subsequent rows
      
      return (
        <div 
          className="text-sm flex items-center justify-center"
          style={{ 
            height: `${row.original.rows.length * 40}px`,
            verticalAlign: 'middle'
          }}
        >
          {keterangan}
        </div>
      );
    },
  },
  {
    accessorKey: "namaAkun",
    header: "NAMA AKUN",
    cell: ({ row }) => {
      const rowIndex = row.index;
      const currentRow = row.original;
      const currentRowData = currentRow.rows[rowIndex % currentRow.rows.length];
      
      return (
        <div className="text-sm py-2">
          {currentRowData?.namaAkun || ""}
        </div>
      );
    },
  },
  {
    accessorKey: "debit",
    header: "DEBIT",
    cell: ({ row }) => {
      const rowIndex = row.index;
      const currentRow = row.original;
      const currentRowData = currentRow.rows[rowIndex % currentRow.rows.length];
      
      return (
        <div className="text-sm text-right py-2">
          {currentRowData?.debit && currentRowData.debit > 0 ? formatRupiah(currentRowData.debit) : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "kredit",
    header: "KREDIT",
    cell: ({ row }) => {
      const rowIndex = row.index;
      const currentRow = row.original;
      const currentRowData = currentRow.rows[rowIndex % currentRow.rows.length];
      
      return (
        <div className="text-sm text-right py-2">
          {currentRowData?.kredit && currentRowData.kredit > 0 ? formatRupiah(currentRowData.kredit) : ""}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "AKSI",
    enableHiding: false,
    cell: ({ row, table }) => {
      const rencana = row.original;
      const currentId = row.original.id.split('_')[0]; // Get base ID without suffix
      const prevRow = table.getRowModel().rows[row.index - 1];
      const prevId = prevRow ? prevRow.original.id.split('_')[0] : null;
      const isFirstRow = row.index === 0 || currentId !== prevId;
      
      if (!isFirstRow) return null; // Hide cell for subsequent rows
      
      return (
        <div 
          className="flex items-center justify-center"
          style={{ 
            height: `${row.original.rows.length * 40}px`,
            verticalAlign: 'middle'
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(rencana)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
