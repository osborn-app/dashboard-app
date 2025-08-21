"use client";

import BreadCrumb from "@/components/breadcrumb";
import InspectionsForm from "@/components/forms/inspections-form";
import Spinner from "@/components/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import {
  useGetInspectionDetail,
  useCompleteInspection,
} from "@/hooks/api/useInspections";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import InspectionCompleteModal from "@/components/modal/inspection-complete-modal";
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

  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCompleteWithoutPhoto = async () => {
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

  const handleCompleteWithPhoto = async (file: File) => {
    try {
      // Upload foto
      const photoUrl = await uploadPhoto(file);

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
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={completeInspection.isPending}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Selesai
            </Button>
          </div>
        )}

        {/* Inspection Complete Modal */}
        <InspectionCompleteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCompleteWithoutPhoto={handleCompleteWithoutPhoto}
          onCompleteWithPhoto={handleCompleteWithPhoto}
          isLoading={completeInspection.isPending}
        />
      </div>
    </ScrollArea>
  );
}
