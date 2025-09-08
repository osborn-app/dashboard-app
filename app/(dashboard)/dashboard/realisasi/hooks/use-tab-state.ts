"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type TabType = "daftar-akun" | "daftar-rekening" | "transaksi" | "laporan" | "kategori";

export function useTabState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeTab, setActiveTab] = useState<TabType>("daftar-akun");

  // Initialize tab from URL params
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabType;
    if (tabFromUrl && ["daftar-akun", "daftar-rekening", "transaksi", "laporan", "kategori"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    activeTab,
    setActiveTab: handleTabChange
  };
}
