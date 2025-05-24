"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Customer = {
  id: string;
  name: string;
  email: string;
};

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
];
