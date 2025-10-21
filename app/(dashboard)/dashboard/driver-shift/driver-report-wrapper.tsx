"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { DriverReportDataTable, createDriverReportColumns } from "@/components/tables/driver-report-tables";
import { dummyDriverReports, DriverReport } from "./dummy-data";

export default function DriverReportWrapper() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data berdasarkan search term
  const filteredData = useMemo(() => {
    let filtered = dummyDriverReports;
    
    // Filter berdasarkan search term
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.namaDriver.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchTerm]);

  const columns = createDriverReportColumns();

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Cari driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
        </div>
      </div>

      {/* Data Table */}
      <DriverReportDataTable
        columns={columns}
        data={filteredData}
      />
    </div>
  );
}