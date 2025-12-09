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
import { columns } from "@/components/tables/owner-tables/columns";
import { OwnerTable } from "@/components/tables/owner-tables/owner-table";

const breadcrumbItems = [{ title: "Owners", link: "/dashboard/owners" }];
type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export const metadata: Metadata = {
  title: "Owners | Osborn",
  description: "Owners page",
};

const page = async ({ searchParams }: paramsProps) => {
  const session = await getServerSession(authOptions);
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const q = searchParams.q || null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/owners?page=${page}&limit=${pageLimit}` +
      (q && q?.length > 0 ? `&q=${q}` : ""),
    {
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    },
  );
  const ownerRes = await res.json();

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Owners" />

          <Link
            href={"/dashboard/owners/create"}
            className={cn(buttonVariants({ variant: "main" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />
        <OwnerTable
          columns={columns}
          data={ownerRes.items}
          searchKey="name"
          totalUsers={ownerRes.meta?.total_items}
          pageCount={Math.ceil(ownerRes.meta?.total_items / pageLimit)}
          pageNo={page}
        />
      </div>
    </>
  );
};

export default page;
