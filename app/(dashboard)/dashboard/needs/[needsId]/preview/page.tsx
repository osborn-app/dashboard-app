"use client";
import BreadCrumb from "@/components/breadcrumb";
import Spinner from "@/components/spinner";
import { useGetMaintenanceById } from "@/hooks/api/useNeeds";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useSession } from "next-auth/react";

export default function Page({ params }: { params: { needsId: number } }) {
  const { data: session } = useSession();

  const breadcrumbItems = [
    { title: "Maintenance", link: "/dashboard/needs" },
    { title: "Preview Maintenance", link: "/dashboard/needs/preview" },
  ];

  const { data, isFetching } = useGetMaintenanceById(params.needsId, session?.user?.accessToken || "");

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-5">
      <BreadCrumb items={breadcrumbItems} />
      {isFetching && <Spinner />}
      {!isFetching && data && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Preview Maintenance</h1>
             <Badge className={getStatusColor(data?.status)}>
               {data?.status || 'Unknown'}
             </Badge>
          </div>
          
                     <Card>
             <CardHeader>
               <CardTitle>{data?.name}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                   <div>
                     <h3 className="text-sm font-medium text-gray-500">Armada</h3>
                     <p className="text-lg">{data?.fleet?.name}</p>
                   </div>
                   <div>
                     <h3 className="text-sm font-medium text-gray-500">Plat Nomor</h3>
                     <p className="text-lg">{data?.fleet?.plate_number}</p>
                   </div>
                   <div>
                     <h3 className="text-sm font-medium text-gray-500">Tanggal Mulai</h3>
                     <p className="text-lg">{new Date(data?.start_date).toLocaleDateString('id-ID')}</p>
                   </div>
                 </div>
                 
                 <div className="space-y-4">
                   <div>
                     <h3 className="text-sm font-medium text-gray-500">Estimasi Hari</h3>
                     <p className="text-lg">{data?.estimate_days} hari</p>
                   </div>
                   <div>
                     <h3 className="text-sm font-medium text-gray-500">Tanggal Dibuat</h3>
                     <p className="text-lg">{new Date(data?.created_at).toLocaleDateString('id-ID')}</p>
                   </div>
                   <div>
                     <h3 className="text-sm font-medium text-gray-500">Terakhir Diupdate</h3>
                     <p className="text-lg">{new Date(data?.updated_at).toLocaleDateString('id-ID')}</p>
                   </div>
                 </div>
               </div>
               
               {data?.description && (
                 <div className="pt-4 border-t">
                   <h3 className="text-sm font-medium text-gray-500 mb-2">Deskripsi</h3>
                   <p className="text-gray-900 whitespace-pre-wrap">{data?.description}</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}