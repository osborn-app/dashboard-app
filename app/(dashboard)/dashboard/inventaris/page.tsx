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
import { getInventory, getInventoryStatistics } from "@/client/inventoryClient";
import InventoryTableWrapper from "./components/inventory-table-wrapper";

const breadcrumbItems = [{ title: "Inventaris", link: "/dashboard/inventaris" }];

export const metadata: Metadata = {
  title: "Inventaris | Transgo",
  description: "Kelola aset dan inventaris perusahaan",
};
// re
const page = async () => {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "admin";
  
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory({ limit: 10, page: 1 }),
  });

  await queryClient.prefetchQuery({
    queryKey: ["inventory-stats"],
    queryFn: getInventoryStatistics,
  });

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Inventaris" description="Kelola aset dan inventaris perusahaan" />
        </div>
        <Separator />
        
        <HydrationBoundary state={dehydrate(queryClient)}>
          <InventoryTableWrapper userRole={userRole} />
        </HydrationBoundary>
      </div>
    </>
  );
};

export default page;


