"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type TabType = "daftar-akun" | "daftar-rekening" | "transaksi" | "laporan" | "kategori";

export function useTabState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeTab, setActiveTab] = useState<TabType>("daftar-akun");
  const [refetchCallbacks, setRefetchCallbacks] = useState<Record<TabType, () => void>>({} as Record<TabType, () => void>);

  // Register refetch callback for each tab
  const registerRefetchCallback = useCallback((tab: TabType, callback: () => void) => {
    setRefetchCallbacks(prev => ({
      ...prev,
      [tab]: callback
    }));
  }, []);

  // Initialize tab from URL params
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabType;
    if (tabFromUrl && ["daftar-akun", "daftar-rekening", "transaksi", "laporan", "kategori"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes and trigger refetch
  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Trigger refetch for the new tab
    if (refetchCallbacks[newTab]) {
      console.log(`Refetching data for tab: ${newTab}`);
      refetchCallbacks[newTab]();
    }
  };

  return {
    activeTab,
    setActiveTab: handleTabChange,
    registerRefetchCallback
  };
}
