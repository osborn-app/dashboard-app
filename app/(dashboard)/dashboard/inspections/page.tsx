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
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const metadata: Metadata = {
  title: "Inspections | Transgo",
  description: "Inspections page",
};

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

const breadcrumbItems = [
  { title: "Inspections", link: "/dashboard/inspections" },
];

export default async function InspectionsPage({ searchParams }: paramsProps) {
  const session = await getServerSession(authOptions);
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const q = searchParams.q || null;
  const fleetType = searchParams.fleet_type || "all";
  const status = searchParams.status || "tersedia";

  const queryClient = new QueryClient();

  // Build query string for available fleets
  let availableFleetsQueryString = `page=${page}&limit=${pageLimit}`;
  if (q) availableFleetsQueryString += `&q=${q}`;
  if (fleetType !== "all") availableFleetsQueryString += `&type=${fleetType}`;

  // Build query string for inspections
  let inspectionsQueryString = `page=${page}&limit=${pageLimit}`;
  if (q) inspectionsQueryString += `&q=${q}`;
  if (fleetType !== "all") inspectionsQueryString += `&fleet_type=${fleetType}`;

  // Prefetch data for all statuses
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: [
        "available-fleets",
        fleetType === "all" ? undefined : fleetType,
        { q, page, limit: pageLimit },
      ],
      queryFn: () =>
        getAvailableFleets(fleetType === "all" ? undefined : fleetType, {
          q,
          page,
          limit: pageLimit,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: [
        "inspections",
        "pending_repair",
        {
          q,
          fleet_type: fleetType === "all" ? undefined : fleetType,
          page,
          limit: pageLimit,
        },
      ],
      queryFn: () =>
        getInspectionsByStatus("pending_repair", {
          q,
          fleet_type: fleetType === "all" ? undefined : fleetType,
          page,
          limit: pageLimit,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: [
        "inspections",
        "completed",
        {
          q,
          fleet_type: fleetType === "all" ? undefined : fleetType,
          page,
          limit: pageLimit,
        },
      ],
      queryFn: () =>
        getInspectionsByStatus("completed", {
          q,
          fleet_type: fleetType === "all" ? undefined : fleetType,
          page,
          limit: pageLimit,
        }),
    }),
  ]);

  const defaultTab = status;

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
            <InspectionsTableWrapper
              pageNo={page}
              pageLimit={pageLimit}
              searchQuery={q as string}
              fleetType={fleetType as string}
            />
          </HydrationBoundary>
        </Tabs>
      </div>
    </>
  );
}
