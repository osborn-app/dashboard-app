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
import { Button } from "@/components/ui/button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

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
        fleet_type: type,
        q: searchDebounce,
      })}`,
    );
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        page: newPage,
        q: searchDebounce,
        fleet_type: currentFleetType,
      })}`,
    );
  };

  const handlePageSizeChange = (newPageSize: number) => {
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        page: 1,
        limit: newPageSize,
        q: searchDebounce,
        fleet_type: currentFleetType,
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
              <SelectItem value="all">Semua</SelectItem>
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

      {/* Pagination */}
      {!currentData.isLoading && totalItems > 0 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Menampilkan {(page - 1) * limit + 1} sampai{" "}
            {Math.min(page * limit, totalItems)} dari {totalItems} data
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Baris per halaman</p>
              <Select
                value={`${limit}`}
                onValueChange={(value) => {
                  handlePageSizeChange(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Halaman {page} dari {pageCount}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(1)}
                disabled={page <= 1}
              >
                <span className="sr-only">Go to first page</span>
                <DoubleArrowLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pageCount}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(pageCount)}
                disabled={page >= pageCount}
              >
                <span className="sr-only">Go to last page</span>
                <DoubleArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InspectionsTableWrapper;
