"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { formatDate, formatRupiah, cn } from "@/lib/utils";
import {
  getPaymentStatusLabel,
  getStatusVariant,
} from "@/app/(dashboard)/dashboard/orders/[orderId]/types/order";

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
    cell: ({ row }) => <span>{formatRupiah(row.original.total_price) ?? "-"}</span>,
  },
  {
    accessorKey: "pembayaran",
    header: "Pembayaran",
    cell: ({ row }) => (
      <span
        className={cn(
          getStatusVariant(row.original?.payment_status),
          "text-xs font-medium flex items-center justify-center py-1 rounded-md text-center",
        )}
      >
        {getPaymentStatusLabel(row.original?.payment_status)}
      </span>
    ),
  },
];

export const columnsProduk: ColumnDef<any>[] = [
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
    accessorKey: "product",
    header: "Produk",
    cell: ({ row }) => <span>{row.original.product?.name ?? "-"}</span>,
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => (
      <span>
        {row.original.product?.category_label ?? row.original.product?.category ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "nomor_invoice",
    header: "Nomor Invoice",
    cell: ({ row }) => <span>{row.original.invoice_number ?? "-"}</span>,
  },
  {
    accessorKey: "total_harga",
    header: "Total Harga",
    cell: ({ row }) => <span>{formatRupiah(row.original.total_price) ?? "-"}</span>,
  },
  {
    accessorKey: "pembayaran",
    header: "Pembayaran",
    cell: ({ row }) => (
      <span
        className={cn(
          getStatusVariant(row.original?.payment_status),
          "text-xs font-medium flex items-center justify-center py-1 rounded-md text-center",
        )}
      >
        {getPaymentStatusLabel(row.original?.payment_status)}
      </span>
    ),
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
    cell: ({ row }) => <span>{formatRupiah(row.original.nominal) ?? "-"}</span>,
  },
  {
    accessorKey: "no_rekening",
    header: "No Rekening",
    cell: ({ row }) => <span>{row.original.noRekening ?? "-"}</span>,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => <span>{formatDate(row.original.date, false) ?? "-"}</span>,
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
    cell: ({ row }) => <span>{row.original.assetName ?? "-"}</span>,
  },
  {
    accessorKey: "jumlah",
    header: "Jumlah",
    cell: ({ row }) => <span>{row.original.quantity ?? "-"}</span>,
  },
  {
    accessorKey: "harga_satuan",
    header: "Harga Satuan",
    cell: ({ row }) => <span>{formatRupiah(row.original.unitPrice ?? 0)}</span>,
  },
  {
    accessorKey: "total_harga",
    header: "Total Harga",
    cell: ({ row }) => <span>{formatRupiah(row.original.totalPrice ?? 0)}</span>,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => <span>{formatDate(row.original.purchaseDate, false) ?? "-"}</span>,
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
    cell: ({ row }) => <span>{row.original.categoryEntity?.name ?? "-"}</span>,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => <span>{formatRupiah(row.original.nominal ?? 0)}</span>,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => <span>{formatDate(row.original.date, false) ?? "-"}</span>,
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
