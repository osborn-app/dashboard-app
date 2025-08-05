"use client";

import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import { SimpleInspectionsColumns } from "@/components/tables/inspections-tables/columns";
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

const InspectionsTableWrapper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const defaultTab = searchParams.get("status") ?? "tersedia";
  const q = searchParams.get("q");
  const fleetType = searchParams.get("fleet_type") ?? "car";
  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQuery, 500);

  const { data: tersediaData, isFetching: isFetchingTersedia } =
    useGetAvailableFleets(fleetType);

  const { data: ongoingData, isFetching: isFetchingOngoing } =
    useGetInspectionsByStatus("pending_repair", {
      limit: pageLimit,
      page: page,
      q: searchDebounce,
      fleet_type: fleetType,
    });

  const { data: selesaiData, isFetching: isFetchingSelesai } =
    useGetCompletedInspections({
      limit: pageLimit,
      page: page,
      q: searchDebounce,
      fleet_type: fleetType,
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
          fleet_type: fleetType,
        })}`,
      );
    }
  }, [
    searchDebounce,
    defaultTab,
    fleetType,
    pathname,
    createQueryString,
    router,
  ]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <Select value={fleetType} onValueChange={handleFleetTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih tipe fleet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">Mobil</SelectItem>
              <SelectItem value="motorcycle">Motor</SelectItem>
            </SelectContent>
          </Select>
          <SearchInput
            searchQuery={searchQuery}
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
                columns={SimpleInspectionsColumns}
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
                columns={SimpleInspectionsColumns}
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
    </>
  );
};

export default InspectionsTableWrapper;
