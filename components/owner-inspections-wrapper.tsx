"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetInspectionsByOwner } from "@/hooks/api/useInspections";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import OwnerInspectionsTable from "@/components/tables/inspections-tables/owner-inspections-table";

export default function OwnerInspectionsWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const defaultTab = searchParams.get("status") ?? "ongoing";
  const q = searchParams.get("q") || "";

  const [searchQueryState, setSearchQuery] = React.useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQueryState, 500);

  const getStatusFromTab = (tab: string) => {
    switch (tab) {
      case "ongoing":
        return "pending_repair";
      case "completed":
        return "completed";
      default:
        return "pending_repair";
    }
  };

  const currentStatus = getStatusFromTab(defaultTab);

  const { data: ownerInspections, isFetching } = useGetInspectionsByOwner({
    status: currentStatus,
    page,
    limit,
    q: searchDebounce || undefined,
  });

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const newSearchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      return newSearchParams.toString();
    },
    [],
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTabChange = (tab: string) => {
    router.push(
      `${pathname}?${createQueryString({
        status: tab,
        q: searchDebounce || null,
        page: 1,
      })}`,
    );
  };

  React.useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        q: searchDebounce || null,
        page: 1,
      })}`,
    );
  }, [searchDebounce, defaultTab, pathname, createQueryString, router]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <SearchInput
            searchQuery={searchQueryState}
            onSearchChange={handleSearchChange}
            placeholder="Cari Inspeksi"
          />
        </div>
      </div>

      <Tabs
        value={defaultTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="ongoing">Sedang Berjalan</TabsTrigger>
          <TabsTrigger value="completed">Selesai</TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="space-y-4">
          <>
            {isFetching && <Spinner />}
            {!isFetching &&
              ownerInspections?.data?.data &&
              ownerInspections.data.data.length > 0 && (
                <OwnerInspectionsTable
                  data={ownerInspections.data.data}
                  status="pending_repair"
                  pageNo={page}
                  totalUsers={ownerInspections.data.total || 0}
                  pageCount={ownerInspections.data.totalPages || 1}
                />
              )}
            {!isFetching &&
              (!ownerInspections?.data?.data ||
                ownerInspections.data.data.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada inspeksi yang sedang berlangsung
                </div>
              )}
          </>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <>
            {isFetching && <Spinner />}
            {!isFetching &&
              ownerInspections?.data?.data &&
              ownerInspections.data.data.length > 0 && (
                <OwnerInspectionsTable
                  data={ownerInspections.data.data}
                  status="completed"
                  pageNo={page}
                  totalUsers={ownerInspections.data.total || 0}
                  pageCount={ownerInspections.data.totalPages || 1}
                />
              )}
            {!isFetching &&
              (!ownerInspections?.data?.data ||
                ownerInspections.data.data.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada inspeksi yang selesai
                </div>
              )}
          </>
        </TabsContent>
      </Tabs>
    </div>
  );
}
