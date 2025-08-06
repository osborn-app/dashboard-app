"use client";
import TabLists from "@/components/TabLists";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";

import NeedsTable from "@/components/tables/needs-tables/needs-tables";
import { TabsContent } from "@/components/ui/tabs";
import { useGetMaintenances } from "@/hooks/api/useNeeds";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";

const NeedsTableWrapper = () => {

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const defaultTab = searchParams.get("status") ?? "ongoing";
  const q = searchParams.get("q");
  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQuery, 500);

  const { data: NeedsData, isFetching, refetch } = useGetMaintenances(
    {
      limit: pageLimit,
      page: page,
      q: searchDebounce,
      status: defaultTab,
    },
    ""
  );



  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const lists = [
    { name: "Sedang Berjalan", value: "ongoing" },
    { name: "Selesai", value: "done" },
  ];

  // Refetch data when returning from preview page
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TabLists lists={lists} />
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Cari Maintenance"
          />
        </div>
      </div>
      
      {/* Render TabsContent for each status */}
      {lists.map((list) => (
        <TabsContent key={list.value} value={list.value} className="space-y-4">
          {defaultTab === list.value && (
            <>
              {isFetching && <Spinner />}
              {!isFetching && NeedsData && (
                <NeedsTable
                  data={
                    Array.isArray(NeedsData.data) && NeedsData.data.length > 0
                      ? NeedsData.data.map((item: any) => ({
                          ...item,
                          armada: item.fleet?.name ?? "-",
                          mulai: item.start_date,
                          estimasi: item.estimate_days,
                        }))
                      : []
                  }
                />
              )}
            </>
          )}
        </TabsContent>
      ))}
    </>
  );
};

export default NeedsTableWrapper;