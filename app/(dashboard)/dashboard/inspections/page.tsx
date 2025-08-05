import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InspectionsTableWrapper from "./inspections-table-wrapper";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  getInspectionsByStatus,
  getAvailableFleets,
} from "@/client/inspectionsClient";

export const metadata: Metadata = {
  title: "Inspections | Transgo",
  description: "Inspections page",
};

type paramsProps = {
  searchParams: {
    [key: string]: string | undefined;
  };
};

const breadcrumbItems = [
  { title: "Inspections", link: "/dashboard/inspections" },
];

export default async function InspectionsPage({ searchParams }: paramsProps) {
  const queryClient = new QueryClient();

  // Prefetch data for all statuses
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["available-fleets", "car"],
      queryFn: () => getAvailableFleets("car"),
    }),
    queryClient.prefetchQuery({
      queryKey: ["available-fleets", "motorcycle"],
      queryFn: () => getAvailableFleets("motorcycle"),
    }),
    queryClient.prefetchQuery({
      queryKey: ["inspections", "pending_repair"],
      queryFn: () => getInspectionsByStatus("pending_repair"),
    }),
    queryClient.prefetchQuery({
      queryKey: ["inspections", "completed"],
      queryFn: () => getInspectionsByStatus("completed"),
    }),
  ]);

  const defaultTab = searchParams.status ?? "tersedia";

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading title="Inspections" />
        </div>
        <Separator />
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="tersedia">Tersedia</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="selesai">Selesai</TabsTrigger>
          </TabsList>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <InspectionsTableWrapper />
          </HydrationBoundary>
        </Tabs>
      </div>
    </>
  );
}
