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

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // Get current data based on active tab
      let currentData: any[] = [];
      let tabName = "";

      switch (activeTab) {
        case "orderan-sewa":
          currentData = orderanSewaData?.items || [];
          tabName = "Orderan Fleets";
          break;
        case "orderan-produk":
          currentData = orderanProdukData?.items || [];
          tabName = "Orderan Produk";
          break;
        case "reimburse":
          currentData = reimburseData?.items || [];
          tabName = "Reimburse";
          break;
        case "inventaris":
          currentData = inventarisData?.items || [];
          tabName = "Inventaris";
          break;
        case "lainnya":
          currentData = lainnyaData?.items || [];
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

      // Convert data to CSV format
      let csvContent = "";

      // Add headers based on tab type
      if (activeTab === "orderan-sewa") {
        csvContent =
          "No,Nama Customer,Armada,Tanggal Sewa,Harga Unit,Durasi Penyewaan,Harga Total Unit,Layanan Driver,Layanan Antar Jemput,Layanan Luar Kota,Charge Weekend,Layanan Add-Ons,Harga Layanan Tambahan,Total Harga Keseluruhan,No Invoice,Status\n";
        currentData.forEach((item, index) => {
          csvContent += `${index + 1},"${item.customer?.name || "-"}","${
            item.fleet?.name || "-"
          }","${item.start_date || "-"}","${item.fleet?.price || "-"}","${
            item.duration || "-"
          }","${item.total_price || "-"}","${item.driver_price || "-"}","${
            item.pickup_price || "-"
          }","${item.out_of_town_price || "-"}","${
            item.weekend_price || "-"
          }","${item.addons_price || "-"}","${item.total_price || "-"}","${
            item.total_price || "-"
          }","${item.invoice_number || "-"}","${item.payment_status || "-"}"\n`;
        });
      } else if (activeTab === "reimburse") {
        csvContent =
          "No,Nama Driver,Total,No Rekening,Tanggal,Nama Bank,Kebutuhan,Status\n";
        currentData.forEach((item, index) => {
          csvContent += `${index + 1},"${item.driver?.name || "-"}","${
            item.nominal || "-"
          }","${item.noRekening || "-"}","${item.date || "-"}","${
            item.bank || "-"
          }","${item.description || "-"}","${item.status || "-"}"\n`;
        });
      } else if (activeTab === "inventaris") {
        csvContent = "No,Nama Aset,Jumlah,Harga Satuan,Total Harga,Tanggal\n";
        currentData.forEach((item, index) => {
          csvContent += `${index + 1},"${item.name || "-"}","${
            item.quantity || "-"
          }","${item.unit_price || "-"}","${item.total || "-"}","${
            item.date || "-"
          }"\n`;
        });
      } else if (activeTab === "lainnya") {
        csvContent = "No,Nama Transaksi,Kategori,Total,Tanggal,Keterangan\n";
        currentData.forEach((item, index) => {
          csvContent += `${index + 1},"${item.name || "-"}","${
            item.category || "-"
          }","${item.nominal || "-"}","${item.date || "-"}","${
            item.description || "-"
          }"\n`;
        });
      } else if (activeTab === "orderan-produk") {
        csvContent =
          "No,Nama Customer,Produk,Kategori,Tanggal Sewa,Harga Produk,Durasi Penyewaan,Total Harga Unit,Diskon (%),Total Potongan Diskon,Layanan Antar Jemput,Layanan Lainnya,Layanan Add-Ons,Total Harga Keseluruhan,No Invoice,Status\n";
        currentData.forEach((item, index) => {
          const statusLabel = item.status === "accepted" ? "Lunas" : (item.status || "-");
          csvContent += `${index + 1},"${item.customer?.name || "-"}","${
            item.product?.name || item.fleet?.name || "-"
          }","${
            item.product?.category_label || item.product?.category || item.category?.name || item.category || "-"
          }","${
            item.start_date || "-"
          }","${
            item.product?.price ?? "-"
          }","${
            item.duration ?? "-"
          }","${
            (item.price_calculation?.total_rent_price ?? item.sub_total_price ?? "-")
          }","${
            (item.price_calculation?.discount_percentage ?? item.discount ?? 0)
          }","${
            (item.price_calculation?.discount ?? item.discount_amount ?? 0)
          }","${
            (item.price_calculation?.total_weekend_price ?? item.weekend_price ?? 0)
          }","${
            (item.price_calculation?.addons_price ?? item.addons_price ?? 0)
          }","${
            (item.price_calculation?.addons_price ?? item.addons_price ?? 0)
          }","${
            (item.price_calculation?.grand_total ?? item.total_price ?? "-")
          }","${
            item.invoice_number || "-"
          }","${
            statusLabel
          }"\n`;
        });
      }

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh data. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
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
            onClick={handleDownload}
            disabled={isDownloading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Mengunduh..." : "Unduh CSV"}
          </Button>
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
