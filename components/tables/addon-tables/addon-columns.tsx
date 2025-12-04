"use client";
import { ColumnDef } from "@tanstack/react-table";
import { AddonCellAction } from "./addon-cell-action";
import { cn, formatRupiah } from "@/lib/utils";
import { Package, Tag } from "lucide-react";

// Helper function to get category label
const getAddonCategoryLabel = (category: string) => {
  switch (category) {
    case 'car':
      return 'Mobil';
    case 'motorcycle':
      return 'Motor';
    default:
      return category;
  }
};

// Helper function to get category color
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'car':
    case 'motorcycle':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const addonColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Nama Add-on</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original?.name}</span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "category",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Kategori</span>
    ),
    cell: ({ row }) => (
      <span className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        getCategoryColor(row.original?.category)
      )}>
        {getAddonCategoryLabel(row.original?.category)}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "price",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Harga</span>
    ),
    cell: ({ row }) => (
      <span className="font-medium">
        {formatRupiah(row.original?.price)}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "available_quantity",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Stock Tersedia</span>
    ),
    cell: ({ row }) => {
      const availableQuantity = row.original?.available_quantity ?? 
        ((row.original?.stock_quantity || 0) - (row.original?.reserved_quantity || 0));
      const isDateSpecific = row.original?.date_specific;
      
      return (
        <div className="flex flex-col">
          <span className={`font-medium ${availableQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {availableQuantity}
          </span>
          {isDateSpecific && (
            <span className="text-xs text-blue-600">
              Berdasarkan tanggal
            </span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "reserved_quantity",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Stock Disewa</span>
    ),
    cell: ({ row }) => {
      const reservedQuantity = row.original?.reserved_quantity || 0;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-orange-600">{reservedQuantity}</span>
          <span className="text-xs text-muted-foreground">
            Total: {row.original?.stock_quantity || 0}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Deskripsi</span>
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate">
        {row.original?.description || "-"}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "is_available",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Status</span>
    ),
    cell: ({ row }) => (
      <span className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        row.original?.is_available 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      )}>
        {row.original?.is_available ? "Tersedia" : "Tidak Tersedia"}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <AddonCellAction data={row.original} />,
  },
];
