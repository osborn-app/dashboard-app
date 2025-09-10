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

interface RencanaColumnsProps {
  onEdit: (item: RencanaItem) => void;
  onDelete: (item: RencanaItem) => void;
  onView?: (item: RencanaItem) => void;
}

export const createRencanaColumns = ({
  onEdit,
  onDelete,
  onView,
}: RencanaColumnsProps): ColumnDef<RencanaItem>[] => [
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => {
      const tanggal = row.getValue("tanggal") as string;
      return (
        <div className="text-sm">
          {tanggal ? formatDate(tanggal, false) : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
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
    header: "Keterangan Rencana Transaksi",
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
    header: "Nama Akun",
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
    header: "Debit",
    cell: ({ row }) => {
      const debit = row.getValue("debit") as number;
      return (
        <div className="text-sm">
          {debit > 0 ? formatRupiah(debit) : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "kredit",
    header: "Kredit",
    cell: ({ row }) => {
      const kredit = row.getValue("kredit") as number;
      return (
        <div className="text-sm">
          {kredit > 0 ? formatRupiah(kredit) : ""}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
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
