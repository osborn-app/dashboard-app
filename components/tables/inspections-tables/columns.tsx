"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CellAction } from "./cell-action";
import { formatDateTime } from "@/lib/utils";

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
  {
    accessorKey: "color",
    header: "Warna",
    cell: ({ row }) => {
      const data = row.original;
      let color = "N/A";

      if (isFleet(data)) {
        color = data.color;
      } else if (isInspection(data) && data.fleet) {
        color = data.fleet.color;
      }

      return <span className="capitalize">{color}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;

      // Untuk fleet data (tersedia), kita perlu membuat inspection object sementara
      if (isFleet(data)) {
        const tempInspection: Inspection = {
          id: data.id,
          inspector_name: "",
          kilometer: 0,
          inspection_date: "",
          status: "active",
          oil_status: "aman",
          tire_status: "aman",
          battery_status: "aman",
          description: "",
          repair_photo_url: null,
          repair_completion_date: null,
          fleet: {
            id: data.id,
            name: data.name,
            type: data.type,
            color: data.color,
            plate_number: data.plate_number || data["plate number"] || "",
          },
        };
        return <CellAction data={tempInspection} status="active" />;
      }

      // Untuk inspection data
      if (isInspection(data)) {
        return <CellAction data={data} status={data.status} />;
      }

      return null;
    },
  },
];

// Columns untuk Ongoing Inspections (pending_repair)
export const OngoingInspectionsColumns: ColumnDef<Inspection>[] = [
  {
    accessorKey: "fleet.name",
    header: "Fleet",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{data.fleet?.name || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "fleet.plate_number",
    header: "Plat",
    cell: ({ row }) => {
      const data = row.original;
      return <span>{data.fleet?.plate_number || "N/A"}</span>;
    },
  },
  {
    accessorKey: "fleet.type",
    header: "Type",
    cell: ({ row }) => {
      const data = row.original;
      return <span className="capitalize">{data.fleet?.type || "N/A"}</span>;
    },
  },
  {
    accessorKey: "inspector_name",
    header: "Inspektor",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <span className="font-medium">{data.inspector_name || "N/A"}</span>
      );
    },
  },
  {
    accessorKey: "inspection_date",
    header: "Tanggal Inspeksi",
    cell: ({ row }) => {
      const data = row.original;
      return <span>{formatDateTime(new Date(data.inspection_date))}</span>;
    },
  },
  {
    accessorKey: "repair_duration_days",
    header: "Estimasi",
    cell: ({ row }) => {
      const data = row.original;
      const duration = data.repair_duration_days;

      if (!duration) {
        return <span className="text-muted-foreground">estimasi belum ditentukan</span>;
      }

      return (
        <div className="flex flex-col">
          <span className="font-medium">{duration} hari</span>
          {data.repair_duration_days && (
            <span className="text-xs text-muted-foreground">
              Selesai:{" "}
              {new Date(data.repair_duration_days).toLocaleDateString("id-ID")}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;
      return <CellAction data={data} status="pending_repair" />;
    },
  },
];

// Columns untuk Completed Inspections (selesai)
export const CompletedInspectionsColumns: ColumnDef<Inspection>[] = [
  {
    accessorKey: "fleet.name",
    header: "Fleet",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{data.fleet?.name || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "fleet.plate_number",
    header: "Plat",
    cell: ({ row }) => {
      const data = row.original;
      return <span>{data.fleet?.plate_number || "N/A"}</span>;
    },
  },
  {
    accessorKey: "fleet.type",
    header: "Type",
    cell: ({ row }) => {
      const data = row.original;
      return <span className="capitalize">{data.fleet?.type || "N/A"}</span>;
    },
  },
  {
    accessorKey: "inspector_name",
    header: "Inspektor",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <span className="font-medium">{data.inspector_name || "N/A"}</span>
      );
    },
  },
  {
    accessorKey: "inspection_date",
    header: "Tanggal Inspeksi",
    cell: ({ row }) => {
      const data = row.original;
      return <span>{formatDateTime(new Date(data.inspection_date))}</span>;
    },
  },
  {
    accessorKey: "repair_duration_days",
    header: "Estimasi",
    cell: ({ row }) => {
      const data = row.original;
      const estimation = data.repair_duration_days;

      if (!estimation) {
        return <span className="text-muted-foreground">Belum ditentukan</span>;
      }

      return (
        <div className="flex flex-col">
          <span className="font-medium">{estimation} hari</span>
          {data.repair_completion_date && (
            <span className="text-xs text-muted-foreground">
              Selesai:{" "}
              {new Date(data.repair_completion_date).toLocaleDateString(
                "id-ID",
              )}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;
      return <CellAction data={data} status="completed" />;
    },
  },
];
