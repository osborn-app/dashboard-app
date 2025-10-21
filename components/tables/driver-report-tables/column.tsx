"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DriverReport } from "@/app/(dashboard)/dashboard/driver-shift/dummy-data";

export const createDriverReportColumns = (): ColumnDef<DriverReport>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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