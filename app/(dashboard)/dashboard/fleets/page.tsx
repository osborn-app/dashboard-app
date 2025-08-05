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
import { FleetTable } from "@/components/tables/fleet-tables/fleet-table";

const breadcrumbItems = [{ title: "Fleets", link: "/dashboard/fleets" }];
type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export const metadata: Metadata = {
  title: "Fleets | Transgo",
  description: "Fleets page",
};

const page = async ({ searchParams }: paramsProps) => {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "admin";
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const q = searchParams.q || null;
  const status = searchParams.status || null;

  // Build query string with status filter
  let queryString = `page=${page}&limit=${pageLimit}`;
  if (q) queryString += `&q=${q}`;
  if (status) queryString += `&status=${status}`;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/fleets?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    },
  );
  const fleetRes = await res.json();

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Fleets" />

          {userRole !== "owner" && (
            <Link
              href={"/dashboard/fleets/create"}
              className={cn(buttonVariants({ variant: "main" }))}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Link>
          )}
        </div>
        <Separator />
        <FleetTable
          data={fleetRes.items || []}
          searchKey="name"
          totalUsers={fleetRes.meta?.total_items}
          pageCount={Math.ceil(fleetRes.meta?.total_items / pageLimit)}
          pageNo={page}
        />
      </div>
    </>
  );
};

export default page;
