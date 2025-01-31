"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { convertTime } from "@/lib/utils";

const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

export const pendingColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <span>{row.original.customer ? row.original.customer?.name : "-"}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipe Tasks",
    cell: ({ row }) => {
      const getType = () => {
        if (
          row.original.type == "delivery" &&
          row.original.is_self_pickup == false
        )
          return "Pengantaran";
        if (
          row.original.type == "delivery" &&
          row.original.is_self_pickup == true
        )
          return "Pengambilan";
        if (
          row.original.type == "pick_up" &&
          row.original.is_self_pickup == false
        )
          return "Penjemputan";
        if (
          row.original.type == "pick_up" &&
          row.original.is_self_pickup == true
        )
          return "Pengembalian";
      };

      return <span>{getType()}</span>;
    },
  },
  {
    accessorKey: "fleet.name",
    header: "Nama Kendaraan",
    cell: ({ row }) => (
      <span>
        {row.original.fleet.name} (
        {row.original.fleet.type == "car" ? "Mobil" : "Motor"})
      </span>
    ),
  },
  {
    accessorKey: "time",
    header: "Waktu",
    cell: ({ row }) => (
      <span>
        {dayjs(row.original.start_date)
          .locale("id")
          .format("dddd, D MMMM YYYY - HH:mm:ss")}
      </span>
    ),
  },
  {
    accessorKey: "driver.name",
    header: "PIC",
    cell: ({ row }) => (
      <span>{row.original.driver ? row.original.driver.name : "-"}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

export const completedColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <span>{row.original.customer ? row.original.customer.name : "-"}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipe Tasks",
    cell: ({ row }) => {
      const getType = () => {
        if (
          row.original.type == "delivery" &&
          row.original.is_self_pickup == false
        )
          return "Pengantaran";
        if (
          row.original.type == "delivery" &&
          row.original.is_self_pickup == true
        )
          return "Pengambilan";
        if (
          row.original.type == "pick_up" &&
          row.original.is_self_pickup == false
        )
          return "Penjemputan";
        if (
          row.original.type == "pick_up" &&
          row.original.is_self_pickup == true
        )
          return "Pengembalian";
      };

      return <span>{getType()}</span>;
    },
  },
  {
    accessorKey: "fleet.name",
    header: "Nama Kendaraan",
    cell: ({ row }) => (
      <span>
        {row.original.fleet.name} (
        {row.original.fleet.type == "car" ? "Mobil" : "Motor"})
      </span>
    ),
  },
  {
    accessorKey: "time",
    header: "Waktu",
    cell: ({ row }) => (
      <span>
        {row.original.start_date
          ? dayjs(row.original.start_date)
              .locale("id")
              .format("dddd, D MMMM YYYY - HH:mm:ss")
          : "-"}
      </span>
    ),
  },
  {
    accessorKey: "driver.name",
    header: "PIC",
    cell: ({ row }) => (
      <span>{row.original.driver ? row.original.driver.name : "-"}</span>
    ),
  },
  {
    accessorKey: "driver.name",
    header: "Durasi",
    cell: ({ row }) => {
      return (
        <span>
          {row?.original?.progress_duration_second
            ? convertTime(row?.original?.progress_duration_second)
            : "-"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
