"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { formatDate } from "@/lib/utils";

export const columnsOrderanSewa: ColumnDef<any>[] = [
  {
    accessorKey: "no",
    header: "No",
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
  },
  {
    accessorKey: "nama_aset",
    header: "Nama Aset",
    cell: ({ row }) => <span>{row.original.nama_aset ?? "-"}</span>,
  },
  {
    accessorKey: "jumlah",
    header: "Jumlah",
    cell: ({ row }) => <span>{row.original.jumlah ?? "-"}</span>,
  },
  {
    accessorKey: "harga_satuan",
    header: "Harga Satuan",
    cell: ({ row }) => <span>{row.original.harga_satuan ?? "-"}</span>,
  },
  {
    accessorKey: "total_harga",
    header: "Total Harga",
    cell: ({ row }) => <span>{row.original.total_harga ?? "-"}</span>,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => <span>{row.original.tanggal ?? "-"}</span>,
  },
];

export const columnsLainnya: ColumnDef<any>[] = [
  {
    accessorKey: "no",
    header: "No",
  },
  {
    accessorKey: "nomor_transaksi",
    header: "Nomor Transaksi",
    cell: ({ row }) => <span>{row.original.nomor_transaksi ?? "-"}</span>,
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => <span>{row.original.kategori ?? "-"}</span>,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => <span>{row.original.total ?? "-"}</span>,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => <span>{row.original.tanggal ?? "-"}</span>,
  },
  {
    accessorKey: "keterangan",
    header: "Keterangan",
    cell: ({ row }) => <span>{row.original.keterangan ?? "-"}</span>,
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => <CellAction data={row.original} type="lainnya" />,
  },
];
