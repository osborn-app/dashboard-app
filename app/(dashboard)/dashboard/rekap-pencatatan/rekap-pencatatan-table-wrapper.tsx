"use client";
import RekapPencatatanTabLists from "./rekap-pencatatan-tab-lists";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import {
  columnsOrderanSewa,
  columnsReimburse,
  columnsInventaris,
  columnsLainnya,
} from "@/components/tables/rekap-pencatatan-tables/columns";
import { RekapPencatatanTable } from "@/components/tables/rekap-pencatatan-tables/rekap-pencatatan-table";
import { TabsContent } from "@/components/ui/tabs";
import {
  useGetOrderanSewa,
  useGetReimburse,
  useGetInventaris,
  useGetLainnya,
} from "@/hooks/api/useRekap";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";

const RekapPencatatanTableWrapper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const defaultTab = searchParams.get("type") ?? "orderan-sewa";
  const q = searchParams.get("q");
  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQuery, 500);

  // API calls dengan enabled condition
  const { data: orderanSewaData, isFetching: isFetchingOrderanSewa } =
    useGetOrderanSewa(
      {
        limit: pageLimit,
        page: page,
        q: searchDebounce,
      },
      {
        enabled: defaultTab === "orderan-sewa",
      },
    );

  const { data: reimburseData, isFetching: isFetchingReimburse } =
    useGetReimburse(
      {
        limit: pageLimit,
        page: page,
        q: searchDebounce,
      },
      {
        enabled: defaultTab === "reimburse",
      },
    );

  const { data: inventarisData, isFetching: isFetchingInventaris } =
    useGetInventaris(
      {
        limit: pageLimit,
        page: page,
        q: searchDebounce,
      },
      {
        enabled: defaultTab === "inventaris",
      },
    );

  const { data: lainnyaData, isFetching: isFetchingLainnya } = useGetLainnya(
    {
      limit: pageLimit,
      page: page,
      q: searchDebounce,
    },
    {
      enabled: defaultTab === "lainnya",
    },
  );

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const newSearchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === "") {
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
    {
      name: "Orderan Sewa",
      value: "orderan-sewa",
    },
    {
      name: "Reimburse",
      value: "reimburse",
    },
    {
      name: "Inventaris",
      value: "inventaris",
    },
    {
      name: "Lainnya",
      value: "lainnya",
    },
  ];

  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        type: defaultTab,
        q: searchDebounce || null,
        page: null,
        limit: pageLimit,
      })}`,
    );
  }, [searchDebounce, defaultTab, pageLimit]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <RekapPencatatanTabLists lists={lists} />
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Cari data rekap pencatatan"
          />
        </div>
      </div>

      <TabsContent value="orderan-sewa" className="space-y-4">
        {isFetchingOrderanSewa && <Spinner />}
        {!isFetchingOrderanSewa && orderanSewaData && (
          <RekapPencatatanTable
            columns={columnsOrderanSewa}
            data={orderanSewaData.items}
            type="orderan-sewa"
            searchKey="customer.name"
            totalUsers={orderanSewaData.meta?.total_items}
            pageCount={Math.ceil(orderanSewaData.meta?.total_items / pageLimit)}
            pageNo={page}
          />
        )}
      </TabsContent>

      <TabsContent value="reimburse" className="space-y-4">
        {isFetchingReimburse && <Spinner />}
        {!isFetchingReimburse && reimburseData && (
          <RekapPencatatanTable
            columns={columnsReimburse}
            data={reimburseData.items}
            type="reimburse"
            searchKey="driver.name"
            totalUsers={reimburseData.meta?.total_items}
            pageCount={Math.ceil(reimburseData.meta?.total_items / pageLimit)}
            pageNo={page}
          />
        )}
      </TabsContent>

      <TabsContent value="inventaris" className="space-y-4">
        {isFetchingInventaris && <Spinner />}
        {!isFetchingInventaris && inventarisData && (
          <RekapPencatatanTable
            columns={columnsInventaris}
            data={inventarisData.items}
            type="inventaris"
            searchKey="name"
            totalUsers={inventarisData.meta?.total_items}
            pageCount={Math.ceil(inventarisData.meta?.total_items / pageLimit)}
            pageNo={page}
          />
        )}
      </TabsContent>

      <TabsContent value="lainnya" className="space-y-4">
        {isFetchingLainnya && <Spinner />}
        {!isFetchingLainnya && lainnyaData && (
          <RekapPencatatanTable
            columns={columnsLainnya}
            data={lainnyaData.items}
            type="lainnya"
            searchKey="name"
            totalUsers={lainnyaData.meta?.total_items}
            pageCount={Math.ceil(lainnyaData.meta?.total_items / pageLimit)}
            pageNo={page}
          />
        )}
      </TabsContent>
    </>
  );
};

export default RekapPencatatanTableWrapper;
