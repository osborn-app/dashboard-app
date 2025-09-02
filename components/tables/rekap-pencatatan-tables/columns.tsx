"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { formatDate } from "@/lib/utils";

export const columnsOrderanSewa: ColumnDef<any>[] = [
  {
    accessorKey: "no",
    header: "No",
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  {
    accessorKey: "nama_customer",
    header: "Nama Customer",
    cell: ({ row }) => <span>{row.original.customer?.name ?? "-"}</span>,
  },
  {
    accessorKey: "armada",
    header: "Armada",
    cell: ({ row }) => <span>{row.original.fleet?.name ?? "-"}</span>,
  },
  {
    accessorKey: "nomor_invoice",
    header: "Nomor Invoice",
    cell: ({ row }) => <span>{row.original.invoice_number ?? "-"}</span>,
  },
  {
    accessorKey: "total_harga",
    header: "Total Harga",
    cell: ({ row }) => <span>{row.original.total_price ?? "-"}</span>,
  },
  {
    accessorKey: "pembayaran",
    header: "Pembayaran",
    cell: ({ row }) => <span>{row.original.payment_status ?? "-"}</span>,
  },
];

export const columnsReimburse: ColumnDef<any>[] = [
  {
    accessorKey: "no",
    header: "No",
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  {
    accessorKey: "nama_driver",
    header: "Nama Driver",
    cell: ({ row }) => <span>{row.original.driver?.name ?? "-"}</span>,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => <span>{row.original.nominal ?? "-"}</span>,
  },
  {
    accessorKey: "no_rekening",
    header: "No Rekening",
    cell: ({ row }) => <span>{row.original.noRekening ?? "-"}</span>,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => <span>{formatDate(row.original.date) ?? "-"}</span>,
  },
  {
    accessorKey: "nama_bank",
    header: "Nama Bank",
    cell: ({ row }) => <span>{row.original.bank ?? "-"}</span>,
  },
  {
    accessorKey: "kebutuhan",
    header: "Kebutuhan",
    cell: ({ row }) => <span>{row.original.description ?? "-"}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <span>{row.original.status ?? "-"}</span>,
  },
];

export const columnsInventaris: ColumnDef<any>[] = [
  {
    accessorKey: "no",
    header: "No",
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  {
    accessorKey: "nama_aset",
    header: "Nama Aset",
    cell: ({ row }) => <span>{row.original.name ?? "-"}</span>,
  },
  {
    accessorKey: "jumlah",
    header: "Jumlah",
    cell: ({ row }) => <span>{row.original.quantity ?? "-"}</span>,
  },
  {
    accessorKey: "harga_satuan",
    header: "Harga Satuan",
    cell: ({ row }) => <span>{row.original.unit_price ?? "-"}</span>,
  },
  {
    accessorKey: "total_harga",
    header: "Total Harga",
    cell: ({ row }) => <span>{row.original.total ?? "-"}</span>,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => <span>{formatDate(row.original.date) ?? "-"}</span>,
  },
];

export const columnsLainnya: ColumnDef<any>[] = [
  {
    accessorKey: "no",
    header: "No",
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  {
    accessorKey: "nama_transaksi",
    header: "Nama Transaksi",
    cell: ({ row }) => <span>{row.original.name ?? "-"}</span>,
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => <span>{row.original.category ?? "-"}</span>,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => <span>{row.original.nominal ?? "-"}</span>,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => <span>{formatDate(row.original.date) ?? "-"}</span>,
  },
  {
    accessorKey: "keterangan",
    header: "Keterangan",
    cell: ({ row }) => <span>{row.original.description ?? "-"}</span>,
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => <CellAction data={row.original} type="lainnya" />,
  },
];
