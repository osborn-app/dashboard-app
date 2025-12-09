import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { Metadata } from "next";
import { 
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAddons } from "@/client/productClient";
import AddonTableWrapper from "./addon-table-wrapper";

const breadcrumbItems = [{ title: "Add-ons", link: "/dashboard/add-ons" }];
// redeploy
export const metadata: Metadata = {
  title: "Add-ons | Osborn",
  description: "Manage add-ons for products and fleets",
};

const page = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["addons"],
    queryFn: getAddons,
  });

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Add-ons" description="Manage your add-ons for products and fleets" />

          <Link
            href={"/dashboard/add-ons/create"}
            className={cn(buttonVariants({ variant: "main" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Add-on
          </Link>
        </div>
        <Separator />
        
        <HydrationBoundary state={dehydrate(queryClient)}>
          <AddonTableWrapper />
        </HydrationBoundary>
      </div>
    </>
  );
};

export default page;
