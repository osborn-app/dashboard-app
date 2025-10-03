"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export const columns = (
  onEdit?: (brand: any) => void,
  onDelete?: (brand: any) => void
): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => <span>{row.original.name ?? "-"}</span>,
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} onDelete={onDelete} />,
    },
];
