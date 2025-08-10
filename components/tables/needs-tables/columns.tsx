"use client";
import { ColumnDef } from "@tanstack/react-table";
import { MaintenanceCellAction } from "./maintenance-cell-action";
import { Car, Calendar, Clock } from "lucide-react";

export const needsColumns: ColumnDef<any>[] = [
  {
    accessorKey: "armada",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Armada</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Car className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-medium">{row.original?.armada}</div>
          <div className="text-xs text-gray-500">{row.original?.plate_number}</div>
        </div>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "mulai",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Tanggal Mulai</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>
          {row.original?.mulai ? new Date(row.original.mulai).toLocaleDateString('id-ID') : "-"}
        </span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "estimasi",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Estimasi (hari)</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>{row.original?.estimasi} hari</span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Status</span>
    ),
    cell: ({ row }) => {
      const status = row.original?.status;
      const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
          case 'ongoing':
            return 'bg-blue-100 text-blue-800';
          case 'done':
            return 'bg-green-100 text-green-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }
      };
      
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)}`}>
          {status === 'ongoing' ? 'Sedang Berjalan' : status === 'done' ? 'Selesai' : status}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <MaintenanceCellAction data={row.original} />,
  },
];
