"use client";

import React, { useEffect } from "react";
import Reports from "../reports";
import { ReportsSkeleton, FadeInWrapper, LoadingSpinner } from "../ui/skeleton-loading";
import { TabType } from "../../hooks/use-tab-state";

interface LaporanTabProps {
  registerRefetchCallback: (tab: TabType, callback: () => void) => void;
}

export default function LaporanTab({ registerRefetchCallback }: LaporanTabProps) {
  // Placeholder refetch function for reports
  const refetchReports = () => {
    console.log("Refetching reports data...");
    // Add actual refetch logic here when reports API is implemented
  };

  // Register refetch callback for this tab
  useEffect(() => {
    registerRefetchCallback("laporan", refetchReports);
  }, [registerRefetchCallback]);

  return (
    <div className="space-y-4">
      <FadeInWrapper>
        <Reports />
      </FadeInWrapper>
    </div>
  );
}
