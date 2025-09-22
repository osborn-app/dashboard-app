"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatRupiah, formatDateIndonesian } from "@/lib/utils";

export interface JurnalUmumItem {
  id: string;
  tanggal: string;
  namaAkun: string;
  debit: number;
  kredit: number;
  planningId: string;
  transactionGroup: string;
  isFirstInGroup: boolean;
}

export interface JurnalUmumRowItem {
  id: string;
  tanggal: string;
  planningId: string;
  transactionGroup: string;
  isFirstInGroup: boolean;
  status: string;
  keterangan: string;
  rencanaId: string;
  rows: {
    namaAkun: string;
    debit: number;
    kredit: number;
  }[];
}

interface JurnalUmumRowColumnsProps {
  // No action handlers needed for jurnal umum
}

export const createJurnalUmumRowColumns = (): ColumnDef<JurnalUmumRowItem>[] => [
  {
    accessorKey: "tanggal",
    header: "TANGGAL",
    cell: ({ row }) => {
      const tanggal = row.getValue("tanggal") as string;
      return (
        <div className="text-sm text-center">
          {tanggal ? formatDateIndonesian(tanggal, false) : ""}
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
        <div className="text-sm">
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
        <div className="text-sm text-right">
          {currentRowData?.debit && currentRowData.debit > 0 ? formatRupiah(currentRowData.debit) : "-"}
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
        <div className="text-sm text-right">
          {currentRowData?.kredit && currentRowData.kredit > 0 ? formatRupiah(currentRowData.kredit) : "-"}
        </div>
      );
    },
  },
];
