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
import OrderTableWrapper from "./order-table-wrapper";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getOrders } from "@/client/orderClient";

const breadcrumbItems = [{ title: "Pesanan", link: "/dashboard/orders" }];
type paramsProps = {
  searchParams: {
    [key: string]: string | undefined;
  };
};

export const metadata: Metadata = {
  title: "Pesanan | Osborn",
  description: "Requests page",
};

const page = async ({ searchParams }: paramsProps) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["orders", "vehicle"],
    queryFn: () => {
      const type = searchParams.type || "all";
      const params: any = {
        status: searchParams.status || "pending",
        page: 1,
        limit: 10,
      };

      // Jika "all" dipilih, kirim order_type=vehicle
      if (type === "all") {
        params.order_type = "vehicle";
      } else {
        // Jika filter spesifik dipilih, kirim type=value
        params.type = type;
      }

      return getOrders(params);
    },
  });

  const defaultTab = searchParams.status ?? "pending";

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Pesanan" />

          <Link
            href={"/dashboard/orders/create"}
            className={cn(buttonVariants({ variant: "main" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Pesanan
          </Link>
        </div>
        <Separator />
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <OrderTableWrapper />
          </HydrationBoundary>
        </Tabs>
      </div>
    </>
  );
};

export default page;
