import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import { assignBusserTask } from "@/client/busserClient";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useInvalidateBuserQueries } from "@/hooks/api/useBuser";
import { cn } from "@/lib/utils";

export type Buser = {
  id: string;
  name: string;
  phone_number: string;
  emergency_number: string;
  email: string;
  status: string;
  status_updated_at: string;
  investigator_id: number | null;
  notes: string | null;
  order: {
    id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      emergency_number?: string;
      email?: string;
    } | null;
    fleet: {
      id: number;
      name: string;
      plate_number: string;
      type: string;
      color: string;
    };
    payment_status: string;
  };
  days_late: number;
};

const BACKEND_BASE_URL = "https://dev.api.transgo.id/api";

// Payment status styling functions
export function getStatusVariant(status: string): string {
  switch (status) {
    case "pending":
      return "bg-red-50 text-red-500";
    case "waiting":
      return "bg-yellow-50 text-yellow-500";
    case "partially paid":
      return "bg-yellow-50 text-yellow-500";
    case "confirmed":
      return "bg-orange-50 text-orange-500";
    case "on_going":
      return "bg-blue-50 text-blue-500";
    case "on_progress":
      return "bg-blue-50 text-blue-500";
    case "done":
      return "bg-green-50 text-green-500";
    case "rejected":
      return "bg-red-50 text-red-500";
    case "failed":
      return "bg-gray-50 text-gray-500";
    default:
      return "bg-red-50 text-red-500";
  }
}

export function getPaymentStatusLabel(payment_status: string): string {
  switch (payment_status) {
    case "pending":
      return "Belum Dibayar";
    case "done":
      return "Lunas";
    default:
      return payment_status;
  }
}

const statusColorMap: Record<string, string> = {
  peringatan: "bg-yellow-50 text-yellow-500",
  butuh_tindakan: "bg-orange-50 text-orange-500",
  urgent: "bg-red-50 text-red-500",
  tindak_lanjut: "bg-gray-50 text-gray-800",
  selesai: "bg-green-50 text-green-500",
};

const ActionButton: React.FC<{ row: Buser }> = ({ row }) => {
  const status = row.status;
  const router = useRouter();
  const invalidateBuserQueries = useInvalidateBuserQueries();

  if (status === "urgent") {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={async (e) => {
          e.stopPropagation();
          try {
            await assignBusserTask(row.id, 1); // TODO: ganti id sesuai user login
            // Invalidate all buser queries to refresh the table
            invalidateBuserQueries();
            router.push(
              "/dashboard/buser?status=tindak_lanjut&page=1&limit=10&q=",
            );
          } catch (e) {
            alert("Gagal memindahkan ke Tindak Lanjut");
          }
        }}
      >
        Tindak Lanjut
      </Button>
    );
  } else if (status === "selesai") {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/dashboard/buser/${row.id}/info`);
        }}
      >
        Informasi
      </Button>
    );
  } else {
    // Semua status lain (peringatan, butuh_tindakan, tindak_lanjut) ke preview
    return (
      <Link
        href={`/dashboard/buser/${row.id}/preview`}
        className={buttonVariants({ variant: "main" }) + " px-3 py-1 text-xs"}
        onClick={(e) => e.stopPropagation()}
      >
        Tinjau
      </Link>
    );
  }
  // Default fallback (should not happen)
  return null;
};

export const BuserColumns: ColumnDef<Buser>[] = [
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => (
      <span className="max-w-[200px] whitespace-normal break-words block">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "phone_number",
    header: "Nomor Telepon",
    cell: ({ row }) => row.original.phone_number,
  },
  {
    accessorKey: "order.fleet.name",
    header: "Fleet",
    cell: ({ row }) => row.original.order.fleet.name,
  },
  {
    accessorKey: "order.fleet.plate_number",
    header: "Plat Nomor",
    cell: ({ row }) => row.original.order.fleet.plate_number,
  },
  {
    accessorKey: "days_late",
    header: "Hari Terlambat",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.days_late} hari</span>
    ),
  },
  {
    accessorKey: "order.payment_status",
    header: "Status Pembayaran",
    cell: ({ row }) => (
      <span
        className={cn(
          getStatusVariant(row.original.order.payment_status),
          "text-xs font-medium flex items-center justify-center py-1 rounded-md text-center",
        )}
      >
        {getPaymentStatusLabel(row.original.order.payment_status)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-sm font-semibold text-neutral-700">Status</span>
    ),
    cell: ({ row }) => (
      <span
        className={
          statusColorMap[row.original.status] +
          " text-xs font-medium rounded-md text-center px-2 py-0.5 whitespace-nowrap"
        }
      >
        {row.original.status === "selesai"
          ? "Selesai"
          : row.original.status
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
      </span>
    ),
  },
  {
    id: "action",
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        <ActionButton row={row.original} />
      </div>
    ),
  },
];
