import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getInventoryById } from "@/client/inventoryClient";
import InventoryDetailWrapper from "./components/inventory-detail-wrapper";

interface InventoryDetailPageProps {
  params: {
    id: string;
  };
}

const breadcrumbItems = [
  { title: "Inventaris", link: "/dashboard/inventaris" },
  { title: "Detail", link: "#" }
];

export async function generateMetadata({ params }: InventoryDetailPageProps): Promise<Metadata> {
  return {
    title: `Detail Inventaris | Transgo`,
    description: "Detail item inventaris perusahaan",
  };
}

const InventoryDetailPage = async ({ params }: InventoryDetailPageProps) => {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "admin";
  const inventoryId = parseInt(params.id);
  
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["inventory", inventoryId],
    queryFn: () => getInventoryById(inventoryId),
  });

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Detail Inventaris" description="Detail item inventaris perusahaan" />
        </div>
        <Separator />
        
        <HydrationBoundary state={dehydrate(queryClient)}>
          <InventoryDetailWrapper 
            inventoryId={inventoryId}
            userRole={userRole} 
          />
        </HydrationBoundary>
      </div>
    </>
  );
};

export default InventoryDetailPage;
