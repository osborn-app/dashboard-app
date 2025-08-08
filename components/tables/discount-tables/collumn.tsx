"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action"
import dayjs from "dayjs";
import "dayjs/locale/id";
import { convertTime } from "@/lib/utils";

const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

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
        accessorKey: "fleet_type",
        header: "Jenis Kendaraan",
        cell: ({ row }) => (
            <span>{row.original.fleet_type}</span>
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
        accessorKey: "fleet_type",
        header: "Jenis Kendaraan",
        cell: ({ row }) => (
            <span>{row.original.fleet_type}</span>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];
