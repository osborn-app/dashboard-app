"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action"
import dayjs from "dayjs";
import "dayjs/locale/id";
import { convertTime } from "@/lib/utils";

const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

// Helper function to get display name for type
const normalize = (v?: string | null) => {
    if (v === null || v === undefined) return null;
    const trimmed = String(v).trim().toLowerCase();
    return trimmed === "" || trimmed === "null" || trimmed === "undefined" ? null : trimmed;
  };
  
  const getTypeDisplayName = (fleetType: string | null, productCategory: string | null) => {
    const fleet = normalize(fleetType);
    const category = normalize(productCategory);
  
    if (fleet) {
      const fleetTypeMap: Record<string, string> = {
        car: "Mobil",
        motorcycle: "Motor",
        all: "Semua Kendaraan",
      };
      return fleetTypeMap[fleet] ?? fleet; // fallback ke nilai asli kalau tak ada di map
    }
  
    if (category) {
      const productCategoryMap: Record<string, string> = {
        iphone: "iPhone",
        camera: "Camera",
        outdoor: "Outdoor",
        starlink: "Starlink",
        all: "Semua Produk",
      };
      return productCategoryMap[category] ?? category;
    }
  
    // Keduanya kosong → anggap semua produk
    return "Semua Produk";
  };
  

export const pendingColumns: ColumnDef<any>[] = [
    {
        accessorKey: "discount",
        header: "Total Discount",
        cell: ({ row }) => (
            <span>{row.original.discount} %</span>
        ),
    },
    {
        accessorKey: "start_date",
        header: "Start Date",
        cell: ({ row }) => (
            <span>{row.original.start_date}</span>
        ),
    },
    {
        accessorKey: "end_date",
        header: "End Date",
        cell: ({ row }) => (
            <span>{row.original.end_date}</span>
        ),
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
            <span>{row.original.location?.name || `Location ID: ${row.original.location_id}`}</span>
        ),
    },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => (
            <span>{getTypeDisplayName(row.original.fleet_type, row.original.product_category)}</span>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];

export const completedColumns: ColumnDef<any>[] = [
    {
        accessorKey: "discount",
        header: "Total Discount",
        cell: ({ row }) => (
            <span>{row.original.discount} %</span>
        ),
    },
    {
        accessorKey: "start_date",
        header: "Start Date",
        cell: ({ row }) => (
            <span>{row.original.start_date}</span>
        ),
    },
    {
        accessorKey: "end_date",
        header: "End Date",
        cell: ({ row }) => (
            <span>{row.original.end_date}</span>
        ),
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
            <span>{row.original.location?.name || `Location ID: ${row.original.location_id}`}</span>
        ),
    },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => (
            <span>{getTypeDisplayName(row.original.fleet_type, row.original.product_category)}</span>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];
