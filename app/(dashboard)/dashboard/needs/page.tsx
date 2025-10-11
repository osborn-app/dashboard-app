import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import NeedsTableWrapper from "./needs-table-wrapper";
import {
  dehydrate, //redeploy
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getMaintenances } from "@/client/needsClient"; 

export const metadata: Metadata = {
  title: "Maintenance Needs",
  description: "Maintenance Page"
};

type paramsProps = {
  searchParams: {
    [key: string]: string | undefined;
  };
};

const breadcrumbItems = [{ title: "Maintenance", link: "/dashboard/needs" }];

export default async function NeedsPage({ searchParams }: paramsProps) {
  const queryClient = new QueryClient();

  // Note: We can't use session in server component, so we'll let the client component handle the token
  // await queryClient.prefetchQuery({
  //   queryKey: ["maintenances", {}], // params bisa disesuaikan
  //   queryFn: ({ queryKey }) => getMaintenances(queryKey[1], ""), // tambah parameter token
  // });

  const defaultTab = searchParams.status ?? "ongoing";

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading title="Maintenance Management" />
          <Link
            href={"/dashboard/needs/create"}
            className={cn(buttonVariants({ variant: "main" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Maintenance
          </Link>
        </div>
        <Separator />
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <NeedsTableWrapper />
          </HydrationBoundary>
        </Tabs>
      </div>
    </>
  );
} //trigger deploy
