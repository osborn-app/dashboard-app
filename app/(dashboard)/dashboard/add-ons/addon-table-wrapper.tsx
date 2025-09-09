"use client";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import { AddonTable } from "@/components/tables/addon-tables/addon-table";
import { addonColumns } from "@/components/tables/addon-tables/addon-columns";
import { useGetAddons } from "@/hooks/api/useProduct";
import { SortingState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

// Addon categories enum
const AddonCategories = {
  // Product Categories
  IPHONE: 'iphone',
  CAMERA: 'camera', 
  OUTDOOR: 'outdoor',
  STARLINK: 'starlink',
  // Fleet Types
  CAR: 'car',
  MOTORCYCLE: 'motorcycle',
} as const;

const AddonTableWrapper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const q = searchParams.get("q");
  const category = searchParams.get("category") || "";
  const orderColumn = searchParams.get("order_column") || "";
  const orderBy = searchParams.get("order_by") || "";
  const date = searchParams.get("date");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [selectedCategory, setSelectedCategory] = React.useState<string>(category);
  const [showUnavailable, setShowUnavailable] = React.useState<boolean>(false);
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: startDate ? new Date(startDate) : new Date(), // Default to today
    to: endDate ? new Date(endDate) : new Date(), // Default to today
  });
  const [searchDebounce] = useDebounce(searchQuery, 500);

  const getAddonParams = () => ({
    limit: pageLimit,
    page: page,
    q: searchDebounce,
    category: selectedCategory || undefined,
    ...(orderBy ? { order_by: orderBy } : {}),
    ...(orderColumn ? { order_column: orderColumn } : {}),
    ...(dateRange.from ? { start_date: format(dateRange.from, 'yyyy-MM-dd') } : {}),
    ...(dateRange.to ? { end_date: format(dateRange.to, 'yyyy-MM-dd') } : {}),
  });

  const { data: addonsData, isFetching: isFetchingAddons } = useGetAddons(
    getAddonParams(),
    {
      enabled: true,
    }
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

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleDateRangeChange = (range: DateRange) => {
    // If user clicks a single date, set both start and end date to the same date
    if (range.from && !range.to) {
      setDateRange({
        from: range.from,
        to: range.from  // Set end date same as start date
      });
    } else {
      setDateRange(range);
    }
  };

  const handleClearDate = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const categoryOptions = [
    { label: "Semua Kategori", value: "" },
    // Product Categories
    { label: "iPhone", value: AddonCategories.IPHONE },
    { label: "Kamera", value: AddonCategories.CAMERA },
    { label: "Outdoor", value: AddonCategories.OUTDOOR },
    { label: "Starlink", value: AddonCategories.STARLINK },
    // Fleet Types
    { label: "Mobil", value: AddonCategories.CAR },
    { label: "Motor", value: AddonCategories.MOTORCYCLE },
  ];

  useEffect(() => {
    if (
      searchDebounce !== undefined ||
      searchDebounce !== "" ||
      searchDebounce
    ) {
      router.push(
        `${pathname}?${createQueryString({
          category: selectedCategory || null,
          q: searchDebounce,
          page: null,
          limit: pageLimit,
        })}`,
      );
    } else {
      router.push(
        `${pathname}?${createQueryString({
          category: selectedCategory || null,
          q: null,
          page: null,
          limit: null,
        })}`,
      );
    }
  }, [searchDebounce]);

  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        category: selectedCategory || null,
        q: searchQuery || null,
        page: null,
        limit: pageLimit,
      })}`,
    );
  }, [selectedCategory]);

  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        category: selectedCategory || null,
        q: searchQuery || null,
        page: null,
        limit: pageLimit,
        start_date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
        end_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
      })}`,
    );
  }, [dateRange]);

  React.useEffect(() => {
    if (sorting.length > 0) {
      router.push(
        `${pathname}?${createQueryString({
          category: selectedCategory || null,
          order_by: sorting[0]?.desc ? "DESC" : "ASC",
          order_column: sorting[0]?.id,
        })}`,
      );
    } else {
      router.push(
        `${pathname}?${createQueryString({
          category: selectedCategory || null,
          order_by: null,
          order_column: null,
        })}`,
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih Kategori" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CalendarDateRangePicker
            onDateRangeChange={handleDateRangeChange}
            onClearDate={handleClearDate}
            dateRange={dateRange}
          />

          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Cari add-on berdasarkan nama atau deskripsi"
          />
        </div>
      </div>

      <div className="space-y-4">
        {isFetchingAddons && <Spinner />}
                 {!isFetchingAddons && addonsData && (
            <AddonTable
              columns={addonColumns}
              data={Array.isArray(addonsData) 
                ? (showUnavailable 
                    ? addonsData 
                    : addonsData.filter((addon: any) => addon.is_available)
                  )
                : (addonsData.items || [])
              }
              searchKey="name"
              totalItems={Array.isArray(addonsData) 
                ? (showUnavailable 
                    ? addonsData.length 
                    : addonsData.filter((addon: any) => addon.is_available).length
                  )
                : (addonsData.meta?.total_items || 0)
              }
              pageCount={Array.isArray(addonsData) ? 1 : Math.ceil((addonsData.meta?.total_items || 0) / pageLimit)}
              pageNo={page}
              searchQuery={searchQuery}
              sorting={sorting}
              setSorting={setSorting}
            />
          )}
      </div>
    </>
  );
};

export default AddonTableWrapper;
