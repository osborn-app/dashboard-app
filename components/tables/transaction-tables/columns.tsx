"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";

export interface TransactionItem {
  id: number;
  tanggal: string;
  kategori: string;
  keterangan: string;
  namaAkun: string;
  debit: number;
  kredit: number;
  transactionGroup: string;
  isFirstInGroup: boolean;
}

interface TransactionColumnsProps {
  onEdit: (item: TransactionItem) => void;
}

export const createTransactionColumns = ({
  onEdit,
}: TransactionColumnsProps): ColumnDef<TransactionItem>[] => [
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
    accessorKey: "kategori",
    header: "KATEGORI",
    cell: ({ row }) => {
      const kategori = row.getValue("kategori") as string;
      return (
        <div className="text-sm">
          {kategori}
        </div>
      );
    },
  },
  {
    accessorKey: "keterangan",
    header: "KETERANGAN TRANSAKSI",
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
  // Action column temporarily hidden
  // {
  //   id: "actions",
  //   header: "AKSI",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const transaction = row.original;

  //     return (
  //       <Button
  //         variant="ghost"
  //         size="sm"
  //         onClick={() => onEdit(transaction)}
  //         className="h-8 w-8 p-0"
  //       >
  //         <Edit className="h-4 w-4" />
  //       </Button>
  //     );
  //   },
  // },
];
