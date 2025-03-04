import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Tabs } from "@/components/ui/tabs";
import type { Metadata } from "next";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getReimburse } from "@/client/reimburseClient";
import ReimburseTableWrapper from "./reimburse-table-wrapper";

const breadcrumbItems = [{ title: "Reimburse", link: "/dashboard/reimburse" }];
type paramsProps = {
  searchParams: {
    [key: string]: string | undefined;
  };
};

export const metadata: Metadata = {
  title: "Reimburse | Transgo",
  description: "Requests page",
};

const page = async ({ searchParams }: paramsProps) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["reimburse"],
    queryFn: getReimburse,
  });

  const defaultTab = searchParams.status ?? "pending";

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Reimburse" />

          <Link
            href="/dashboard/reimburse/create"
            className={cn(buttonVariants({ variant: "main" }))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Reimburse
          </Link>
        </div>
        <Separator />
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <ReimburseTableWrapper />
          </HydrationBoundary>
        </Tabs>
      </div>
    </>
  );
};

export default page;
