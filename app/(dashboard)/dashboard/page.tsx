"use client";

import CustomerStatusCard from "@/components/customer-status-card";
import OrderOwnerStatusCard from "@/components/order-owner-card";
import OrderStatusCard from "@/components/order-status-card";
import ReimburseStatusCard from "@/components/reimburse-status-card";
import RequestStatusCard from "@/components/request-status-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Welcome from "@/components/welcome-text";
import { useUser } from "@/context/UserContext";
import { redirect } from "next/navigation";

export default function Page() {
  const { user } = useUser();

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Welcome />
        </div>

        {user?.role !== "driver" && (
          <>
            {user?.role === "admin" && (
              <>
                <h3 className="text-2xl font-bold tracking-tight">
                  Request Task
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <RequestStatusCard />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Order</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <OrderStatusCard />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Customer</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <CustomerStatusCard />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Driver Reimburse
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <ReimburseStatusCard />
                </div>
              </>
            )}
          </>
        )}

        {user?.role === "owner" && (
          <>
            <h3 className="text-2xl font-bold tracking-tight">Pendapatan</h3>

            <OrderOwnerStatusCard />
          </>
        )}
      </div>
    </>
  );
}
