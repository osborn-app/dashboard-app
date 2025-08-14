"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDailyReport } from "@/hooks/api/useInspections";
import {
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface DailyReportData {
  report_date: string;
  total_active_fleets: number;
  monthly_target: number;
  deficit_from_last_month: number;
  inspections_completed_this_month: number;
  remaining_to_meet_target: number;
}

export default function InspectionsDailyReport() {
  const { data: reportData, isLoading, error } = useGetDailyReport();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="grid grid-cols-1 gap-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !reportData?.data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">
            Gagal memuat data laporan harian
          </p>
        </CardContent>
      </Card>
    );
  }

  const data: DailyReportData = reportData.data || {
    report_date: new Date().toISOString().split("T")[0],
    total_active_fleets: 0,
    monthly_target: 0,
    deficit_from_last_month: 0,
    inspections_completed_this_month: 0,
    remaining_to_meet_target: 0,
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString("id-ID", options);
    } catch {
      return dateString;
    }
  };

  const calculateProgress = () => {
    const monthlyTarget = data.monthly_target || 0;
    const completed = data.inspections_completed_this_month || 0;

    if (monthlyTarget === 0) return 0;
    return Math.round((completed / monthlyTarget) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          Laporan Harian -{" "}
          {formatDate(
            data.report_date || new Date().toISOString().split("T")[0],
          )}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-3">
        {/* Total Active Fleets */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-800 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Total Fleet Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {(data.total_active_fleets || 0).toLocaleString()}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Fleet yang tersedia untuk inspeksi
            </p>
          </CardContent>
        </Card>

        {/* Monthly Target */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-purple-800 text-sm font-medium">
              <Target className="h-4 w-4" />
              Target Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {(data.monthly_target || 0).toLocaleString()}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Target inspeksi bulan ini
            </p>
          </CardContent>
        </Card>

        {/* Completed This Month */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-green-800 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Selesai Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {(data.inspections_completed_this_month || 0).toLocaleString()}
            </div>
            <div className="w-full bg-green-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-green-700 mt-1">
              {progress}% dari target (
              {data.inspections_completed_this_month || 0}/
              {data.monthly_target || 0})
            </p>
          </CardContent>
        </Card>

        {/* Remaining to Meet Target */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-800 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Sisa Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {(data.remaining_to_meet_target || 0).toLocaleString()}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Inspeksi yang masih perlu diselesaikan
            </p>
          </CardContent>
        </Card>

        {/* Deficit from Last Month */}
        <Card
          className={`${
            (data.deficit_from_last_month || 0) > 0
              ? "border-red-200 bg-red-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle
              className={`flex items-center gap-2 text-sm font-medium ${
                (data.deficit_from_last_month || 0) > 0
                  ? "text-red-800"
                  : "text-gray-800"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Defisit Bulan Lalu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (data.deficit_from_last_month || 0) > 0
                  ? "text-red-900"
                  : "text-gray-900"
              }`}
            >
              {(data.deficit_from_last_month || 0).toLocaleString()}
            </div>
            <p
              className={`text-xs mt-1 ${
                (data.deficit_from_last_month || 0) > 0
                  ? "text-red-700"
                  : "text-gray-700"
              }`}
            >
              {(data.deficit_from_last_month || 0) > 0
                ? "Target bulan lalu tidak tercapai"
                : "Target bulan lalu tercapai"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
