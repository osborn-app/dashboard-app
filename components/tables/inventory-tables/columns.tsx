"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, CheckCircle, Clock, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface InventoryItem {
  id: number;
  assetName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  status: 'pending' | 'verified';
  isInstallment?: boolean;
  installmentAmount?: number;
  installmentEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryColumnsProps {
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onViewDetail?: (item: InventoryItem) => void;
  onUpdateStatus?: (item: InventoryItem, newStatus: 'pending' | 'verified') => void;
}

export const createInventoryColumns = (props?: InventoryColumnsProps): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: "assetName",
    header: "Nama Aset",
    cell: ({ row }) => {
      return (
        <div className="font-medium">{row.getValue("assetName")}</div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Jumlah",
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.getValue("quantity")}</div>
      );
    },
  },
  {
    accessorKey: "unitPrice",
    header: "Harga Satuan",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("unitPrice"));
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
      return <div className="text-right">{formatted}</div>;
    },
  },
  {
    accessorKey: "totalPrice",
    header: "Total Harga",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalPrice"));
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "purchaseDate",
    header: "Tanggal Pembelian",
    cell: ({ row }) => {
      const date = new Date(row.getValue("purchaseDate"));
      const formatted = date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "isInstallment",
    header: "Cicilan",
    cell: ({ row }) => {
      const inventory = row.original;
      if (!inventory.isInstallment) {
        return <div className="text-muted-foreground">-</div>;
      }
      
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount);
      };

      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      };

      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {formatCurrency(inventory.installmentAmount || 0)}/bulan
          </div>
          <div className="text-xs text-muted-foreground">
            Selesai: {formatDate(inventory.installmentEndDate || '')}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const inventory = row.original;
      const status = row.getValue("status") as string;
      const colorClass = status === "verified" 
        ? "bg-green-100 text-green-700 border-green-200 hover:!bg-green-100 hover:!text-green-700" 
        : "bg-yellow-100 text-yellow-700 border-yellow-200 hover:!bg-yellow-100 hover:!text-yellow-700";
      
      return (
        <div className="flex items-center gap-2">
          <Badge
            className={`flex items-center gap-1 border ${colorClass}`}
          >
            {status === "verified" ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {status === "verified" ? "Verified" : "Pending"}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => {
              const newStatus = status === "verified" ? "pending" : "verified";
              props?.onUpdateStatus?.(inventory, newStatus);
            }}
            title={`Change to ${status === "verified" ? "Pending" : "Verified"}`}
          >
            {status === "verified" ? (
              <ToggleLeft className="h-4 w-4 text-yellow-600" />
            ) : (
              <ToggleRight className="h-4 w-4 text-green-600" />
            )}
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Dibuat",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return <div className="text-muted-foreground">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const inventory = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => props?.onViewDetail?.(inventory)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => props?.onEdit?.(inventory)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={() => props?.onDelete?.(inventory)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Keep backward compatibility
export const columns = createInventoryColumns();
