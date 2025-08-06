"use client";
import TabLists from "@/components/TabLists";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";

import { NeedsTable } from "@/components/tables/needs-tables/needs-tables";
import { needsColumns } from "@/components/tables/needs-tables/columns";
import { TabsContent } from "@/components/ui/tabs";
import { useGetMaintenances } from "@/hooks/api/useNeeds";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useSession } from "next-auth/react";

const NeedsTableWrapper = () => {
  const { data: session } = useSession();
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
    session?.user?.accessToken || ""
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
              {!isFetching && NeedsData && NeedsData.items && NeedsData.items.length > 0 && (
                <NeedsTable
                  columns={needsColumns}
                  data={
                    NeedsData.items.map((item: any) => ({
                      ...item,
                      armada: item.fleet?.name ?? "-",
                      plate_number: item.fleet?.plate_number ?? "-",
                      mulai: item.start_date,
                      estimasi: item.estimate_days,
                    }))
                  }
                  searchKey="name"
                  totalItems={NeedsData.meta?.total_items || 0}
                  pageCount={NeedsData.pagination?.total_page || 1}
                  pageNo={page}
                />
              )}
              {!isFetching && (!NeedsData || !NeedsData.items || NeedsData.items.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tidak ada data maintenance untuk status ini</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      ))}
    </>
  );
};

export default NeedsTableWrapper;