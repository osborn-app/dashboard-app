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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    // Update URL with search parameter
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (query) {
      newSearchParams.set("q", query);
    } else {
      newSearchParams.delete("q");
    }
    newSearchParams.set("page", "1"); // Reset to first page when searching
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  };

  const handleFleetTypeChange = (type: string) => {
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        fleet_type: type,
        q: searchDebounce,
        page: 1, // Reset to first page when changing filter
      })}`,
    );
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (defaultTab) {
      case "tersedia":
        return {
          data: tersediaData?.data?.data || tersediaData?.data || [],
          meta: tersediaData?.data?.meta,
          isLoading: isFetchingTersedia,
        };
      case "ongoing":
        return {
          data: ongoingData?.data?.data || ongoingData?.data || [],
          meta: ongoingData?.data?.meta,
          isLoading: isFetchingOngoing,
        };
      case "selesai":
        return {
          data: selesaiData?.data?.data || selesaiData?.data || [],
          meta: selesaiData?.data?.meta,
          isLoading: isFetchingSelesai,
        };
      default:
        return {
          data: tersediaData?.data?.data || tersediaData?.data || [],
          meta: tersediaData?.data?.meta,
          isLoading: isFetchingTersedia,
        };
    }
  };

  const currentData = getCurrentData();
  const totalItems = currentData.meta?.total_items || 0;
  const pageCount = Math.ceil(totalItems / limit);

  useEffect(() => {
    if (
      searchDebounce !== undefined ||
      searchDebounce !== "" ||
      searchDebounce
    ) {
      router.push(
        `${pathname}?${createQueryString({
          status: defaultTab,
          q: searchDebounce,
          fleet_type: currentFleetType,
          page: 1, // Reset to first page when search changes
        })}`,
      );
    }
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
          <Select
            value={currentFleetType}
            onValueChange={handleFleetTypeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih tipe fleet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="car">Mobil</SelectItem>
              <SelectItem value="motorcycle">Motor</SelectItem>
            </SelectContent>
          </Select>
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
            tersediaData?.data &&
            tersediaData.data.length > 0 && (
              <InspectionsTable
                columns={SimpleInspectionsColumns}
                data={tersediaData.data}
                status="active"
                searchKey="name"
                pageNo={page}
                totalUsers={tersediaData.data.meta?.total_items || 0}
                pageCount={Math.ceil(
                  (tersediaData.data.meta?.total_items || 0) / limit,
                )}
              />
            )}
          {!isFetchingTersedia &&
            (!tersediaData?.data || tersediaData.data.length === 0) && (
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
            ongoingData?.data &&
            ongoingData.data.length > 0 && (
              <InspectionsTable
                columns={OngoingInspectionsColumns}
                data={ongoingData.data}
                status="pending_repair"
                searchKey="name"
                pageNo={page}
                totalUsers={ongoingData.data.meta?.total_items || 0}
                pageCount={Math.ceil(
                  (ongoingData.data.meta?.total_items || 0) / limit,
                )}
              />
            )}
          {!isFetchingOngoing &&
            (!ongoingData?.data || ongoingData.data.length === 0) && (
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
            selesaiData?.data &&
            selesaiData.data.length > 0 && (
              <InspectionsTable
                columns={CompletedInspectionsColumns}
                data={selesaiData.data}
                status="completed"
                searchKey="name"
                pageNo={page}
                totalUsers={selesaiData.data.meta?.total_items || 0}
                pageCount={Math.ceil(
                  (selesaiData.data.meta?.total_items || 0) / limit,
                )}
              />
            )}
          {!isFetchingSelesai &&
            (!selesaiData?.data || selesaiData.data.length === 0) && (
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
