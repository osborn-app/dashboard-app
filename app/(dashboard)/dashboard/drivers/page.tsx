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
import { DriverTable } from "@/components/tables/driver-tables/driver-table";
import { columns } from "@/components/tables/driver-tables/columns";

const breadcrumbItems = [{ title: "Drivers", link: "/dashboard/drivers" }];
type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export const metadata: Metadata = {
  title: "Drivers | Osborn",
  description: "Drivers page",
};

const page = async ({ searchParams }: paramsProps) => {
  const session = await getServerSession(authOptions);
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const q = searchParams.q || null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/drivers?page=${page}&limit=${pageLimit}` +
      (q && q?.length > 0 ? `&q=${q}` : ""),
    {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    },
  );
  const driverRes = await res.json();

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Drivers" />

          <Link
            href={"/dashboard/drivers/create"}
            className={cn(buttonVariants({ variant: "main" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />
        <DriverTable
          columns={columns}
          data={driverRes.items}
          searchKey="name"
          totalUsers={driverRes.meta?.total_items}
          pageCount={Math.ceil(driverRes.meta?.total_items / pageLimit)}
          pageNo={page}
        />
      </div>
    </>
  );
};

export default page;
