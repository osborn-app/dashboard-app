"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ProductLedgerCellAction } from "./product-ledger-cell-action";
import { cn, formatRupiah } from "@/lib/utils";
import { Package, MapPin, User, Calendar } from "lucide-react";

export const productLedgerColumns: ColumnDef<any>[] = [
  {
    accessorKey: "product",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Product</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original?.product?.name || "-"}</span>
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
        {row.original?.category?.name || "-"}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "date",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Date</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{row.original?.date ? new Date(row.original.date).toLocaleDateString() : "-"}</span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Description</span>
    ),
    cell: ({ row }) => <span>{row.original?.description || "-"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "credit_amount",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Credit Amount</span>
    ),
    cell: ({ row }) => (
      <span className={cn(
        "font-medium",
        row.original?.credit_amount ? "text-green-600" : "text-gray-500"
      )}>
        {row.original?.credit_amount ? formatRupiah(row.original.credit_amount) : "-"}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "debit_amount",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Debit Amount</span>
    ),
    cell: ({ row }) => (
      <span className={cn(
        "font-medium",
        row.original?.debit_amount ? "text-red-600" : "text-gray-500"
      )}>
        {row.original?.debit_amount ? formatRupiah(row.original.debit_amount) : "-"}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "owner_commission",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Owner Commission</span>
    ),
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original?.owner_commission ? formatRupiah(row.original.owner_commission) : "-"}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Status</span>
    ),
    cell: ({ row }) => (
      <span className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        row.original?.status === "paid" 
          ? "bg-green-100 text-green-800"
          : row.original?.status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-red-100 text-red-800"
      )}>
        {row.original?.status || "-"}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductLedgerCellAction data={row.original} />,
  },
];
