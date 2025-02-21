"use client";
import { ColumnDef } from "@tanstack/react-table";
// import { CellAction } from "./cell-action";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { cn, formatRupiah } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CalendarDays, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { CellAction } from "./cell-action";

const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);
dayjs.locale("id");

export const pendingColumns: ColumnDef<any>[] = [
  {
    accessorKey: "driver",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        Nama Driver
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.driver?.name}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "nominal",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Nominal</span>
    ),
    cell: ({ row }) => <span>{formatRupiah(row.original?.nominal)}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "fleet",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Nama Fleet</span>
    ),
    cell: ({ row }) => <span>{row.original?.fleet?.name}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "location",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Lokasi</span>
    ),
    cell: ({ row }) => <span>{row.original?.location?.name}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "noRekening",

    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        No.Rek / No. Pembayaran
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.noRekening}</span>,
    enableSorting: false,
  },

  {
    accessorKey: "date",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Tanggal</span>
    ),
    cell: ({ row }) => (
      <HoverCard>
        <HoverCardTrigger className="bg-[#f5f5f5] rounded-full py-1 px-3 text-nowrap">
          {row.original?.date}
        </HoverCardTrigger>
        <HoverCardContent
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-muted-foreground font-normal text-[12px] leading-4">
              Tanggal
            </span>
          </div>
          <div className="pt-1">
            <p className="text-[14px] font-semibold leading-5">
              {dayjs(row.original?.date).format("dddd, DD MMMM YYYY")}
            </p>
            <p className="text-[14px] font-normal leading-5">
              Jam {dayjs(row.original?.date).format("H:mm")} WIB
            </p>
          </div>
          <Separator className="my-4" />
        </HoverCardContent>
      </HoverCard>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "bank",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        Nama Bank / Pembayaran
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.bank}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Keterangan</span>
    ),
    cell: ({ row }) => <span>{row.original?.description}</span>,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/reimburse/${row.original?.id}/preview`}
        className={cn(buttonVariants({ variant: "main" }))}
        onClick={(e) => e.stopPropagation()}
      >
        Tinjau
      </Link>
    ),
  },
];

export const rejectedColumns: ColumnDef<any>[] = [
  {
    accessorKey: "driver",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        Nama Driver
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.driver?.name}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "nominal",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Nominal</span>
    ),
    cell: ({ row }) => <span>{formatRupiah(row.original?.nominal)}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "fleet",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Nama Fleet</span>
    ),
    cell: ({ row }) => <span>{row.original?.fleet?.name}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "location",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Lokasi</span>
    ),
    cell: ({ row }) => <span>{row.original?.location?.name}</span>,
    enableSorting: false,
  },

  {
    accessorKey: "noRekening",

    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        No.Rek / No. Pembayaran
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.noRekening}</span>,
    enableSorting: false,
  },

  {
    accessorKey: "date",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Tanggal</span>
    ),
    cell: ({ row }) => (
      <HoverCard>
        <HoverCardTrigger className="bg-[#f5f5f5] rounded-full py-1 px-3 text-nowrap">
          {dayjs(row.original?.date).format("DD MMMM YYYY")}
        </HoverCardTrigger>
        <HoverCardContent
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="pt-1">
            <p className="text-[14px] font-semibold leading-5">
              {dayjs(row.original?.start_date).format("dddd, DD MMMM YYYY")}
            </p>
            <p className="text-[14px] font-normal leading-5">
              Jam {dayjs(row.original?.start_date).format("H:mm")} WIB
            </p>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-muted-foreground font-normal text-[12px] leading-4">
              Tanggal Pengembilan
            </span>
          </div>
        </HoverCardContent>
      </HoverCard>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "bank",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        Nama Bank / Pembayaran
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.bank}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Keterangan</span>
    ),
    cell: ({ row }) => <span>{row.original?.description}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "rejection_reason",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        Alasan Ditolak
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.rejection_reason}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-sm ml-3 font-semibold text-neutral-700">
        Status
      </span>
    ),
    cell: ({ row }) => (
      <span className="bg-red-50 text-red-500 text-xs font-medium flex items-center justify-center px-[10px] py-1 rounded-full text-center">
        {row.original?.status}
      </span>
    ),
    enableSorting: false,
  },

  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
  },
];

export const confirmedColumns: ColumnDef<any>[] = [
  {
    accessorKey: "driver",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        Nama Driver
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.driver?.name}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "nominal",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Nominal</span>
    ),
    cell: ({ row }) => <span>{formatRupiah(row.original?.nominal)}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "fleet",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Nama Fleet</span>
    ),
    cell: ({ row }) => <span>{row.original?.fleet?.name}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "location",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Lokasi</span>
    ),
    cell: ({ row }) => <span>{row.original?.location?.name}</span>,
    enableSorting: false,
  },

  {
    accessorKey: "noRekening",

    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        No.Rek / No. Pembayaran
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.noRekening}</span>,
    enableSorting: false,
  },

  {
    accessorKey: "date",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Tanggal</span>
    ),
    cell: ({ row }) => (
      <HoverCard>
        <HoverCardTrigger className="bg-[#f5f5f5] rounded-full py-1 px-3 text-nowrap">
          {dayjs(row.original?.date).format("DD MMMM YYYY")}
        </HoverCardTrigger>
        <HoverCardContent
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="pt-1">
            <p className="text-[14px] font-semibold leading-5">
              {dayjs(row.original?.start_date).format("dddd, DD MMMM YYYY")}
            </p>
            <p className="text-[14px] font-normal leading-5">
              Jam {dayjs(row.original?.start_date).format("H:mm")} WIB
            </p>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-muted-foreground font-normal text-[12px] leading-4">
              Tanggal Pengembilan
            </span>
          </div>
        </HoverCardContent>
      </HoverCard>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "bank",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        Nama Bank / Pembayaran
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.bank}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Keterangan</span>
    ),
    cell: ({ row }) => <span>{row.original?.description}</span>,
    enableSorting: false,
  },

  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
  },
];
export const completedColumns: ColumnDef<any>[] = [
  {
    accessorKey: "driver",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        Nama Driver
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.driver?.name}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "nominal",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Nominal</span>
    ),
    cell: ({ row }) => <span>{formatRupiah(row.original?.nominal)}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "fleet",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Nama Fleet</span>
    ),
    cell: ({ row }) => <span>{row.original?.fleet?.name}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "location",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Lokasi</span>
    ),
    cell: ({ row }) => <span>{row.original?.location?.name}</span>,
    enableSorting: false,
  },

  {
    accessorKey: "noRekening",

    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        No.Rek / No. Pembayaran
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.noRekening}</span>,
    enableSorting: false,
  },

  {
    accessorKey: "date",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Tanggal</span>
    ),
    cell: ({ row }) => (
      <HoverCard>
        <HoverCardTrigger className="bg-[#f5f5f5] rounded-full py-1 px-3 text-nowrap">
          {dayjs(row.original?.date).format("DD MMMM YYYY")}
        </HoverCardTrigger>
        <HoverCardContent
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="pt-1">
            <p className="text-[14px] font-semibold leading-5">
              {dayjs(row.original?.start_date).format("dddd, DD MMMM YYYY")}
            </p>
            <p className="text-[14px] font-normal leading-5">
              Jam {dayjs(row.original?.start_date).format("H:mm")} WIB
            </p>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-muted-foreground font-normal text-[12px] leading-4">
              Tanggal Pengembilan
            </span>
          </div>
        </HoverCardContent>
      </HoverCard>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "bank",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">
        Nama Bank / Pembayaran
      </span>
    ),
    cell: ({ row }) => <span>{row.original?.bank}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Keterangan</span>
    ),
    cell: ({ row }) => <span>{row.original?.description}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-sm ml-3 font-semibold text-neutral-700">
        Status
      </span>
    ),
    cell: ({ row }) => (
      <span className="bg-green-50 text-green-500 text-xs font-medium flex items-center justify-center px-[10px] py-1 rounded-full text-center">
        {row.original?.status}
      </span>
    ),
    enableSorting: false,
  },

  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
    enableSorting: false,
  },
];
