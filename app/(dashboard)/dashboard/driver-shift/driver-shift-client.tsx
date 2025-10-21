"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TabLists from "@/components/TabLists";
import DriverShiftTableWrapper from "./driver-shift-table-wrapper";
import DriverReportWrapper from "./driver-report-wrapper";

export default function DriverShiftClient() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("status") ?? "shift";

  const tabLists = [
    { name: "Shift Driver", value: "shift" },
    { name: "Laporan Driver", value: "laporan" },
  ];

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
      <Tabs value={activeTab} className="w-full">
        <TabLists lists={tabLists} />
        <TabsContent value="shift" className="mt-4">
          <DriverShiftTableWrapper />
        </TabsContent>
        <TabsContent value="laporan" className="mt-4">
          <DriverReportWrapper />
        </TabsContent>
      </Tabs>
    </div>
  );
}
