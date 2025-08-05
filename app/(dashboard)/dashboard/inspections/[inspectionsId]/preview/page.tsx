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
import React from "react";

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

  const handleCompleteInspection = async () => {
    try {
      if (data?.data?.fleet?.id) {
        await completeInspection.mutateAsync(data.data.fleet.id);

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

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <div className="flex items-center justify-between">
          <BreadCrumb items={breadcrumbItems} />
          {!isFetching &&
            data?.data &&
            data.data.status === "pending_repair" && (
              <Button
                onClick={handleCompleteInspection}
                disabled={completeInspection.isPending}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {completeInspection.isPending ? "Menyelesaikan..." : "Selesai"}
              </Button>
            )}
        </div>
        {isFetching && <Spinner />}
        {!isFetching && data?.data && (
          <InspectionsForm initialData={data?.data} isEdit />
        )}
      </div>
    </ScrollArea>
  );
}
