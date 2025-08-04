"use client";

import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetInspectionDetail } from "@/hooks/api/useInspections";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";

interface DetailPageProps {
  params: {
    inspectionsId: string;
  };
}

export default function InspectionDetailPage({ params }: DetailPageProps) {
  const router = useRouter();
  const { data: inspection, isLoading } = useGetInspectionDetail(params.inspectionsId);

  const breadcrumbItems = [
    { title: "Inspections", link: "/dashboard/inspections" },
    { title: "Detail", link: `/dashboard/inspections/${params.inspectionsId}/detail` },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary">Tersedia</Badge>;
      case "pending_repair":
        return <Badge variant="destructive">Ongoing</Badge>;
      case "completed":
        return <Badge variant="default">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getComponentStatusBadge = (status: string) => {
    return status === "aman" ? (
      <Badge variant="default">Aman</Badge>
    ) : (
      <Badge variant="destructive">Tidak Aman</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Spinner />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center py-8 text-muted-foreground">
          Inspeksi tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <Heading title="Detail Inspeksi" />
          </div>
          {getStatusBadge(inspection.status)}
        </div>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fleet Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Fleet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nama Fleet
                </label>
                <p className="text-lg">{inspection.fleet.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nomor Plat
                </label>
                <p className="text-lg">{inspection.fleet.plate_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tipe
                </label>
                <p className="text-lg capitalize">{inspection.fleet.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Warna
                </label>
                <p className="text-lg">{inspection.fleet.color}</p>
              </div>
            </CardContent>
          </Card>

          {/* Inspection Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Inspeksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Inspector
                </label>
                <p className="text-lg">{inspection.inspector_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Kilometer
                </label>
                <p className="text-lg">{inspection.kilometer} km</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tanggal Inspeksi
                </label>
                <p className="text-lg">
                  {format(new Date(inspection.inspection_date), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
              {inspection.repair_completion_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tanggal Selesai
                  </label>
                  <p className="text-lg">
                    {format(new Date(inspection.repair_completion_date), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Component Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status Komponen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Oli</span>
                {getComponentStatusBadge(inspection.oil_status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ban</span>
                {getComponentStatusBadge(inspection.tire_status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Aki</span>
                {getComponentStatusBadge(inspection.battery_status)}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Deskripsi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{inspection.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Repair Information */}
        {inspection.repair_duration_days && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Perbaikan</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Durasi Perbaikan
                </label>
                <p className="text-lg">{inspection.repair_duration_days} hari</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
