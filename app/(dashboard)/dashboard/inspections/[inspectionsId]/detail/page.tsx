"use client";

import BreadCrumb from "@/components/breadcrumb";
import InspectionsForm from "@/components/forms/inspections-form";
import Spinner from "@/components/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetInspectionDetail } from "@/hooks/api/useInspections";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {User, Car, FileText, Image, BookText } from "lucide-react";

interface DetailPageProps {
  params: {
    inspectionsId: string;
  };
}

export default function InspectionDetailPage({ params }: DetailPageProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const { data: inspection, isLoading } = useGetInspectionDetail(
    params.inspectionsId,
  );

  const breadcrumbItems = [
    { title: "Inspections", link: "/dashboard/inspections" },
    {
      title: "Detail",
      link: `/dashboard/inspections/${params.inspectionsId}/detail`,
    },
  ];

  const getStatusBadge = (rawStatus?: string) => {
    const status = (rawStatus || "").toLowerCase();
  
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 text-white text-base px-5 py-1 cursor-default pointer-events-none hover:bg-green-500">
            Selesai
          </Badge>
        );
  
      case "pending_repair":
        return (
          <Badge className="bg-yellow-500 text-black text-base px-4 py-2 cursor-default pointer-events-none hover:bg-yellow-500">
            Sedang Diperbaiki
          </Badge>
        );
  
      default:
        return (
          <Badge variant="secondary" className="text-base px-4 py-2 cursor-default pointer-events-none hover:bg-secondary">
            {rawStatus || "N/A"}
          </Badge>
        );
    }
  };  

  const getComponentStatusBadge = (status: string) => {
    return status === "aman" ? (
      <Badge className="bg-green-500">Aman</Badge>
    ) : (
      <Badge className="bg-red-500">Tidak Aman</Badge>
    );
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {isLoading && <Spinner />}
        {!isLoading && inspection?.data && (
          <div className="space-y-6">
            {/* Header with Status */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Detail Inspeksi</h1>
                <p className="text-muted-foreground">
                  Informasi lengkap inspeksi kendaraan
                </p>
              </div>
              {getStatusBadge(inspection.data.status)}
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
                        {inspection.data.fleet?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Plat Nomor
                      </p>
                      <p className="font-medium">
                        {inspection.data.fleet?.plate_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Tipe
                      </p>
                      <p className="font-medium capitalize">
                        {inspection.data.fleet?.type || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Kilometer
                      </p>
                      <p className="font-medium">
                        {inspection.data.kilometer?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inspector Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Inspektor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Nama Inspektor
                    </p>
                    <p className="font-medium">
                      {inspection.data.inspector_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tanggal Inspeksi
                    </p>
                    <p className="font-medium">
                      {inspection.data.inspection_date
                        ? new Date(
                            inspection.data.inspection_date,
                          ).toLocaleDateString("id-ID")
                        : "N/A"}
                    </p>
                  </div>
                  {inspection.data.repair_completion_date && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Tanggal Selesai Perbaikan
                      </p>
                      <p className="font-medium">
                        {new Date(
                          inspection.data.repair_completion_date,
                        ).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Component Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Status Komponen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status Oli</span>
                      {getComponentStatusBadge(inspection.data.oil_status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status Ban</span>
                      {getComponentStatusBadge(inspection.data.tire_status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status Aki</span>
                      {getComponentStatusBadge(inspection.data.battery_status)}
                    </div>
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
                    {inspection.data.description || "Tidak ada deskripsi"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Photo Section */}
            {inspection.data.repair_photo_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Foto Hasil Perbaikan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(inspection.data.repair_photo_url) ? (
                      inspection.data.repair_photo_url.map(
                        (photo: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={photo}
                              alt={`Foto perbaikan ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleImageClick(photo);
                              }}
                            />
                            <div
                              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none"
                              onClick={() => handleImageClick(photo)}
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <p className="text-white text-sm font-medium">
                                  Klik untuk memperbesar
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="relative group">
                        <img
                          src={inspection.data.repair_photo_url}
                          alt="Foto perbaikan"
                          className="w-full h-48 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleImageClick(inspection.data.repair_photo_url);
                          }}
                        />
                        <div
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none"
                          onClick={() =>
                            handleImageClick(inspection.data.repair_photo_url)
                          }
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <p className="text-white text-sm font-medium">
                              Klik untuk memperbesar
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {isImageModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseImageModal}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={handleCloseImageModal}
              className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </ScrollArea>
  );
}
