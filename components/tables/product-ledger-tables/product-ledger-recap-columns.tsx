"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { cn, formatRupiah } from "@/lib/utils";

import "dayjs/locale/id";
import { IItems } from "@/hooks/components/useProductLedgersStore";

import { getLedgerStatusLabel, getStatusVariant } from "../recap-tables/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { HoverCardPortal } from "@radix-ui/react-hover-card";
import { CalendarDays } from "lucide-react";
import { Separator } from "@/components/ui/separator";
const duration = require("dayjs/plugin/duration");
dayjs.locale("id");
dayjs.extend(duration);

export const productLedgerRecapColumns: ColumnDef<IItems>[] = [
  {
    accessorKey: "date",
    header: () => (
      <span className="text-sm font-bold text-neutral-700">Tanggal</span>
    ),
    size: 105,
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.date
          ? dayjs(row.original.date).locale("id").format("DD - dddd")
          : ""}
      </span>
    ),
  },
  {
    accessorKey: "product",
    header: () => (
      <span className="text-sm font-bold text-neutral-700">Produk</span>
    ),
    size: 300,
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.product?.name}</span>
    ),
  },
  {
    accessorKey: "cashflow",
    meta: {
      centerHeader: true,
    },
    size: 250,
    header: () => (
      <span className="text-sm font-bold text-neutral-700">Arus Pemasukan</span>
    ),
    cell: ({ row }) =>
      row.original.category?.name ? (
        <span
          className={cn(
            row.original.debit_amount !== null
              ? "text-green-500"
              : "text-red-500",
            row.original.debit_amount !== null ? "bg-green-50" : "bg-red-50",
            "font-medium text-[12px] w-fit h-[20px] leading-5 px-2.5 py-1 rounded-full",
          )}
        >
          {row.original.category.name}
        </span>
      ) : null,
  },
  {
    accessorKey: "status",
    meta: {
      centerHeader: true,
    },
    size: 154,
    header: () => (
      <span className="text-sm font-bold text-neutral-700">Status</span>
    ),
    cell: ({ row }) =>
      row.original.status ? (
        <span
          className={cn(
            getStatusVariant(row.original.status),
            "font-medium text-[12px] leading-5 px-2.5 py-1 rounded-full capitalize",
          )}
        >
          {getLedgerStatusLabel(row.original.status)}
        </span>
      ) : null,
  },
  {
    accessorKey: "customer",
    header: () => (
      <span className="text-sm font-bold text-neutral-700">Pelanggan</span>
    ),
    size: 250,
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original?.user?.name || ""}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: () => (
      <span className="text-sm font-bold text-neutral-700">Keterangan</span>
    ),
    size: 250,
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.description || ""}
      </span>
    ),
  },
  {
    accessorKey: "duration",
    meta: {
      centerHeader: true,
      stickyColumn: true,
      index: 3,
    },
    header: () => (
      <span className="text-sm font-bold text-neutral-700">Waktu</span>
    ),
    size: 154,
    enableSorting: false,
    cell: ({ row }) =>
      row.original.duration ? (
        <HoverCard>
          <HoverCardTrigger>
            <span className="bg-[#f5f5f5] font-medium text-[12px] leading-5 rounded-full py-1 px-2.5">
              {row.original.duration} Hari
            </span>
          </HoverCardTrigger>
          <HoverCardPortal container={document.body}>
            <HoverCardContent>
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-muted-foreground font-normal text-[12px] leading-4">
                  Tanggal Pengambilan
                </span>
              </div>
              <div className="pt-1">
                <p className="text-[14px] font-semibold leading-5">
                  {dayjs(row.original?.date).format("dddd, DD MMMM YYYY")}
                </p>
                <p className="text-[14px] font-normal leading-5">
                  Jam {dayjs(row.original.date).format("H:mm")} WIB
                </p>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-muted-foreground font-normal text-[12px] leading-4">
                  Tanggal Pengembilan
                </span>
              </div>
              <div className="pt-1">
                <p className="text-[14px] font-semibold leading-5">
                  {dayjs(row.original?.end_date).format("dddd, DD MMMM YYYY")}
                </p>
                <p className="text-[14px] font-normal leading-5">
                  Jam {dayjs(row.original?.end_date).format("H:mm")} WIB
                </p>
              </div>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      ) : null,
  },
  {
    accessorKey: "amount_plus",
    meta: {
      centerHeader: true,
      stickyColumn: true,
      index: 2,
    },
    size: 200,
    header: () => (
      <span className="text-sm font-bold text-neutral-700">Debit (+)</span>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.debit_amount !== null
          ? "+ " +
            formatRupiah(row.original.debit_amount) +
            ((row.original.order?.discount || 0) > 0
              ? ` (${row.original.order?.discount}% OFF)`
              : "")
          : ""}
      </span>
    ),
  },
  {
    accessorKey: "amount_min",
    meta: {
      centerHeader: true,
      stickyColumn: true,
      index: 1,
    },
    size: 200,
    header: () => (
      <span className="text-sm font-bold text-neutral-700">Kredit (-)</span>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.credit_amount !== null
          ? "- " + formatRupiah(row.original.credit_amount)
          : ""}
      </span>
    ),
  },
  {
    accessorKey: "commission_amount",
    meta: {
      centerHeader: true,
      stickyColumn: true,
      index: 0,
    },
    size: 200,
    header: () => (
      <span className="text-sm font-bold text-neutral-700">
        Perhitungan Komisi
      </span>
    ),
    cell: ({ row }) => {
      const commission =
        row.original?.owner_commission ||
        row.original?.credit_amount ||
        row.original?.debit_amount;
      return (
        <span className="text-sm font-medium">
          {commission ? (
            <>
              {row.original?.credit_amount !== null ? "- " : "+ "}
              {formatRupiah(commission)}
              {row.original?.owner_commission !== undefined &&
              row.original.owner_commission !== null &&
              row.original.product?.commission?.owner !== null
                ? ` (${row.original.product.commission?.owner}%)`
                : ""}
            </>
          ) : (
            ""
          )}
        </span>
      );
    },
  },
];
