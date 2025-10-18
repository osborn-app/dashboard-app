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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatRupiah } from "@/lib/utils";
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
      // Validate date range (if both selected)
      if (dateRange?.from && dateRange?.to && dateRange.to < dateRange.from) {
        alert("Tanggal akhir harus setelah atau sama dengan tanggal mulai.");
        return;
      }

      // Build params with date filters (backend expects startDate/endDate, both required)
      const dateParams: Record<string, any> = {};
      const fromStr = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
      const toStr = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;
      if (fromStr && toStr) {
        dateParams.startDate = fromStr;
        dateParams.endDate = toStr;
      } else if (fromStr && !toStr) {
        // Single-day filter
        dateParams.startDate = fromStr;
        dateParams.endDate = fromStr;
      } else if (!fromStr && toStr) {
        // Single-day filter
        dateParams.startDate = toStr;
        dateParams.endDate = toStr;
      }

      // Simplified: Single API call per tab leveraging backend calculations and filters
      const getExportData = async (tab: string) => {
        const params: any = {
          limit: exportScope === "all" ? 999999 : pageLimit,
          page: exportScope === "all" ? 1 : page,
          q: searchDebounce,
          ...dateParams,
        };

        // Request backend to include price calculation for orders tabs
        if (tab === "orderan-sewa" || tab === "orderan-produk") {
          params.include_price_calculation = true;
        }

        let endpoint = "";
        switch (tab) {
          case "orderan-sewa":
            endpoint = "/rekap-transaksi/orderan-sewa";
            break;
          case "orderan-produk":
            endpoint = "/rekap-transaksi/produk";
            break;
          case "reimburse":
            endpoint = "/rekap-transaksi/reimburse";
            break;
          case "inventaris":
            endpoint = "/inventory";
            params.status = "verified";
            break;
          case "lainnya":
            endpoint = "/rekap-transaksi/lainnya";
            break;
        }

        const res = await axiosAuth.get(endpoint, { params });
        return res.data;
      };

      // Fetch once for the active tab
      let currentData: any[] = [];
      let tabName = "";
      const response = await getExportData(activeTab);

      // Extract items from response (handle different shapes)
      if (activeTab === "inventaris") {
        currentData = response?.data?.data || response?.data?.items || response?.data || [];
      } else {
        currentData = response?.items || [];
      }

      // Set export sheet name
      switch (activeTab) {
        case "orderan-sewa":
          tabName = "Orderan Fleets";
          break;
        case "orderan-produk":
          tabName = "Orderan Produk";
          break;
        case "reimburse":
          tabName = "Reimburse";
          break;
        case "inventaris":
          tabName = "Inventaris";
          break;
        case "lainnya":
          tabName = "Lainnya";
          break;
        default:
          tabName = "Rekap Pencatatan";
      }

      if (currentData.length === 0) {
        alert("Tidak ada data untuk diunduh");
        return;
      }

      // Build rows according to tab and format (no detail fetching needed)
      let rows: any[] = [];
      if (activeTab === "orderan-sewa") {
        rows = currentData.map((data: any, index: number) => {
          const discount = data.price_calculation?.discount_percentage ?? 0;
          const additionalServicesTotal = Array.isArray(data.additional_services)
            ? data.additional_services.reduce((sum: number, item: any) => sum + (Number(item?.price) || 0), 0)
            : 0;
          const startDate = data.start_date ? format(new Date(data.start_date), "EEEE, dd MMMM yyyy HH:mm", { locale: id }) : "-";
          return {
            No: index + 1,
            "Nama Customer": data.customer?.name || "-",
            Armada: data.fleet?.name || "-",
            "Tanggal Sewa": startDate,
            "Harga Unit": formatRupiah(data.price_calculation?.rent_price ?? 0),
            "Durasi Penyewaan": data.duration ?? 0,
            "Total Harga Unit": formatRupiah(data.price_calculation?.total_rent_price ?? 0),
            "Discount (%)": discount, //redeploy
            "Total Potongan Diskon Unit": formatRupiah(data.price_calculation?.discount ?? 0),
            "Total Harga Setelah Diskon": formatRupiah((data.price_calculation?.total_rent_price ?? 0) - (data.price_calculation?.discount ?? 0)),
            "Charge Weekend": formatRupiah(data.price_calculation?.total_weekend_price ?? 0),
            "Layanan Antar Jemput": formatRupiah(data.price_calculation?.service_price ?? 0),
            "Layanan Luar Kota": formatRupiah(data.price_calculation?.out_of_town_price ?? 0),
            "Layanan Driver": formatRupiah(data.price_calculation?.total_driver_price ?? 0),
            "Layanan Asuransi": formatRupiah(data.price_calculation?.insurance_price ?? 0),
            "Layanan Add-Ons": formatRupiah(data.addons_price ?? 0),
            "Layanan Lainnya": formatRupiah(additionalServicesTotal),
            "Total Harga Keseluruhan": formatRupiah(data.price_calculation?.grand_total ?? 0),
            "No Invoice": data.invoice_number || "-",
            Status: data.status === "accepted" ? "Lunas" : (data.status ?? "-"),
          };
        });
      } else if (activeTab === "orderan-produk") {
        rows = currentData.map((data: any, index: number) => {
          const discountPercentage = (data.price_calculation?.discount_percentage ?? data.discount ?? 0) as number;
          const additionalServicesTotal = Array.isArray(data.additional_services)
            ? data.additional_services.reduce((sum: number, item: any) => sum + (Number(item?.price) || 0), 0)
            : 0;
          const displayStatus = data.status === "accepted" ? "Lunas" : (data.status || "-");
          const startDate = data.start_date ? format(new Date(data.start_date), "EEEE, dd MMMM yyyy HH:mm", { locale: id }) : "-";
          return {
            No: index + 1,
            Pelanggan: data.customer?.name || "-",
            Produk: data.product?.name || data.fleet?.name || "-",
            Kategori: data.product?.category_label || data.product?.category || "-",
            "Tanggal Sewa": startDate,
            "Harga Produk": formatRupiah(data.product?.price ?? 0),
            "Durasi Penyewaan": data.duration ?? 0,
            "Total Harga Unit": formatRupiah(data.price_calculation?.total_rent_price ?? data.sub_total_price ?? 0),
            "Diskon (%)": discountPercentage,
            "Total Potongan Diskon": formatRupiah(data.price_calculation?.discount ?? data.discount_amount ?? 0),
            "Total Harga Setelah Diskon": formatRupiah(((data.price_calculation?.total_rent_price ?? data.sub_total_price ?? 0) - (data.price_calculation?.discount ?? data.discount_amount ?? 0))),
            "Layanan Antar Jemput": formatRupiah(data.price_calculation?.total_weekend_price ?? data.weekend_price ?? 0),
            "Layanan Lainnya": formatRupiah(additionalServicesTotal),
            "Layanan Add-Ons": formatRupiah(data.price_calculation?.addons_price ?? data.addons_price ?? 0),
            "Total Harga Keseluruhan": formatRupiah(data.price_calculation?.grand_total ?? 0),
            "No Invoice": data.invoice_number || "-",
            Status: displayStatus,
          };
        });
      } else if (activeTab === "reimburse") {
        rows = currentData.map((item: any, index: number) => {
          const date = item.date ? format(new Date(item.date), "EEEE, dd MMMM yyyy HH:mm", { locale: id }) : "-";
          return {
            No: index + 1,
            "Nama Driver": item.driver?.name || "-",
            Total: formatRupiah(item.nominal || 0),
            "No Rekening": item.noRekening || "-",
            Tanggal: date,
            "Nama Bank": item.bank || "-",
            Kebutuhan: item.description || "-",
            Status: item.status || "-",
          };
        });
      } else if (activeTab === "inventaris") {
        rows = currentData.map((item: any, index: number) => {
          const date = item.purchaseDate || item.date ? format(new Date(item.purchaseDate || item.date), "EEEE, dd MMMM yyyy HH:mm", { locale: id }) : "-";
          return {
            No: index + 1,
            "Nama Aset": item.assetName || item.name || "-",
            Jumlah: item.quantity || 0,
            "Harga Satuan": formatRupiah(item.unitPrice ?? item.unit_price ?? 0),
            "Total Harga": formatRupiah(item.totalPrice ?? item.total ?? 0),
            Tanggal: date,
          };
        });
      } else if (activeTab === "lainnya") {
        rows = currentData.map((item: any, index: number) => {
          const date = item.date ? format(new Date(item.date), "EEEE, dd MMMM yyyy HH:mm", { locale: id }) : "-";
          return {
            No: index + 1,
            "Nama Transaksi": item.name || "-",
            Kategori: item.category || "-",
            Total: formatRupiah(item.nominal ?? 0),
            Tanggal: date,
            Keterangan: item.description || "-",
          };
        });
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Dari tanggal</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal relative"
                      >
                        {dateRange?.from ? (
                          format(dateRange.from, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <div className="absolute right-0 pr-2">
                          {dateRange?.from ? (
                            <X
                              className="h-4 w-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDateRange({ ...dateRange, from: undefined });
                              }}
                            />
                          ) : (
                            <CalendarIcon className="h-4 w-4" />
                          )}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.from}
                        onSelect={(d) => setDateRange({ ...dateRange, from: d || undefined })}
                        initialFocus
                        disabled={dateRange?.to ? { after: dateRange.to } : undefined}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Hingga tanggal</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal relative"
                      >
                        {dateRange?.to ? (
                          format(dateRange.to, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <div className="absolute right-0 pr-2">
                          {dateRange?.to ? (
                            <X
                              className="h-4 w-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDateRange({ ...dateRange, to: undefined });
                              }}
                            />
                          ) : (
                            <CalendarIcon className="h-4 w-4" />
                          )}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.to}
                        onSelect={(d) => setDateRange({ ...dateRange, to: d || undefined })}
                        initialFocus
                        disabled={dateRange?.from ? { before: dateRange.from } : undefined}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
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
