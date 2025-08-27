"use client";

import BreadCrumb from "@/components/breadcrumb";
import Spinner from "@/components/spinner";
import { useGetMaintenanceById } from "@/hooks/api/useNeeds";
import { formatDate } from "@/lib/utils";
import React from "react";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, FileText, Clock, BookText} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Page({ params }: { params: { needsId: number } }) {
  const { data: session } = useSession();

  const breadcrumbItems = [
    { title: "Maintenance", link: "/dashboard/needs" },
    { title: "Detail Maintenance", link: "/dashboard/needs/detail" },
  ];

  const { data, isFetching } = useGetMaintenanceById(params.needsId, session?.user?.accessToken || "");

  const getStatusBadge = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "done":
        return (
          <Badge className="bg-green-500 text-white text-base px-5 py-1 cursor-default hover:bg-green-500">
            Selesai
          </Badge>
        );
      case "ongoing":
        return (
          <Badge className="bg-blue-500 text-white text-base px-4 py-2 cursor-default hover:bg-blue-500">
            Sedang Berjalan
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-base px-4 py-2 cursor-default hover:bg-secondary">
            {status || "N/A"}
          </Badge>
        );
    }
  };
  

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {isFetching && <Spinner />}
        {!isFetching && data && (
          <div className="space-y-6">
            {/* Header with Status */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Detail Maintenance</h1>
                <p className="text-muted-foreground">
                  Informasi lengkap maintenance kendaraan
                </p>
              </div>
              {getStatusBadge(data.status)}
            </div>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fleet Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Informasi Fleet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Nama Fleet
                      </p>
                      <p className="font-medium">
                        {data?.fleet?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Plat Nomor
                      </p>
                      <p className="font-medium">
                        {data?.fleet?.plate_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Tipe
                      </p>
                      <p className="font-medium capitalize">
                        {data?.fleet?.type || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informasi Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Nama Maintenance
                    </p>
                    <p className="font-medium">
                      {data?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tanggal Mulai
                    </p>
                    <p className="font-medium">
                      {formatDate(data?.start_date) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tanggal Selesai
                    </p>
                    <p className="font-medium">
                      {formatDate(data?.end_date) || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Duration Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Durasi Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Estimasi Hari
                    </p>
                    <p className="font-medium">
                      {data?.estimate_days || 0} hari
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookText className="h-5 w-5" />
                    Deskripsi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {data?.description || "Tidak ada deskripsi"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
