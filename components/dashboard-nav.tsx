"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types";
import { Dispatch, SetStateAction } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import { ChevronFirst, ChevronLast } from "lucide-react";
import { useOrdersStatusCount } from "@/hooks/api/useOrder";
import { useReimburseStatusCount } from "@/hooks/api/useReimburse";
import { customerVerificationStatusCount, useCustomersStatusCount } from "@/hooks/api/useCustomer";
import { useProductOrdersStatusCount } from "@/hooks/api/useProductOrder";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false,
}: DashboardNavProps) {
  const path = usePathname();
  const { isMinimized, toggle } = useSidebar();
  // Sidebar groups are always expanded; no dropdown state

  const orderStatusResult: any = useOrdersStatusCount();
  const orderStatusCount: any = orderStatusResult.data;
  const isFetchingOrderStatus: boolean = orderStatusResult.isFetching;
  const { data: reimburseStatusCount, isFetching: isFetchingReimburseStatus } =
    useReimburseStatusCount();
  const { data: customerStatusCount, isFetching: isFetchingCustomerStatus } =
    useCustomersStatusCount();
  const { data: customerVerificationCount, isFetching: isFetchingVerificationStatus } =
  customerVerificationStatusCount();
  const { data: productOrderStatusCount, isFetching: isFetchingProductOrderStatus } =
    useProductOrdersStatusCount();
  const orderCount = orderStatusCount?.data;
  const customerCount = customerStatusCount?.data;
  const reimburseCount = reimburseStatusCount?.data;
  const verificationCount = customerVerificationCount?.data;
  const productOrderCount = productOrderStatusCount?.data;



  const navItems = useMemo(() => {
    return [...items];
  }, [items]);

  if (!navItems?.length) {
    return null;
  }

  return (
  <nav className="flex flex-col h-screen">
    {/* HEADER: Judul dan tombol toggle */}
    <div className="flex justify-between items-center rounded-md text-sm font-medium p-3">
      {isMobileNav || (!isMinimized && !isMobileNav) ? (
        <span className="mr-2 truncate font-semibold text-lg">Menu</span>
      ) : (
        ""
      )}
      <div
        className="border border-neutral-200 p-3 bg-neutral-50 rounded-md"
        onClick={toggle}
      >
        {isMinimized ? (
          <ChevronLast className="h-4 w-4" />
        ) : (
          <ChevronFirst className="h-4 w-4" />
        )}
      </div>
    </div>

    <div className="overflow-y-auto pr-2 flex-1">
      <div className="grid items-start gap-2 pb-10">
        {navItems.map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"];
          const isActive = () => {
            const basePaths = [
              "/dashboard",
              "/dashboard/calendar",
              "/dashboard/orders",
              "/dashboard/product-orders",
              "/dashboard/requests",
              "/dashboard/fleets",
              "/dashboard/reimburse",
              "/dashboard/customers",
              "/dashboard/drivers",
              "/dashboard/location",
              "/dashboard/owners",
              "/dashboard/recap",
            ];

          if (item.href === "/dashboard") {
            return path === "/dashboard";
          }

          const isBasePathActive =
            basePaths.includes(item.href as string) &&
            path.startsWith(item.href as string);
          const isDetailOrEditPathActive = path.match(
            /^\/dashboard\/\d+\/(preview|edit|detail)$/,
          );

          // Check if any child item is active
          const isChildActive = item.items?.some(child => 
            child.href && (
              child.href === "/dashboard"
                ? path === "/dashboard"
                : path.startsWith(child.href)
            )
          );

          return (
            isBasePathActive ||
            (item.href !== "/dashboard" && isDetailOrEditPathActive) ||
            isChildActive
          );
        };

        // If item has children (group), render header and always-visible children
        if (item.items && item.items.length > 0) {
          return (
            <div key={index}>
              {/* Group Header (non-clickable) */}
              <div
                className={cn(
                  "group flex items-center rounded-md p-3 text-sm font-medium text-main",
                  item.disabled && "cursor-not-allowed opacity-80",
                )}
              >
                <Icon className="h-4 w-4" />
                {isMobileNav || (!isMinimized && !isMobileNav) ? (
                  <div className="flex justify-between w-full items-center">
                    <span className="ml-2 mr-2 truncate">{item.title}</span>
                                         <div className="flex items-center gap-2">
                     </div>
                  </div>
                ) : (
                  ""
                )}
              </div>

              {/* Group Items (always visible when sidebar has width to show text) */}
              {(isMobileNav || (!isMinimized && !isMobileNav)) && (
                <div className="ml-6 space-y-1">
                  {item.items.map((subItem, subIndex) => {
                    const SubIcon = Icons[subItem.icon || "arrowRight"];
                    // Special handling for /dashboard to only match exact path
                    const isSubActive = subItem.href && (
                      subItem.href === "/dashboard" 
                        ? path === "/dashboard"
                        : path.startsWith(subItem.href)
                    );

                    return (
                      <Link
                        key={subIndex}
                        href={subItem.href || "#"}
                        onClick={() => {
                          if (setOpen) setOpen(false);
                        }}
                      >
                        <div
                          className={cn(
                            "group flex items-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            isSubActive ? "bg-[#EDEFF3] text-main" : "transparent",
                            subItem.disabled && "cursor-not-allowed opacity-80",
                          )}
                        >
                          <SubIcon className="h-4 w-4" />
                          <div className="flex justify-between w-full items-center">
                            <span className="ml-2 truncate">{subItem.title}</span>
                            <div className="flex items-center gap-2">
                              {subItem.title === "Pesanan Kendaraan" && !isFetchingOrderStatus && (
                                <div className="bg-red-500 text-sm font-medium min-w-[24px] h-[24px] text-center flex items-center justify-center rounded-lg text-white">
                                  {orderCount?.[0]?.count ?? 0}
                                </div>
                              )}
                              {subItem.title === "Pesanan Produk" && !isFetchingProductOrderStatus && (
                                <div className="bg-red-500 text-sm font-medium min-w-[24px] h-[24px] text-center flex items-center justify-center rounded-lg text-white">
                                  {productOrderCount?.[0]?.count ?? 0}
                                </div>
                              )}
                              {subItem.title === "Customers" && !isFetchingCustomerStatus && (
                                <div className="bg-red-500 text-sm font-medium min-w-[24px] h-[24px] text-center flex items-center justify-center rounded-lg text-white">
                                  {customerCount?.[0]?.count ?? 0}
                                </div>
                              )}
                              {subItem.title === "Verifikasi Tambahan" && !isFetchingVerificationStatus && (
                                <div className="bg-red-500 text-sm font-medium min-w-[24px] h-[24px] text-center flex items-center justify-center rounded-lg text-white">
                                  {verificationCount?.[0]?.count ?? 0}
                                </div>
                              )}
                              {subItem.title === "Reimburse" && !isFetchingReimburseStatus && (
                                <div className="bg-red-500 text-sm font-medium min-w-[24px] h-[24px] text-center flex items-center justify-center rounded-lg text-white">
                                  {reimburseCount?.[0]?.count ?? 0}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Regular menu item (no group)
        return (
          item.href && (
            <Link
              key={index}
              href={
                path.replace("dashboard/", "").includes(item.href)
                  ? ""
                  : item.href
              }
              onClick={() => {
                if (setOpen) setOpen(false);
              }}
            >
              <span
                className={cn(
                  "group flex items-center rounded-md p-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive() ? "bg-[#EDEFF3] text-main" : "transparent",
                  item.disabled && "cursor-not-allowed opacity-80",
                )}
                >

                  <Icon className="h-4 w-4" />
                  {isMobileNav || (!isMinimized && !isMobileNav) ? (
                    <div className="flex justify-between w-full">
                      <span className="ml-2 mr-2 truncate">{item.title}</span>
                    </div>
                  ) : (
                    ""
                  )}
                </span>
              </Link>
            )
          );
        })}
      </div>
      <div className="h-32" />
    </div>
  </nav>
);

}
