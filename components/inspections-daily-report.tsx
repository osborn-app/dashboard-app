"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useGetDailyReport,
  useTriggerReportUpdate,
} from "@/hooks/api/useInspections";
import {
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DailyReportData {
  report_date: string;
  total_fleets: number;
  monthly_target: number;
  deficit_from_last_month: number;
  inspections_completed_this_month: number;
  remaining_to_meet_target: number;
}

export default function InspectionsDailyReport() {
  const { data: reportData, isLoading, error } = useGetDailyReport();
  const triggerReportMutation = useTriggerReportUpdate();

  const handleTriggerReport = async () => {
    try {
      await triggerReportMutation.mutateAsync();
      toast({
        title: "Berhasil",
        description: "Laporan harian berhasil diperbarui",
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Gagal memperbarui laporan harian",
        variant: "destructive",
      });
    }
  };

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
    total_fleets: 0,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Laporan Harian -{" "}
            {formatDate(
              data.report_date || new Date().toISOString().split("T")[0],
            )}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTriggerReport}
          disabled={triggerReportMutation.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              triggerReportMutation.isPending ? "animate-spin" : ""
            }`}
          />
          {triggerReportMutation.isPending ? "Memperbarui..." : "Perbarui"}
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-3">
        {/* Total Active Fleets */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-black text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Total Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {(data.total_fleets || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Total fleet yang tersedia untuk inspeksi
            </p>
          </CardContent>
        </Card>

        {/* Monthly Target */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-black text-sm font-medium">
              <Target className="h-4 w-4" />
              Target Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {(data.monthly_target || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Target inspeksi bulan ini
            </p>
          </CardContent>
        </Card>

        {/* Completed This Month */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-black text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Selesai Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {(data.inspections_completed_this_month || 0).toLocaleString()}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {progress}% dari target (
              {data.inspections_completed_this_month || 0}/
              {data.monthly_target || 0})
            </p>
          </CardContent>
        </Card>

        {/* Remaining to Meet Target */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-black text-sm font-medium">
              <Clock className="h-4 w-4" />
              Sisa Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {(data.remaining_to_meet_target || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Inspeksi yang masih perlu diselesaikan
            </p>
          </CardContent>
        </Card>

        {/* Deficit from Last Month */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-black text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              Defisit Bulan Lalu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {(data.deficit_from_last_month || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
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
