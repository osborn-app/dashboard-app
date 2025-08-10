"use client";
import TabLists from "@/components/TabLists";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import {
  completedProductOrderColumns,
  onProgressProductOrderColumns,
  confirmedProductOrderColumns,
  pendingProductOrderColumns,
} from "@/components/tables/order-tables/product-order-columns";
import { OrderTable } from "@/components/tables/order-tables/order-table";
import { TabsContent } from "@/components/ui/tabs";
import { useGetProductOrders } from "@/hooks/api/useProductOrder";
import { SortingState } from "@tanstack/react-table";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "use-debounce";
import { OrderStatus } from "../orders/[orderId]/types/order";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Product types enum to match backend
const ProductTypes = {
  IPHONE: 'iphone',
  CAMERA: 'camera',
  OUTDOOR: 'outdoor',
  STARLINK: 'starlink',
} as const;

const ProductOrderTableWrapper = () => {
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

  // >>> PERUBAHAN DI SINI <<<
  // Inisialisasi 'type' dengan 'iphone' jika tidak ada di URL
  const initialType = searchParams.get("type") || ProductTypes.IPHONE;
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";
  const orderColumn = searchParams.get("order_column") || "";
  const orderBy = searchParams.get("order_by") || "";
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  // Inisialisasi selectedType dengan nilai dari initialType
  const [selectedType, setSelectedType] = React.useState<string>(initialType);
  const [searchDebounce] = useDebounce(searchQuery, 500);

  const getOrderParams = (status: string) => ({
    limit: pageLimit,
    page: page,
    q: searchDebounce,
    status: status,
    order_type: "product",
    ...(selectedType ? { type: selectedType } : {}),
    ...(startDate ? { start_date: startDate } : {}),
    ...(endDate ? { end_date: endDate } : {}),
    ...(orderBy ? { order_by: orderBy } : {}),
    ...(orderColumn ? { order_column: orderColumn } : {}),
  });

  const { data: pendingData, isFetching: isFetchingPendingData } = useGetProductOrders(
    getOrderParams(OrderStatus.PENDING),
    {
      enabled: defaultTab === OrderStatus.PENDING,
    },
    OrderStatus.PENDING,
  );

  const { data: confirmedData, isFetching: isFetchingConfirmedData } =
    useGetProductOrders(
      getOrderParams(OrderStatus.CONFIRMED),
      { enabled: defaultTab === OrderStatus.CONFIRMED },
      OrderStatus.CONFIRMED,
    );

  const { data: onProgressData, isFetching: isFetchingOnProgressData } =
    useGetProductOrders(
      getOrderParams(OrderStatus.ON_PROGRESS),
      { enabled: defaultTab === OrderStatus.ON_PROGRESS },
      OrderStatus.ON_PROGRESS,
    );

  const { data: completedData, isFetching: isFetchingCompletedData } =
    useGetProductOrders(
      getOrderParams(OrderStatus.DONE),
      { enabled: defaultTab === OrderStatus.DONE },
      OrderStatus.DONE,
    );

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const newSearchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === '') { // Tambahkan kondisi untuk string kosong
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

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleClearDate = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const lists = [
    {
      name: "Menunggu",
      value: OrderStatus.PENDING,
    },
    {
      name: "Terkonfirmasi",
      value: OrderStatus.CONFIRMED,
    },
    {
      name: "Sedang Berjalan",
      value: OrderStatus.ON_PROGRESS,
    },
    {
      name: "Selesai",
      value: OrderStatus.DONE,
    },
  ];

  const productTypeOptions = [
    { label: "iPhone", value: ProductTypes.IPHONE },
    { label: "Camera", value: ProductTypes.CAMERA },
    { label: "Outdoor", value: ProductTypes.OUTDOOR },
    { label: "Starlink", value: ProductTypes.STARLINK },
  ];

  // Efek untuk dateRange, searchDebounce, sorting, defaultTab (seperti yang sudah ada)

  useEffect(() => {
    // Saat ada perubahan pada dateRange, perbarui URL
    const newParams: Record<string, string | null | undefined> = {
      status: defaultTab,
      type: selectedType || null, // Pastikan 'type' disetel ke 'null' jika selectedType kosong
      q: searchQuery || null, // Pertahankan nilai q
      page: null, // Reset page
      limit: pageLimit?.toString() ?? null, // Pastikan limit adalah string
    };
    
    if (dateRange && dateRange.from && dateRange.to) {
      newParams.start_date = dayjs(dateRange?.from).locale("id").format("YYYY-MM-DDT00:00:00Z");
      newParams.end_date = dayjs(dateRange?.to).locale("id").format("YYYY-MM-DDT23:00:00Z");
    } else {
      newParams.start_date = null;
      newParams.end_date = null;
    }

    router.push(`${pathname}?${createQueryString(newParams)}`);
  }, [dateRange, defaultTab, selectedType, searchQuery, pageLimit]); // Tambahkan dependensi yang relevan

  useEffect(() => {
    // Saat searchDebounce berubah, perbarui URL
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        type: selectedType || null,
        q: searchDebounce || null, // Pastikan q null jika string kosong
        page: null,
        limit: pageLimit,
      })}`,
    );
  }, [searchDebounce, defaultTab, selectedType, pageLimit]); // Tambahkan dependensi

  useEffect(() => {
    // Saat selectedType berubah, perbarui URL
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        type: selectedType || null,
        q: searchQuery || null,
        page: null,
        limit: pageLimit,
      })}`,
    );
  }, [selectedType, defaultTab, searchQuery, pageLimit]); // Tambahkan dependensi

  React.useEffect(() => {
    // Saat sorting berubah, perbarui URL
    const newParams: Record<string, string | null | undefined> = {
      status: defaultTab,
      type: selectedType || null,
      q: searchQuery || null, // Pertahankan nilai q
      page: page?.toString() ?? null, // Pastikan page adalah string
      limit: pageLimit?.toString() ?? null, // Pastikan limit adalah string
    };

    if (sorting.length > 0) {
      newParams.order_by = sorting[0]?.desc ? "DESC" : "ASC";
      newParams.order_column = sorting[0]?.id;
    } else {
      newParams.order_by = null;
      newParams.order_column = null;
    }
    router.push(`${pathname}?${createQueryString(newParams)}`);
  }, [sorting, defaultTab, selectedType, searchQuery, page, pageLimit]);


  // Effect untuk defaultTab. Ini harus memicu URL update saat tab berubah.
  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        type: selectedType || null,
        q: searchQuery || null,
        page: null,
        limit: null,
        order_by: null,
        order_column: null,
      })}`,
    );
  }, [defaultTab, selectedType, searchQuery]); // Tambahkan dependensi yang relevan

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TabLists lists={lists} />
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-48">
              {/* Ini yang menentukan teks yang ditampilkan */}
              <SelectValue
                placeholder="Pilih Kategori"
              >
                {/* Tampilkan label yang sesuai dengan selectedType */}
                {productTypeOptions.find(option => option.value === selectedType)?.label || "Semua Kategori"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {productTypeOptions.map((option) => (
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
            placeholder="Cari product orders berdasarkan Pelanggan / Produk / Invoice"
          />
        </div>
      </div>
      <TabsContent value={OrderStatus.PENDING} className="space-y-4">
        {isFetchingPendingData && <Spinner />}
        {!isFetchingPendingData && pendingData && (
          <OrderTable
            columns={pendingProductOrderColumns}
            data={pendingData.items}
            searchKey="name"
            totalUsers={pendingData.meta?.total_items}
            pageCount={Math.ceil(pendingData.meta?.total_items / pageLimit)}
            pageNo={page}
            searchQuery={searchQuery}
            sorting={sorting}
            setSorting={setSorting}
          />
        )}
      </TabsContent>
      <TabsContent value={OrderStatus.CONFIRMED} className="space-y-4">
        {isFetchingConfirmedData && <Spinner />}
        {!isFetchingConfirmedData && confirmedData && (
          <OrderTable
            columns={confirmedProductOrderColumns}
            sorting={sorting}
            setSorting={setSorting}
            data={confirmedData.items}
            searchKey="name"
            totalUsers={confirmedData.meta?.total_items}
            pageCount={Math.ceil(confirmedData.meta?.total_items / pageLimit)}
            pageNo={page}
            searchQuery={searchQuery}
          />
        )}
      </TabsContent>
      <TabsContent value={OrderStatus.ON_PROGRESS} className="space-y-4">
        {isFetchingOnProgressData && <Spinner />}
        {!isFetchingOnProgressData && onProgressData && (
          <OrderTable
            columns={onProgressProductOrderColumns}
            sorting={sorting}
            setSorting={setSorting}
            data={onProgressData.items}
            searchKey="name"
            totalUsers={onProgressData.meta?.total_items}
            pageCount={Math.ceil(onProgressData.meta?.total_items / pageLimit)}
            pageNo={page}
            searchQuery={searchQuery}
          />
        )}
      </TabsContent>
      <TabsContent value={OrderStatus.DONE} className="space-y-4">
        {isFetchingCompletedData && <Spinner />}
        {!isFetchingCompletedData && completedData && (
          <OrderTable
            sorting={sorting}
            setSorting={setSorting}
            columns={completedProductOrderColumns}
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

export default ProductOrderTableWrapper;