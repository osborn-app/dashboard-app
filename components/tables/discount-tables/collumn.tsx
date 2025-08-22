"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action"
import dayjs from "dayjs";
import "dayjs/locale/id";
import { convertTime } from "@/lib/utils";

const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

// Helper function to get display name for type
const getTypeDisplayName = (fleetType: string | null, productCategory: string | null) => {
  if (fleetType) {
    const fleetTypeMap: { [key: string]: string } = {
      'car': 'Mobil',
      'motorcycle': 'Motor',
      'all': 'Semua Kendaraan'
    };
    return fleetTypeMap[fleetType] || fleetType;
  }
  
  if (productCategory) {
    const productCategoryMap: { [key: string]: string } = {
      'iphone': 'iPhone',
      'camera': 'Camera',
      'outdoor': 'Outdoor',
      'starlink': 'Starlink',
      'all': 'Semua Produk'
    };
    return productCategoryMap[productCategory] || productCategory;
  }
  
  // Handle null product_category (which means "all products" in backend)
  if (productCategory === null) {
    return 'Semua Produk';
  }
  
  return '-';
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
