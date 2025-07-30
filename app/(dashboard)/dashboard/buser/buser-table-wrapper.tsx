"use client";
import TabLists from "@/components/TabLists";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import { BuserColumns } from "@/components/tables/buser-tables/columns";
import { BuserTable } from "@/components/tables/buser-tables/buser-table";
import { TabsContent } from "@/components/ui/tabs";
import { useGetBuser } from "@/hooks/api/useBuser";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";

const BuserTableWrapper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const defaultTab = searchParams.get("status") ?? "peringatan";
  const q = searchParams.get("q");
  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQuery, 500);

  const { data: buserData, isFetching, refetch } = useGetBuser(
    {
      limit: pageLimit,
      page: page,
      q: searchDebounce,
      status: defaultTab,
    },
    {
      enabled: true,
      refetchOnWindowFocus: true,
    },
    defaultTab,
  );

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

  const lists = [
    { name: "Peringatan", value: "peringatan" },
    { name: "Butuh Tindakan", value: "butuh_tindakan" },
    { name: "Urgent", value: "urgent" },
    { name: "Tindak Lanjut", value: "tindak_lanjut" },
    { name: "Selesai", value: "selesai" },
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
            placeholder="Cari Buser"
          />
        </div>
      </div>
      
      {/* Render TabsContent for each status */}
      {lists.map((list) => (
        <TabsContent key={list.value} value={list.value} className="space-y-4">
          {defaultTab === list.value && (
            <>
              {isFetching && <Spinner />}
              {!isFetching && buserData && buserData.length > 0 && (
                <BuserTable
                  columns={BuserColumns}
                  data={
                    (buserData ?? [])
                      .map((item: any) => ({
                        ...item,
                        name: item.order?.customer?.name ?? "-",
                        phone_number: item.order?.customer?.phone_number ?? "-",
                        emergency_number:
                          item.order?.customer?.emergency_number ?? "-",
                        email: item.order?.customer?.email ?? "-",
                      }))
                      .filter(
                        (item: any) =>
                          !searchQuery ||
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                      .sort(
                        (a: any, b: any) =>
                          new Date(b.status_updated_at).getTime() -
                          new Date(a.status_updated_at).getTime(),
                      )
                      .slice((page - 1) * pageLimit, page * pageLimit)
                  }
                  searchKey="name"
                  totalItems={
                    (buserData ?? [])
                      .map((item: any) => ({
                        ...item,
                        name: item.order?.customer?.name ?? "-",
                      }))
                      .filter(
                        (item: any) =>
                          !searchQuery ||
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
                      ).length
                  }
                  pageCount={Math.ceil(
                    ((buserData ?? [])
                      .map((item: any) => ({
                        ...item,
                        name: item.order?.customer?.name ?? "-",
                      }))
                      .filter(
                        (item: any) =>
                          !searchQuery ||
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
                      ).length ?? 0) / pageLimit,
                  )}
                  pageNo={page}
                />
              )}
              {!isFetching && (!buserData || buserData.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tidak ada data buser untuk status</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      ))}
    </>
  );
};

export default BuserTableWrapper;
