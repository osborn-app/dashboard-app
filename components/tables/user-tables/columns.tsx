"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export const UserColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span>{row.original.email ?? "-"}</span>,
  },
  {
    accessorKey: "phone_number",
    header: "Nomor Telepon",
    cell: ({ row }) => <span>{row.original.phone_number ?? "-"}</span>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      const roleLabels: Record<string, string> = {
        operation: "Operation",
        admin: "Admin",
        finance: "Finance",
      };
      return <span>{roleLabels[role] || role}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
