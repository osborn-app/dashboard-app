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
import { formatRupiah, formatDateIndonesian } from "@/lib/utils";
import { Perencanaan } from "@/types/perencanaan";
import Link from "next/link";

export type PerencanaanItem = Perencanaan;

interface PerencanaanColumnsProps {
  onEdit: (item: PerencanaanItem) => void;
  onDelete: (item: PerencanaanItem) => void;
  onView?: (item: PerencanaanItem) => void;
}

export const createPerencanaanColumns = ({
  onEdit,
  onDelete,
  onView,
}: PerencanaanColumnsProps): ColumnDef<PerencanaanItem>[] => [
  {
    accessorKey: "name",
    header: "Nama Perencanaan",
    enableColumnFilter: false,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const id = row.original.id;
      return (
        <Link 
          href={`/dashboard/perencanaan/${id}`}
          className="font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          {name}
        </Link>
      );
    },
  },
  {
    accessorKey: "start_date",
    header: "Tanggal Awal",
    enableColumnFilter: false,
    cell: ({ row }) => {
      const date = row.getValue("start_date") as string;
      return (
        <div className="text-sm">
          {formatDateIndonesian(date, false)}
        </div>
      );
    },
  },
  {
    accessorKey: "end_date",
    header: "Tanggal Akhir",
    enableColumnFilter: false,
    cell: ({ row }) => {
      const date = row.getValue("end_date") as string;
      return (
        <div className="text-sm">
          {formatDateIndonesian(date, false)}
        </div>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total Perencanaan",
    enableColumnFilter: false,
    cell: ({ row }) => {
      const value = row.getValue("total_amount") as number;
      return (
        <div className="font-medium text-sm">
          {value ? formatRupiah(value) : "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const perencanaan = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/perencanaan/${perencanaan.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(perencanaan)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(perencanaan)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
