"use client";

import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetInspectionDetail,
  useCompleteInspection,
} from "@/hooks/api/useInspections";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/spinner";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PreviewPageProps {
  params: {
    inspectionsId: string;
  };
}

export default function InspectionPreviewPage({ params }: PreviewPageProps) {
  const router = useRouter();
  const { data: inspection, isLoading } = useGetInspectionDetail(
    params.inspectionsId,
  );
  const completeInspection = useCompleteInspection();

  const breadcrumbItems = [
    { title: "Inspections", link: "/dashboard/inspections" },
    {
      title: "Preview",
      link: `/dashboard/inspections/${params.inspectionsId}/preview`,
    },
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

  const handleCompleteInspection = async () => {
    try {
      await completeInspection.mutateAsync(inspection?.data?.fleet?.id);
      toast({
        title: "Success",
        description: "Inspeksi berhasil diselesaikan",
      });
      router.push("/dashboard/inspections");
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyelesaikan inspeksi",
        variant: "destructive",
      });
    }
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
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <Heading title="Preview Inspeksi" />
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(inspection.data.status)}
            {inspection.data.status === "pending_repair" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="default"
                    disabled={completeInspection.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {completeInspection.isPending
                      ? "Menyelesaikan..."
                      : "Selesai"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Selesai</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menyelesaikan inspeksi ini?
                      Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCompleteInspection}>
                      Ya, Selesai
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
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
                <p className="text-lg">{inspection?.data?.fleet?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nomor Plat
                </label>
                <p className="text-lg">
                  {inspection?.data?.fleet?.plate_number}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tipe
                </label>
                <p className="text-lg capitalize">
                  {inspection?.data?.fleet?.type}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Warna
                </label>
                <p className="text-lg">{inspection?.data?.fleet?.color}</p>
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
                <p className="text-lg">{inspection?.data?.inspector_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Kilometer
                </label>
                <p className="text-lg">{inspection?.data?.kilometer} km</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tanggal Inspeksi
                </label>
                <p className="text-lg">
                  {format(
                    new Date(inspection?.data?.inspection_date),
                    "dd/MM/yyyy HH:mm",
                  )}
                </p>
              </div>
              {inspection?.data?.repair_completion_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tanggal Selesai
                  </label>
                  <p className="text-lg">
                    {format(
                      new Date(inspection?.data?.repair_completion_date),
                      "dd/MM/yyyy HH:mm",
                    )}
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
                {getComponentStatusBadge(inspection?.data?.oil_status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ban</span>
                {getComponentStatusBadge(inspection?.data?.tire_status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Aki</span>
                {getComponentStatusBadge(inspection?.data?.battery_status)}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Deskripsi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{inspection?.data?.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Repair Information */}
        {inspection?.data?.repair_duration_days && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Perbaikan</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Durasi Perbaikan
                </label>
                <p className="text-lg">
                  {inspection?.data?.repair_duration_days} hari
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
