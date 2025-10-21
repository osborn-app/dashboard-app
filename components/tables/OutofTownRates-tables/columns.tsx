"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { OutOfTownRate } from "@/hooks/api/useOutOfTownRates";
import { formatRupiah } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ColumnsProps {
  onEdit: (data: OutOfTownRate) => void;
}

export const createColumns = ({ onEdit }: ColumnsProps): ColumnDef<OutOfTownRate>[] => [
  {
    accessorKey: "region_name",
    header: "Nama Wilayah",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.region_name}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original.description || "-"}
      </span>
    ),
  },
  {
    accessorKey: "daily_rate",
    header: "Tarif Harian",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600">
        {formatRupiah(Number(row.original.daily_rate))}
      </span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          row.original.is_active
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        )}
      >
        {row.original.is_active ? "Aktif" : "Nonaktif"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} />,
  },
];
