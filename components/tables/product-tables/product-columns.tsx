"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ProductCellAction } from "./product-cell-action";
import { cn, formatRupiah } from "@/lib/utils";
import { Package, MapPin, User } from "lucide-react";
import {
  getCategoryLabel
} from "@/app/(dashboard)/dashboard/product-orders/[productOrderId]/types/product-order";

export const productColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Product Name</span>
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
      <span className="text-sm font-semibold text-neutral-700">Category</span>
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
        {getCategoryLabel(row.original?.category)}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "model",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Model</span>
    ),
    cell: ({ row }) => <span>{row.original?.model || "-"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "price",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Price</span>
    ),
    cell: ({ row }) => (
      <span className="font-medium">
        {formatRupiah(row.original?.price)}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "location",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Location</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>{row.original?.location?.name || "-"}</span>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductCellAction data={row.original} />,
  },
]; 