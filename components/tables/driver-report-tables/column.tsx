"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DriverReport } from "@/app/(dashboard)/dashboard/driver-shift/dummy-data";

export const createDriverReportColumns = (): ColumnDef<DriverReport>[] => [
  {
    accessorKey: "namaDriver",
    header: "Nama Driver",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.namaDriver}</span>
    ),
  },
  {
    accessorKey: "pengantaran",
    header: "Pengantaran",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.pengantaran}</span>
    ),
  },
  {
    accessorKey: "penjemputan",
    header: "Penjemputan",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.penjemputan}</span>
    ),
  },
  {
    accessorKey: "taskDiluarJamKerja",
    header: "Task Diluar Jam Kerja",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.taskDiluarJamKerja}</span>
    ),
  },
];