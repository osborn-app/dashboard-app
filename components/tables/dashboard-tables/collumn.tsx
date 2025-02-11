"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { formatRupiah } from "@/lib/utils";

import "dayjs/locale/id";
import { IItems } from "@/hooks/components/useRecapsStore";

const duration = require("dayjs/plugin/duration");
dayjs.locale("id");
dayjs.extend(duration);

export const columns: ColumnDef<IItems>[] = [
    {
        accessorKey: "fleet",
        header: () => (
            <span className="text-sm font-bold text-neutral-700">Armada</span>
        ),
        size: 300,
        cell: ({ row }) => (
            <span className="text-sm font-medium">{row.original.fleet?.name}</span>
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
                Total Pendapatan
            </span>
        ),
        cell: ({ row }) => {
            const commission = row.original?.owner_commission
            const fleet = row.original?.fleet
            return (
                <span className="text-sm font-medium">
                    {commission ? (
                        <>
                            {formatRupiah(commission)}
                        </>
                    ) : (
                        ""
                    )}
                    {commission == 0 && fleet ? "Rp 0" : ""}
                </span>
            );
        },
    },
];
