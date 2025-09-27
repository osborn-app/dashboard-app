import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getInventory } from "@/client/inventoryClient";
import InventoryTableWrapper from "./components/inventory-table-wrapper";

const breadcrumbItems = [{ title: "Inventaris", link: "/dashboard/inventaris" }];

export const metadata: Metadata = {
  title: "Inventaris | Transgo",
  description: "Manage company inventory and assets",
};

const page = async () => {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "admin";
  
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
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
          <InventoryTableWrapper />
        </HydrationBoundary>
      </div>
    </>
  );
};

export default page;