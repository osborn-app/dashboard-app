"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import DriverShiftTableWrapper from "./driver-shift-table-wrapper";
import DriverReportWrapper from "./driver-report-wrapper";

export default function DriverShiftClient() {
  const [activeTab, setActiveTab] = useState<"shift" | "laporan">("shift");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Driver Shift</h2>
          <p className="text-muted-foreground">
            Kelola jadwal shift driver dan lihat laporan performa
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-4 border-b">
        <button
          onClick={() => setActiveTab("shift")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "shift"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Shift Driver
        </button>
        <button
          onClick={() => setActiveTab("laporan")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "laporan"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Laporan Driver
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "shift" ? (
        <DriverShiftTableWrapper />
      ) : (
        <DriverReportWrapper />
      )}
    </div>
  );
}
