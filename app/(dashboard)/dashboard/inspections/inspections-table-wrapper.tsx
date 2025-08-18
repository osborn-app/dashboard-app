"use client";

import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import {
  SimpleInspectionsColumns,
  OngoingInspectionsColumns,
  CompletedInspectionsColumns,
} from "@/components/tables/inspections-tables/columns";
import { InspectionsTable } from "@/components/tables/inspections-tables/inspections-table";
import { TabsContent } from "@/components/ui/tabs";
import {
  useGetInspectionsByStatus,
  useGetAvailableFleets,
  useGetCompletedInspections,
} from "@/hooks/api/useInspections";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";

interface InspectionsTableWrapperProps {
  pageNo?: number;
  pageLimit?: number;
  searchQuery?: string;
  fleetType?: string;
}

const InspectionsTableWrapper = ({
  pageNo = 1,
  pageLimit = 10,
  searchQuery = "",
  fleetType = "all",
}: InspectionsTableWrapperProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || pageNo;
  const limit = Number(searchParams.get("limit")) || pageLimit;
  const defaultTab = searchParams.get("status") ?? "tersedia";
  const q = searchParams.get("q") || searchQuery;
  const currentFleetType = searchParams.get("fleet_type") ?? fleetType;
  const [searchQueryState, setSearchQuery] = React.useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQueryState, 500);

  const { data: tersediaData, isFetching: isFetchingTersedia } =
    useGetAvailableFleets(
      currentFleetType === "all" ? undefined : currentFleetType,
      {
        q: searchDebounce || undefined,
        page,
        limit,
      },
    );

  const { data: ongoingData, isFetching: isFetchingOngoing } =
    useGetInspectionsByStatus("pending_repair", {
      limit,
      page,
      q: searchDebounce || undefined,
      ...(currentFleetType !== "all" && { fleet_type: currentFleetType }),
    });

  const { data: selesaiData, isFetching: isFetchingSelesai } =
    useGetCompletedInspections({
      limit,
      page,
      q: searchDebounce || undefined,
      ...(currentFleetType !== "all" && { fleet_type: currentFleetType }),
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

  const handleFleetTypeChange = (type: string) => {
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        fleet_type: type === "all" ? null : type,
        q: searchDebounce || null,
        page: 1, // Reset to first page when changing filter
      })}`,
    );
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (defaultTab) {
      case "tersedia":
        return {
          data: tersediaData?.data?.data || [],
          total: tersediaData?.data?.total || 0,
          page: tersediaData?.data?.page || 1,
          limit: tersediaData?.data?.limit || 10,
          totalPages: tersediaData?.data?.totalPages || 1,
          isLoading: isFetchingTersedia,
        };
      case "ongoing":
        return {
          data: ongoingData?.data?.data || [],
          total: ongoingData?.data?.total || 0,
          page: ongoingData?.data?.page || 1,
          limit: ongoingData?.data?.limit || 10,
          totalPages: ongoingData?.data?.totalPages || 1,
          isLoading: isFetchingOngoing,
        };
      case "selesai":
        return {
          data: selesaiData?.data?.data || [],
          total: selesaiData?.data?.total || 0,
          page: selesaiData?.data?.page || 1,
          limit: selesaiData?.data?.limit || 10,
          totalPages: selesaiData?.data?.totalPages || 1,
          isLoading: isFetchingSelesai,
        };
      default:
        return {
          data: tersediaData?.data?.data || [],
          total: tersediaData?.data?.total || 0,
          page: tersediaData?.data?.page || 1,
          limit: tersediaData?.data?.limit || 10,
          totalPages: tersediaData?.data?.totalPages || 1,
          isLoading: isFetchingTersedia,
        };
    }
  };

  const currentData = getCurrentData();
  const totalItems = currentData.total;
  const pageCount = currentData.totalPages;

  // Handle tab change
  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        q: searchDebounce || null,
        fleet_type: currentFleetType === "all" ? null : currentFleetType,
        page: 1, // Reset to first page when tab changes
      })}`,
    );
  }, [
    defaultTab,
    searchDebounce,
    currentFleetType,
    pathname,
    createQueryString,
    router,
  ]);

  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        q: searchDebounce || null,
        fleet_type: currentFleetType === "all" ? null : currentFleetType,
        page: 1, // Reset to first page when search changes
      })}`,
    );
  }, [
    searchDebounce,
    defaultTab,
    currentFleetType,
    pathname,
    createQueryString,
    router,
  ]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <SearchInput
            searchQuery={searchQueryState}
            onSearchChange={handleSearchChange}
            placeholder="Cari Inspeksi"
          />
        </div>
      </div>

      {/* Tersedia Tab */}
      <TabsContent value="tersedia" className="space-y-4">
        <>
          {isFetchingTersedia && <Spinner />}
          {!isFetchingTersedia &&
            tersediaData?.data?.data &&
            tersediaData.data.data.length > 0 && (
              <InspectionsTable
                columns={SimpleInspectionsColumns}
                data={tersediaData.data.data}
                status="active"
                searchKey="name"
                pageNo={page}
                totalUsers={tersediaData?.data?.total || 0}
                pageCount={tersediaData?.data?.totalPages || 1}
              />
            )}
          {!isFetchingTersedia &&
            (!tersediaData?.data?.data ||
              tersediaData.data.data.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada fleet tersedia untuk inspeksi
              </div>
            )}
        </>
      </TabsContent>

      {/* Ongoing Tab */}
      <TabsContent value="ongoing" className="space-y-4">
        <>
          {isFetchingOngoing && <Spinner />}
          {!isFetchingOngoing &&
            ongoingData?.data?.data &&
            ongoingData.data.data.length > 0 && (
              <InspectionsTable
                columns={OngoingInspectionsColumns}
                data={ongoingData.data.data}
                status="pending_repair"
                searchKey="name"
                pageNo={page}
                totalUsers={ongoingData.data.total || 0}
                pageCount={ongoingData.data.totalPages || 1}
              />
            )}
          {!isFetchingOngoing &&
            (!ongoingData?.data?.data ||
              ongoingData.data.data.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada inspeksi yang sedang berlangsung
              </div>
            )}
        </>
      </TabsContent>

      {/* Selesai Tab */}
      <TabsContent value="selesai" className="space-y-4">
        <>
          {isFetchingSelesai && <Spinner />}
          {!isFetchingSelesai &&
            selesaiData?.data?.data &&
            selesaiData.data.data.length > 0 && (
              <InspectionsTable
                columns={CompletedInspectionsColumns}
                data={selesaiData.data.data}
                status="completed"
                searchKey="name"
                pageNo={page}
                totalUsers={selesaiData.data.total || 0}
                pageCount={selesaiData.data.totalPages || 1}
              />
            )}
          {!isFetchingSelesai &&
            (!selesaiData?.data?.data ||
              selesaiData.data.data.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada inspeksi yang selesai
              </div>
            )}
        </>
      </TabsContent>
    </>
  );
};

export default InspectionsTableWrapper;
