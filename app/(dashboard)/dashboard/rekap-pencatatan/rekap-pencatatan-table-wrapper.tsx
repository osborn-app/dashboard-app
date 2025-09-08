"use client";
import RekapPencatatanTabLists from "./rekap-pencatatan-tab-lists";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import {
  columnsOrderanSewa,
  columnsProduk,
  columnsReimburse,
  columnsInventaris,
  columnsLainnya,
} from "@/components/tables/rekap-pencatatan-tables/columns";
import { RekapPencatatanTable } from "@/components/tables/rekap-pencatatan-tables/rekap-pencatatan-table";
import { TabsContent } from "@/components/ui/tabs";
import {
  useGetOrderanSewa,
  useGetOrderanProduk,
  useGetReimburse,
  useGetInventaris,
  useGetLainnya,
} from "@/hooks/api/useRekap";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";

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
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<"csv" | "xlsx">("csv");
  const [exportScope, setExportScope] = React.useState<"current" | "all">("current");
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({});
  const axiosAuth = useAxiosAuth();

  // State terpisah untuk tab yang aktif
  const [activeTab, setActiveTab] = React.useState<string>(defaultTab);

  // Update activeTab ketika searchParams berubah
  useEffect(() => {
    const currentType = searchParams.get("type");
    if (currentType && currentType !== activeTab) {
      setActiveTab(currentType);
    }
  }, [searchParams, activeTab]);

  // API calls dengan enabled condition menggunakan activeTab
  const { data: orderanSewaData, isFetching: isFetchingOrderanSewa } =
    useGetOrderanSewa(
      {
        limit: pageLimit,
        page: page,
        q: searchDebounce,
      },
      {
        enabled: activeTab === "orderan-sewa",
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
        enabled: activeTab === "reimburse",
      },
    );

  const { data: orderanProdukData, isFetching: isFetchingOrderanProduk } =
    useGetOrderanProduk(
      {
        limit: pageLimit,
        page: page,
        q: searchDebounce,
      },
      {
        enabled: activeTab === "orderan-produk",
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
        enabled: activeTab === "inventaris",
      },
    );

  const { data: lainnyaData, isFetching: isFetchingLainnya } = useGetLainnya(
    {
      limit: pageLimit,
      page: page,
      q: searchDebounce,
    },
    {
      enabled: activeTab === "lainnya",
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

  const handleGenerateAndDownload = async () => {
    setIsDownloading(true);

    try {
      // Build params with date filters
      const dateParams: Record<string, any> = {};
      if (dateRange?.from) dateParams.start_date = dateRange.from.toISOString().split("T")[0];
      if (dateRange?.to) dateParams.end_date = dateRange.to.toISOString().split("T")[0];

      // Helper: fetch a single page for a tab (sequential-friendly)
      const fetchPage = async (tab: string, pageNo: number) => {
        const commonParams: any = {
          limit: pageLimit,
          page: pageNo,
          q: searchDebounce,
          ...dateParams,
        };
        if (tab === "orderan-sewa") {
          const res = await axiosAuth.get("/rekap-transaksi/orderan-sewa", { params: commonParams });
          return res.data;
        }
        if (tab === "orderan-produk") {
          const res = await axiosAuth.get("/rekap-transaksi/produk", { params: commonParams });
          return res.data;
        }
        if (tab === "reimburse") {
          const res = await axiosAuth.get("/rekap-transaksi/reimburse", { params: commonParams });
          return res.data;
        }
        if (tab === "inventaris") {
          const res = await axiosAuth.get("/inventory", { params: { ...commonParams, status: "verified" } });
          return res.data;
        }
        if (tab === "lainnya") {
          const res = await axiosAuth.get("/rekap-transaksi/lainnya", { params: commonParams });
          return res.data;
        }
        return null;
      };

      // Helper: iterate all pages sequentially
      const fetchAllItemsSequential = async (tab: string) => {
        const firstPage = await fetchPage(tab, 1);
        if (!firstPage) return { items: [], meta: { total_items: 0 } };
        // Inventaris response shape differs
        const getItems = (res: any) =>
          tab === "inventaris"
            ? (res?.data?.data || res?.data?.items || res?.data || [])
            : (res?.items || []);
        const getTotal = (res: any) =>
          tab === "inventaris" ? (res?.data?.total || 0) : (res?.meta?.total_items || 0);

        let items = getItems(firstPage);
        const total = getTotal(firstPage);
        const totalPages = Math.max(1, Math.ceil(total / pageLimit));
        for (let p = 2; p <= totalPages; p++) {
          const res = await fetchPage(tab, p);
          const more = getItems(res);
          items = items.concat(more);
        }
        return { items, total };
      };

      // Get data based on scope
      let currentData: any[] = [];
      let tabName = "";

      switch (activeTab) {
        case "orderan-sewa":
          if (exportScope === "all") {
            const all = await fetchAllItemsSequential("orderan-sewa");
            currentData = all.items;
          } else {
            const pageRes = await fetchPage("orderan-sewa", page);
            currentData = pageRes?.items || [];
          }
          tabName = "Orderan Fleets";
          break;
        case "orderan-produk":
          if (exportScope === "all") {
            const all = await fetchAllItemsSequential("orderan-produk");
            currentData = all.items;
          } else {
            const pageRes = await fetchPage("orderan-produk", page);
            currentData = pageRes?.items || [];
          }
          tabName = "Orderan Produk";
          break;
        case "reimburse":
          if (exportScope === "all") {
            const all = await fetchAllItemsSequential("reimburse");
            currentData = all.items;
          } else {
            const pageRes = await fetchPage("reimburse", page);
            currentData = pageRes?.items || [];
          }
          tabName = "Reimburse";
          break;
        case "inventaris":
          if (exportScope === "all") {
            const all = await fetchAllItemsSequential("inventaris");
            currentData = all.items;
          } else {
            const pageRes = await fetchPage("inventaris", page);
            currentData = pageRes?.data?.data || pageRes?.data?.items || pageRes?.data || [];
          }
          tabName = "Inventaris";
          break;
        case "lainnya":
          if (exportScope === "all") {
            const all = await fetchAllItemsSequential("lainnya");
            currentData = all.items;
          } else {
            const pageRes = await fetchPage("lainnya", page);
            currentData = pageRes?.items || [];
          }
          tabName = "Lainnya";
          break;
        default:
          currentData = [];
          tabName = "Rekap Pencatatan";
      }

      if (currentData.length === 0) {
        alert("Tidak ada data untuk diunduh");
        return;
      }

      // Helper to fetch detail sequentially (no Promise.all)
      const fetchDetailSequential = async (items: any[], tab: string) => {
        const detailed: any[] = [];
        for (const item of items) {
          try {
            if (tab === "orderan-sewa") {
              const res = await axiosAuth.get(`/rekap-transaksi/orderan-sewa/${item.id}`);
              detailed.push(res.data);
            } else if (tab === "orderan-produk") {
              const res = await axiosAuth.get(`/rekap-transaksi/produk/${item.id}`);
              detailed.push(res.data);
            } else {
              detailed.push(item);
            }
          } catch (e) {
            detailed.push(item);
          }
        }
        return detailed;
      };

      // Build rows according to tab and format
      let rows: any[] = [];
      if (activeTab === "orderan-sewa") {
        const detailed = await fetchDetailSequential(currentData, "orderan-sewa");
        rows = detailed.map((data: any, index: number) => {
          const discount = data.price_calculation?.discount_percentage ?? 0;
          const additionalServicesTotal = Array.isArray(data.additional_services)
            ? data.additional_services.reduce((sum: number, item: any) => sum + (Number(item?.price) || 0), 0)
            : 0;
          return {
            No: index + 1,
            "Nama Customer": data.customer?.name || "-",
            Armada: data.fleet?.name || "-",
            "Tanggal Sewa": data.start_date || "-",
            "Harga Unit": data.price_calculation?.rent_price ?? 0,
            "Durasi Penyewaan": data.duration ?? 0,
            "Total Harga Unit": data.price_calculation?.total_rent_price ?? 0,
            "Discount (%)": discount,
            "Total Potongan Diskon Unit": data.price_calculation?.discount ?? 0,
            "Total Harga Setelah Diskon": (data.price_calculation?.total_rent_price ?? 0) - (data.price_calculation?.discount ?? 0),
            "Charge Weekend": data.price_calculation?.total_weekend_price ?? 0,
            "Layanan Antar Jemput": data.price_calculation?.service_price ?? 0,
            "Layanan Luar Kota": data.price_calculation?.out_of_town_price ?? 0,
            "Layanan Driver": data.price_calculation?.total_driver_price ?? 0,
            "Layanan Asuransi": data.price_calculation?.insurance_price ?? 0,
            "Layanan Add-Ons": data.addons_price ?? 0,
            "Layanan Lainnya": additionalServicesTotal,
            "Total Harga Keseluruhan": data.price_calculation?.grand_total ?? 0,
            "No Invoice": data.invoice_number || "-",
            Status: data.status === "accepted" ? "Lunas" : (data.status ?? "-"),
          };
        });
      } else if (activeTab === "orderan-produk") {
        const detailed = await fetchDetailSequential(currentData, "orderan-produk");
        rows = detailed.map((data: any, index: number) => {
          const discountPercentage = (data.price_calculation?.discount_percentage ?? data.discount ?? 0) as number;
          const additionalServicesTotal = Array.isArray(data.additional_services)
            ? data.additional_services.reduce((sum: number, item: any) => sum + (Number(item?.price) || 0), 0)
            : 0;
          const displayStatus = data.status === "accepted" ? "Lunas" : (data.status || "-");
          return {
            No: index + 1,
            Pelanggan: data.customer?.name || "-",
            Produk: data.product?.name || data.fleet?.name || "-",
            Kategori: data.product?.category_label || data.product?.category || "-",
            "Tanggal Sewa": data.start_date || "-",
            "Harga Produk": data.product?.price ?? 0,
            "Durasi Penyewaan": data.duration ?? 0,
            "Total Harga Unit": data.price_calculation?.total_rent_price ?? data.sub_total_price ?? 0,
            "Diskon (%)": discountPercentage,
            "Total Potongan Diskon": data.price_calculation?.discount ?? data.discount_amount ?? 0,
            "Layanan Antar Jemput": data.price_calculation?.total_weekend_price ?? data.weekend_price ?? 0,
            "Layanan Lainnya": additionalServicesTotal,
            "Layanan Add-Ons": data.price_calculation?.addons_price ?? data.addons_price ?? 0,
            "Total Harga Keseluruhan": data.price_calculation?.grand_total ?? 0,
            "No Invoice": data.invoice_number || "-",
            Status: displayStatus,
          };
        });
      } else if (activeTab === "reimburse") {
        rows = currentData.map((item: any, index: number) => ({
          No: index + 1,
          "Nama Driver": item.driver?.name || "-",
          Total: item.nominal || 0,
          "No Rekening": item.noRekening || "-",
          Tanggal: item.date || "-",
          "Nama Bank": item.bank || "-",
          Kebutuhan: item.description || "-",
          Status: item.status || "-",
        }));
      } else if (activeTab === "inventaris") {
        rows = currentData.map((item: any, index: number) => ({
          No: index + 1,
          "Nama Aset": item.assetName || item.name || "-",
          Jumlah: item.quantity || 0,
          "Harga Satuan": item.unitPrice ?? item.unit_price ?? 0,
          "Total Harga": item.totalPrice ?? item.total ?? 0,
          Tanggal: item.purchaseDate || item.date || "-",
        }));
      } else if (activeTab === "lainnya") {
        rows = currentData.map((item: any, index: number) => ({
          No: index + 1,
          "Nama Transaksi": item.name || "-",
          Kategori: item.category || "-",
          Total: item.nominal ?? 0,
          Tanggal: item.date || "-",
          Keterangan: item.description || "-",
        }));
      }

      if (exportFormat === "xlsx") {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, tabName);
        XLSX.writeFile(workbook, `${tabName}-${new Date().toISOString().split("T")[0]}.xlsx`);
      } else {
        const headers = Object.keys(rows[0]);
        const csv = [headers.join(",")].concat(
          rows.map((row) => headers.map((h) => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))
        ).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `${tabName}-${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh data. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
      setIsExportDialogOpen(false);
    }
  };

  const lists = [
    {
      name: "Orderan Fleets",
      value: "orderan-sewa",
    },
    {
      name: "Orderan Produk",
      value: "orderan-produk",
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

  // useEffect hanya untuk search, tidak untuk tab type
  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        type: activeTab, // Gunakan activeTab, bukan defaultTab
        q: searchDebounce || null,
        page: null,
        limit: pageLimit,
      })}`,
    );
  }, [
    searchDebounce,
    activeTab,
    pageLimit,
    pathname,
    createQueryString,
    router,
  ]);

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
          <Button
            onClick={() => setIsExportDialogOpen(true)}
            disabled={isDownloading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Memproses..." : "Unduh Rekap"}
          </Button>
        </div>
      </div>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unduh Rekap</DialogTitle>
            <DialogDescription>Pilih format, rentang tanggal, dan cakupan data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cakupan</label>
                <Select value={exportScope} onValueChange={(v) => setExportScope(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cakupan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Halaman saat ini</SelectItem>
                    <SelectItem value="all">Semua hasil (sesuai filter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rentang Tanggal</label>
              <CalendarDateRangePicker
                dateRange={dateRange}
                onDateRangeChange={(range: any) => setDateRange(range)}
                onClearDate={() => setDateRange({})}
              />
              <p className="text-xs text-muted-foreground">Untuk data sangat besar, gunakan filter tanggal agar proses lebih cepat dan stabil.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>Batal</Button>
            <Button onClick={handleGenerateAndDownload} disabled={isDownloading}>{isDownloading ? "Memproses..." : "Unduh"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <TabsContent value="orderan-produk" className="space-y-4">
        {isFetchingOrderanProduk && <Spinner />}
        {!isFetchingOrderanProduk && orderanProdukData && (
          <RekapPencatatanTable
            columns={columnsProduk}
            data={orderanProdukData.items}
            type="orderan-produk"
            searchKey="customer.name"
            totalUsers={orderanProdukData.meta?.total_items}
            pageCount={Math.ceil(orderanProdukData.meta?.total_items / pageLimit)}
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
            data={inventarisData.data?.data || inventarisData.data?.items || inventarisData.data || []}
            type="inventaris"
            searchKey="assetName"
            totalUsers={inventarisData.data?.total || inventarisData.meta?.total_items || 0}
            pageCount={Math.ceil((inventarisData.data?.total || inventarisData.meta?.total_items || 0) / pageLimit)}
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
