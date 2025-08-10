"use client";

import BreadCrumb from "@/components/breadcrumb";
import InspectionsForm from "@/components/forms/inspections-form";
import Spinner from "@/components/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckCircle, Upload, X } from "lucide-react";
import {
  useGetInspectionDetail,
  useCompleteInspection,
} from "@/hooks/api/useInspections";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import axios from "axios";

export default function Page({
  params,
}: {
  params: { inspectionsId: string };
}) {
  const router = useRouter();
  const breadcrumbItems = [
    { title: "Inspections", link: "/dashboard/inspections" },
    { title: "Preview", link: "/dashboard/inspections/preview" },
  ];

  const { data, isFetching } = useGetInspectionDetail(params.inspectionsId);
  const completeInspection = useCompleteInspection();
  const axiosAuth = useAxiosAuth();

  // State untuk upload foto
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "File harus berupa gambar (JPEG, PNG, GIF)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Upload foto ke server
  const uploadPhoto = async (file: File): Promise<string> => {
    const fileName = file.name;

    // Get presigned URL
    const response = await axiosAuth.post("/storages/presign/list", {
      file_names: [fileName],
      folder: "fleet",
    });

    // Upload file
    await axios.put(response.data[0].upload_url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return response.data[0].download_url;
  };

  const handleCompleteInspection = async () => {
    try {
      if (data?.data?.fleet?.id) {
        await completeInspection.mutateAsync({
          fleetId: data.data.fleet.id,
        });

        toast({
          title: "Success",
          description: "Inspeksi berhasil diselesaikan",
        });

        router.push("/dashboard/inspections");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyelesaikan inspeksi",
        variant: "destructive",
      });
    }
  };

  const handleCompleteWithPhoto = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Pilih foto perbaikan terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload foto
      const photoUrl = await uploadPhoto(selectedFile);

      // Complete inspection dengan foto
      if (data?.data?.fleet?.id) {
        await completeInspection.mutateAsync({
          fleetId: data.data.fleet.id,
          repairPhotoUrl: photoUrl,
        });

        toast({
          title: "Success",
          description: "Inspeksi berhasil diselesaikan dengan foto perbaikan",
        });

        router.push("/dashboard/inspections");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menyelesaikan inspeksi: ${
          error?.response?.data?.message || error?.message
        }`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadForm(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <div className="flex items-center justify-between">
          <BreadCrumb items={breadcrumbItems} />
        </div>
        {isFetching && <Spinner />}
        {!isFetching && data?.data && (
          <InspectionsForm initialData={data?.data} isEdit />
        )}

        {/* Tombol Selesai - Posisi di bawah form inspection */}
        {!isFetching && data?.data && data.data.status === "pending_repair" && (
          <div className="flex justify-end mt-6">
            {!showUploadForm ? (
              <Button
                onClick={() => setShowUploadForm(true)}
                disabled={completeInspection.isPending}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Selesai
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                Upload foto perbaikan untuk menyelesaikan inspeksi
              </div>
            )}
          </div>
        )}

        {/* Inline Upload Form */}
        {showUploadForm && (
          <Card className="mt-6 border-2 border-dashed border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Upload className="h-5 w-5" />
                Upload Foto Perbaikan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repair-photo" className="text-green-700">
                  Pilih Foto Perbaikan
                </Label>
                <Input
                  id="repair-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                  disabled={uploading}
                />
                <p className="text-sm text-green-600">
                  Format: JPEG, PNG, GIF. Maksimal 5MB
                </p>
              </div>

              {/* Preview Image */}
              {previewUrl && (
                <div className="space-y-2">
                  <Label className="text-green-700">Preview Foto:</Label>
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview foto perbaikan"
                      className="h-32 w-32 object-cover rounded-lg border-2 border-green-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        URL.revokeObjectURL(previewUrl);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCompleteWithPhoto}
                  disabled={!selectedFile || uploading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {uploading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Upload & Selesai
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelUpload}
                  disabled={uploading}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
