"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Spinner from "./spinner";
import { AlertTriangle, Clock, CheckCircle, AlertCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useGetBusserStatistics } from "@/hooks/api/useBuser";

const BusserStatusCard = () => {
  const { data: statistics, isFetching } = useGetBusserStatistics();

  const stats = statistics?.data;

  const statusConfig = [
    {
      key: "urgent",
      title: "Urgent",
      icon: Zap,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      href: "/dashboard/busser?status=urgent",
    },
    {
      key: "butuh_tindakan",
      title: "Butuh Tindakan",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      href: "/dashboard/busser?status=butuh_tindakan",
    },
    {
      key: "peringatan",
      title: "Peringatan",
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      href: "/dashboard/busser?status=peringatan",
    },
    {
      key: "tindak_lanjut",
      title: "Tindak Lanjut",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      href: "/dashboard/busser?status=tindak_lanjut",
    },
    {
      key: "selesai",
      title: "Selesai",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      href: "/dashboard/busser?status=selesai",
    },
  ];

  return (
    <>
      {isFetching && (
        <div className="absolute w-full">
          <Spinner />
        </div>
      )}
      {!isFetching && stats && (
        <>
          {statusConfig.map((config) => {
            const IconComponent = config.icon;
            const count = stats[config.key as keyof typeof stats] || 0;
            
            return (
              <Link key={config.key} href={config.href}>
                <Card className={`hover:shadow-md transition-shadow border ${config.borderColor}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
                    <IconComponent className={`h-4 w-4 ${config.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${config.color}`}>
                      {count}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {count === 1 ? 'case' : 'cases'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          
          {/* Total Card */}
          <Card className="border-gray-200 bg-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">
                {stats.total || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                semua cases
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default BusserStatusCard;
