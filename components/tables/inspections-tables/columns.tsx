"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type Inspection = {
  id: number;
  inspector_name: string;
  kilometer: number;
  inspection_date: string;
  status: "active" | "pending_repair" | "completed";
  oil_status: "aman" | "tidak_aman";
  tire_status: "aman" | "tidak_aman";
  battery_status: "aman" | "tidak_aman";
  description: string;
  repair_photo_url: string | null;
  repair_completion_date: string | null;
  repair_duration_days?: number;
  fleet: {
    id: number;
    name: string;
    type: string;
    color: string;
    plate_number: string;
  };
};

// Columns dengan struktur: Fleet | Plat | Type | Aksi
export const SimpleInspectionsColumns: ColumnDef<Inspection>[] = [
  {
    accessorKey: "fleet",
    header: "Fleet",
    cell: ({ row }) => {
      const fleet = row.getValue("fleet") as any;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{fleet.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "fleet",
    header: "Plat",
    cell: ({ row }) => {
      const fleet = row.getValue("fleet") as any;
      return <span>{fleet.plate_number}</span>;
    },
  },
  {
    accessorKey: "fleet",
    header: "Type",
    cell: ({ row }) => {
      const fleet = row.getValue("fleet") as any;
      return <span className="capitalize">{fleet.type}</span>;
    },
  },
];
