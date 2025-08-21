"use client";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import { ProductTable } from "@/components/tables/product-tables/product-table";
import { productColumns } from "@/components/tables/product-tables/product-columns";
import { useGetProducts } from "@/hooks/api/useProduct";
import { SortingState } from "@tanstack/react-table";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Product categories enum (trigger deploy)
const ProductCategories = {
  IPHONE: 'iphone',
  CAMERA: 'camera', 
  OUTDOOR: 'outdoor',
  STARLINK: 'starlink',
} as const;

const ProductTableWrapper = () => {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const q = searchParams.get("q");
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";
  const orderColumn = searchParams.get("order_column") || "";
  const orderBy = searchParams.get("order_by") || "";
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [selectedCategory, setSelectedCategory] = React.useState<string>(category);
  const [selectedStatus, setSelectedStatus] = React.useState<string>(status);
  const [searchDebounce] = useDebounce(searchQuery, 500);

  const getProductParams = () => ({
    limit: pageLimit,
    page: page,
    q: searchDebounce,
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
    ...(startDate ? { start_date: startDate } : {}),
    ...(endDate ? { end_date: endDate } : {}),
    ...(orderBy ? { order_by: orderBy } : {}),
    ...(orderColumn ? { order_column: orderColumn } : {}),
  });

  const { data: productsData, isFetching: isFetchingProducts } = useGetProducts(
    getProductParams(),
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

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleClearDate = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const categoryOptions = [
    { label: "All Categories", value: "" },
    { label: "iPhone", value: ProductCategories.IPHONE },
    { label: "Camera", value: ProductCategories.CAMERA },
    { label: "Outdoor", value: ProductCategories.OUTDOOR },
    { label: "Starlink", value: ProductCategories.STARLINK },
  ];

  const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Tidak Disewa", value: "available" },
    { label: "Sedang Disewa", value: "unavailable" },
  ];

  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      router.push(
        `${pathname}?${createQueryString({
          category: selectedCategory || null,
          status: selectedStatus || null,
          start_date: dayjs(dateRange?.from)
            .locale("id")
            .format("YYYY-MM-DDT00:00:00Z"),
          end_date: dayjs(dateRange?.to)
            .locale("id")
            .format("YYYY-MM-DDT23:00:00Z"),
        })}`,
      );
    } else {
      router.push(
        `${pathname}?${createQueryString({
          category: selectedCategory || null,
          status: selectedStatus || null,
          start_date: null,
          end_date: null,
        })}`,
      );
    }
  }, [dateRange]);

  useEffect(() => {
    if (
      searchDebounce !== undefined ||
      searchDebounce !== "" ||
      searchDebounce
    ) {
      router.push(
        `${pathname}?${createQueryString({
          category: selectedCategory || null,
          status: selectedStatus || null,
          q: searchDebounce,
          page: null,
          limit: pageLimit,
        })}`,
      );
    } else {
      router.push(
        `${pathname}?${createQueryString({
          category: selectedCategory || null,
          status: selectedStatus || null,
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
        status: selectedStatus || null,
        q: searchQuery || null,
        page: null,
        limit: pageLimit,
      })}`,
    );
  }, [selectedCategory, selectedStatus]);

  React.useEffect(() => {
    if (sorting.length > 0) {
      router.push(
        `${pathname}?${createQueryString({
          category: selectedCategory || null,
          status: selectedStatus || null,
          order_by: sorting[0]?.desc ? "DESC" : "ASC",
          order_column: sorting[0]?.id,
        })}`,
      );
    } else {
      router.push(
        `${pathname}?${createQueryString({
          category: selectedCategory || null,
          status: selectedStatus || null,
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
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
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
            placeholder="Search products by name, category, or model"
          />
        </div>
      </div>

      <div className="space-y-4">
        {isFetchingProducts && <Spinner />}
        {!isFetchingProducts && productsData && (
          <ProductTable
            columns={productColumns}
            data={productsData.items || []}
            searchKey="name"
            totalUsers={productsData.meta?.total_items || 0}
            pageCount={Math.ceil((productsData.meta?.total_items || 0) / pageLimit)}
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

export default ProductTableWrapper; 