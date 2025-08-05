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
  fleet?: {
    id: number;
    name: string;
    type: string;
    color: string;
    plate_number: string;
  };
};

export type Fleet = {
  id: number;
  name: string;
  type: string;
  color: string;
  plate_number?: string;
  "plate number"?: string;
  status: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

// Type guard to check if data is Fleet
const isFleet = (data: any): data is Fleet => {
  return "name" in data && "type" in data && !("inspector_name" in data);
};

// Type guard to check if data is Inspection
const isInspection = (data: any): data is Inspection => {
  return "inspector_name" in data;
};

// Columns untuk Available Fleets (Tersedia tab)
export const SimpleInspectionsColumns: ColumnDef<Fleet | Inspection>[] = [
  {
    accessorKey: "name",
    header: "Fleet",
    cell: ({ row }) => {
      const data = row.original;
      let name = "N/A";
      
      if (isFleet(data)) {
        name = data.name;
      } else if (isInspection(data) && data.fleet) {
        name = data.fleet.name;
      }
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "plate_number",
    header: "Plat",
    cell: ({ row }) => {
      const data = row.original;
      let plateNumber = "N/A";
      
      if (isFleet(data)) {
        plateNumber = data.plate_number || data["plate number"] || "N/A";
      } else if (isInspection(data) && data.fleet) {
        plateNumber = data.fleet.plate_number || "N/A";
      }
      
      return <span>{plateNumber}</span>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const data = row.original;
      let type = "N/A";
      
      if (isFleet(data)) {
        type = data.type;
      } else if (isInspection(data) && data.fleet) {
        type = data.fleet.type;
      }
      
      return <span className="capitalize">{type}</span>;
    },
  },
];
