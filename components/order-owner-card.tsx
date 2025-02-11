"use client";

import React, { useEffect, useState } from "react";

import useRecapsStore from "@/hooks/components/useRecapsStore";
import { useMonthYearState } from "@/hooks/useMonthYearState";
import Spinner from "@/components/spinner";
import Link from "next/link";
import { CircleDollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatRupiah } from "@/lib/utils";
import DashboardTable from "./tables/dashboard-tables/dashboard-tables";
import { columns } from "./tables/dashboard-tables/collumn";

const OrderOwnerStatusCard = () => {
    const { month, year } = useMonthYearState();

    const { items, total, isFetching } = useRecapsStore({ status: "accepted" }, true);
    const { total: totalIntervalMonth, isFetching: isFetchingIntervalMonth } = useRecapsStore({
        status: "accepted",
        month: month,
        year: year,
    });
    const { total: totalIntervalDay, isFetching: isFetchingItervalDay } = useRecapsStore({
        status: "accepted",
        start_date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
    })

    return (
        <>
            {isFetching || isFetchingIntervalMonth || isFetchingItervalDay ? (
                <div className="absolute w-full">
                    <Spinner />
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total</CardTitle>
                                <CircleDollarSign />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{`${formatRupiah(total.owner_comission) ?? "0"}`}</div>
                            </CardContent>
                        </Card>
                        <Link
                            href={{
                                pathname: "/dashboard/recap",
                                query: { status: "pending" },
                            }}
                        >
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Bulan Ini</CardTitle>
                                    <CircleDollarSign />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{`${formatRupiah(totalIntervalMonth.owner_comission) ?? "0"}`}</div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link
                            href={{
                                pathname: "/dashboard/recap",
                                query: { status: "pending" },
                            }}
                        >
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Hari Ini</CardTitle>
                                    <CircleDollarSign />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{`${formatRupiah(totalIntervalDay.owner_comission) ?? "0"}`}</div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    <DashboardTable columns={columns} total={total} data={items} />
                </div>
            )}
        </>
    );
};

export default OrderOwnerStatusCard;
