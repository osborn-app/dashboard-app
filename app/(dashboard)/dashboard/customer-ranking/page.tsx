"use client";

import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Trophy, Users, TrendingUp, RefreshCw, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useCustomerRanking, type CustomerRanking } from "@/hooks/api/use-customer-ranking";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerActionModal } from "@/components/modal/customer-action-modal";

const breadcrumbItems = [
  { title: "Dashboard", link: "/dashboard" },
  { title: "Customer Ranking", link: "/dashboard/customer-ranking" }
];

const CrownIcon = ({ rank }: { rank: number }) => {
  const getCrownColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-500";
      case 2: return "text-gray-400";
      case 3: return "text-amber-600";
      default: return "text-gray-300";
    }
  };
  return <Crown className={`h-6 w-6 ${getCrownColor(rank)}`} />;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("id-ID").format(num);
};

export default function CustomerRankingPage() {
  const [limit, setLimit] = useState(20);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRanking | null>(null);
  const { data: response, isLoading, error, refetch } = useCustomerRanking(limit, selectedDate);

  const handleRefresh = () => {
    refetch();
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const clearDateFilter = () => {
    setSelectedDate("");
  };

  const handleCustomerClick = (customer: CustomerRanking) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const rankingData = response?.data || [];
  const loading = isLoading;

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
        2: "bg-gradient-to-r from-gray-300 to-gray-500 text-white",
        3: "bg-gradient-to-r from-amber-500 to-amber-700 text-white",
      };
      return <Badge className={colors[rank as keyof typeof colors]}>#{rank}</Badge>;
    }
    return <Badge variant="secondary">#{rank}</Badge>;
  };

  const getCustomerDisplayName = (customer: CustomerRanking) => {
    if (customer.customer_name) return customer.customer_name;
    if (customer.customer_email) return customer.customer_email;
    if (customer.customer_phone) return customer.customer_phone;
    return "Unknown Customer";
  };

  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <Heading 
          title="Ranking Pelanggan" 
          description={`Top pelanggan berdasarkan total transaksi${selectedDate ? ` (${new Date(selectedDate).toLocaleDateString('id-ID')})` : ''}`}
        />
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Label htmlFor="date-filter" className="text-sm font-medium whitespace-nowrap">
              <Calendar className="h-4 w-4 inline mr-1" />
              Filter Tanggal:
            </Label>
            <div className="relative">
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={today}
                className="w-40 cursor-pointer hover:bg-accent/50 transition-colors"
                placeholder="Pilih tanggal"
                onClick={(e) => {
                  // Ensure the date picker opens when clicking anywhere on the input
                  e.currentTarget.showPicker?.();
                }}
              />
            </div>
            {selectedDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearDateFilter}
                title="Hapus filter tanggal"
              >
                Clear
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {[10, 20, 50].map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                onClick={() => handleLimitChange(val)}
                className={limit === val ? "bg-primary text-primary-foreground" : ""}
              >
                {val}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh data (Auto-refresh every 30s)"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Auto-refresh: 30s
          </div>
        </div>
      </div>
      
      <Separator />

      {/* Info Box - Only show when date filter is active */}
      {selectedDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Informasi Filter Tanggal
              </h4>
              <p className="text-sm text-blue-700">
                Data ranking diambil dari transaksi <strong>7 hari kebelakang</strong> dari tanggal {new Date(selectedDate).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : rankingData.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Customer Pendapatan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : rankingData.length > 0 ? (
                formatCurrency(rankingData[0]?.total_transaction_amount || 0)
              ) : "-"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Pesanan</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : rankingData.length > 0 ? (
                formatNumber(
                  Math.round(
                    rankingData.reduce((sum: number, c: CustomerRanking) => sum + c.total_orders, 0) /
                    rankingData.length
                  )
                )
              ) : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Customer Ranking (Top {limit})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: limit }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {rankingData.map((customer: CustomerRanking, index: number) => (
                <div
                  key={customer.customer_id || index}
                  onClick={() => handleCustomerClick(customer)}
                  className={`flex flex-col sm:flex-row sm:items-center sm:space-x-4 p-4 border rounded-lg transition-all hover:shadow-md gap-2 cursor-pointer hover:bg-accent/50 ${
                    customer.rank <= 3 ? "bg-gradient-to-r from-primary/5 to-primary/10" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center space-x-2">
                    {customer.rank <= 3 ? (
                      <CrownIcon rank={customer.rank} />
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        <span className="text-sm font-semibold">#{customer.rank}</span>
                      </div>
                    )}
                    {getRankBadge(customer.rank)}
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="font-semibold text-lg truncate max-w-[200px] sm:max-w-none">
                        {getCustomerDisplayName(customer)}
                      </h3>
                      {customer.customer_id && (
                        <Badge variant="outline" className="text-xs">
                          ID: {customer.customer_id}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 text-sm text-muted-foreground">
                      {customer.customer_email && <span className="truncate">{customer.customer_email}</span>}
                      {customer.customer_phone && <span>{customer.customer_phone}</span>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-left sm:text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(customer.total_transaction_amount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(customer.total_orders)} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Action Modal */}
      <CustomerActionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={selectedCustomer}
      />
    </div>
  );
}
