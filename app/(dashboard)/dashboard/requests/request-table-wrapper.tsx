"use client";
import TabLists from "@/components/TabLists";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import SearchInput from "@/components/search-input";
import RequestTypeFilter from "@/components/request-type-filter";
import Spinner from "@/components/spinner";
import {
  completedColumns,
  pendingColumns,
} from "@/components/tables/request-tables/columns";
import { RequestTable } from "@/components/tables/request-tables/request-table";
import { TabsContent } from "@/components/ui/tabs";
import { useGetRequests } from "@/hooks/api/useRequest";
import { SortingState } from "@tanstack/react-table";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "use-debounce";

const RequestTableWrapper = () => {
  // THIS MORNING I WOULD LIKE TO FIX THIS !!!!!!
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const defaultTab = searchParams.get("status") ?? "pending";
  const q = searchParams.get("q");
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";
  const requestType = searchParams.get("request_type") || "all";
  const orderColumn = searchParams.get("order_column") || "";
  const orderBy = searchParams.get("order_by") || "";
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQuery, 500);
  const [requestTypeFilter, setRequestTypeFilter] = React.useState<string>(requestType);

  const { data: pendingData, isFetching: isFetchingPendingData } = useGetRequests(
    {
      limit: pageLimit,
      page: page,
      q: searchDebounce,
      status: "pending",
      start_date: startDate,
      end_date: endDate,
      request_type: requestType as 'all' | 'product' | 'fleet',
    },
    {
      enabled: defaultTab === "pending",
    },
    "pending",
  );

  const { data: onProgressData, isFetching: isFetchingOnProgressData } =
    useGetRequests(
      {
        limit: pageLimit,
        page: page,
        q: searchDebounce,
        status: "on_progress",
        start_date: startDate,
        end_date: endDate,
        request_type: requestType as 'all' | 'product' | 'fleet',
      },
      { enabled: defaultTab === "on_progress" },
      "on_progress",
    );

  const { data: completedData, isFetching: isFetchingCompletedData } =
    useGetRequests(
      {
        limit: pageLimit,
        page: page,
        q: searchDebounce,
        status: "done",
        start_date: startDate,
        end_date: endDate,
        request_type: requestType as 'all' | 'product' | 'fleet',
      },
      { enabled: defaultTab === "done" },
      "done",
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

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleClearDate = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const handleRequestTypeChange = (value: string) => {
    setRequestTypeFilter(value);
  };

  const lists = [
    {
      name: "Pending",
      value: "pending",
    },
    {
      name: "On Progress",
      value: "on_progress",
    },
    {
      name: "Done",
      value: "done",
    },
  ];

  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      router.push(
        `${pathname}?${createQueryString({
          status: defaultTab,
          start_date: dayjs(dateRange?.from).locale("id").format("YYYY-MM-DDT00:00:00Z"),
          end_date: dayjs(dateRange?.to).locale("id").format("YYYY-MM-DDT23:00:00Z"),
          request_type: requestTypeFilter,
        })}`,
      );
    } else {
      router.push(
        `${pathname}?${createQueryString({
          status: defaultTab,
          start_date: null,
          end_date: null,
          request_type: requestTypeFilter,
        })}`,
      );
    }
  }, [dateRange, requestTypeFilter]);

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
          start_date: null,
          end_date: null,
          page: null,
          limit: pageLimit,
          request_type: requestTypeFilter,
        })}`,
      );
    } else {
      router.push(
        `${pathname}?${createQueryString({
          status: defaultTab,
          q: null,
          page: null,
          limit: null,
          request_type: requestTypeFilter,
        })}`,
      );
    }
  }, [searchDebounce, requestTypeFilter]);

  useEffect(() => {
    handleClearDate()
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        q: null,
        start_date: null,
        end_date: null,
        page: null,
        limit: null,
        request_type: requestTypeFilter,
      })}`,
    );
  }, [defaultTab, requestTypeFilter]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TabLists lists={lists} />
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <RequestTypeFilter
            value={requestTypeFilter}
            onValueChange={handleRequestTypeChange}
          />
          <CalendarDateRangePicker
            onDateRangeChange={handleDateRangeChange}
            onClearDate={handleClearDate}
            dateRange={dateRange}
          />
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Cari pesanan berdasarkan Pelanggan"
          />
        </div>
      </div>
      <TabsContent value="pending" className="space-y-4">
        {isFetchingPendingData && <Spinner />}
        {!isFetchingPendingData && pendingData && (
          <RequestTable
            columns={pendingColumns}
            data={pendingData.items}
            searchKey="name"
            totalUsers={pendingData.meta?.total_items}
            pageCount={Math.ceil(pendingData.meta?.total_items / pageLimit)}
            pageNo={page}
            searchQuery={searchQuery}
          />
        )}
      </TabsContent>
      <TabsContent value="on_progress" className="space-y-4">
        {isFetchingOnProgressData && <Spinner />}
        {!isFetchingOnProgressData && onProgressData && (
          <RequestTable
            columns={completedColumns}
            data={onProgressData.items}
            searchKey="name"
            totalUsers={onProgressData.meta?.total_items}
            pageCount={Math.ceil(onProgressData.meta?.total_items / pageLimit)}
            pageNo={page}
            searchQuery={searchQuery}
          />
        )}
      </TabsContent>
      <TabsContent value="done" className="space-y-4">
        {isFetchingCompletedData && <Spinner />}
        {!isFetchingCompletedData && completedData && (
          <RequestTable
            columns={completedColumns}
            data={completedData.items}
            searchKey="name"
            totalUsers={completedData.meta?.total_items}
            pageCount={Math.ceil(completedData.meta?.total_items / pageLimit)}
            pageNo={page}
            searchQuery={searchQuery}
          />
        )}
      </TabsContent>
    </>
  );
};

export default RequestTableWrapper;
