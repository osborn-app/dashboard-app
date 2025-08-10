"use client";

import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CMSTable } from "@/components/tables/cms-tables/cms-table";
import { CMSResponse } from "@/components/forms/types/cms";
import useCMSService from "@/hooks/api/useCMS";

const breadcrumbItems = [{ title: "Content Management", link: "/dashboard/cms" }];

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cmsService = useCMSService(); 

  const [data, setData] = useState<CMSResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const pageNo = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('limit')) || 10;
  const q = searchParams.get('q') || "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await cmsService.getCMSData(pageNo, pageSize, q);
      setData(result);
    } catch (error) {
      console.error("Error fetching CMS data:", error);
    } finally {
      setLoading(false);
    }
  }, [pageNo, pageSize, q, cmsService]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalItems = data?.meta?.total_items ?? 0;
  const pageCount = Math.ceil(totalItems / pageSize);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    params.set("limit", String(pageSize));
    if (q) params.set("q", q);
    router.push(`/dashboard/cms?${params.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", String(newPageSize));
    if (q) params.set("q", q);
    router.push(`/dashboard/cms?${params.toString()}`);
  };

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await cmsService.toggleStatus(id, newStatus);
      await fetchData();
    } catch (error) {
      console.error("Error toggling status:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title="Content Management" />
        <Link href={"/dashboard/cms/create"} className={cn(buttonVariants({ variant: "main" }))}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Link>
      </div>

      <Separator />

      <CMSTable
        data={Array.isArray(data?.items) ? data.items : []}
        totalUsers={totalItems}
        pageCount={pageCount}
        pageNo={pageNo}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}