"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Spinner from "./spinner";
import { Clock3 } from "lucide-react";
import Link from "next/link";
import { useReimburseStatusCount } from "@/hooks/api/useReimburse";

const ReimburseStatusCard = () => {
  const { data: statusCount, isFetching } = useReimburseStatusCount();

  const count = statusCount?.data;

  return (
    <>
      {isFetching && (
        <div className="absolute w-full">
          <Spinner />
        </div>
      )}
      {!isFetching && count && (
        <>
          <Link
            href={{
              pathname: "/dashboard/reimburse",
              query: { status: "pending" },
            }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock3 />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{`${
                  count?.[0].count ?? "0"
                }`}</div>
              </CardContent>
            </Card>
          </Link>
        </>
      )}
    </>
  );
};

export default ReimburseStatusCard;
