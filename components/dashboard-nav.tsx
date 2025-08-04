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
import { useUser } from "@/context/UserContext";

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
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  
  const toggleDropdown = (title: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const { data: orderStatusCount, isFetching: isFetchingOrderStatus } =
    useOrdersStatusCount();
  const { data: reimburseStatusCount, isFetching: isFetchingReimburseStatus } =
    useReimburseStatusCount();
  const { data: customerStatusCount, isFetching: isFetchingCustomerStatus } =
    useCustomersStatusCount();
  const { data: customerVerificationCount, isFetching: isFetchingVerificationStatus } =
  customerVerificationStatusCount();
  const { user } = useUser();
  const orderCount = orderStatusCount?.data;
  const customerCount = customerStatusCount?.data;
  const reimburseCount = reimburseStatusCount?.data;
  const verificationCount = customerVerificationCount?.data;

  const navItems = useMemo(() => {
    const baseItems = [...items];

    // Avoid adding "Discount" if it already exists in the base items
    const discountExists = baseItems.some((item) => item.title === "Discount");

    if (user?.role === "admin" && !discountExists) {
      baseItems.push({
        title: "Discount",
        href: "/dashboard/discount",
        icon: "discount",
        roles: ["admin"],
      });
    }

    return baseItems;
  }, [items, user]);

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
            child.href && path.startsWith(child.href)
          );

          return (
            isBasePathActive ||
            (item.href !== "/dashboard" && isDetailOrEditPathActive) ||
            isChildActive
          );
        };

        // If item has children (dropdown), render dropdown
        if (item.items && item.items.length > 0) {
          const isDropdownOpen = openDropdowns.has(item.title);
          const ChevronIcon = isDropdownOpen ? Icons.chevronUp : Icons.chevronDown;
          
          return (
            <div key={index}>
              {/* Dropdown Header */}
              <div
                className={cn(
                  "group flex items-center rounded-md p-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  isActive() ? "bg-[#EDEFF3] text-main" : "transparent",
                  item.disabled && "cursor-not-allowed opacity-80",
                )}
                onClick={() => toggleDropdown(item.title)}
              >
                <Icon className="h-4 w-4" />
                {isMobileNav || (!isMinimized && !isMobileNav) ? (
                  <div className="flex justify-between w-full items-center">
                    <span className="ml-2 mr-2 truncate">{item.title}</span>
                    <div className="flex items-center gap-2">
                      {item.title === "Pesanan" && !isFetchingOrderStatus && (
                        <div className="bg-red-500 text-sm font-medium min-w-[24px] h-[24px] text-center flex items-center justify-center rounded-lg text-white">
                          {orderCount?.[0]?.count ?? 0}
                        </div>
                      )}
                      <ChevronIcon className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
              
              {/* Dropdown Items */}
              {isDropdownOpen && (isMobileNav || (!isMinimized && !isMobileNav)) && (
                <div className="ml-6 space-y-1">
                  {item.items.map((subItem, subIndex) => {
                    const SubIcon = Icons[subItem.icon || "arrowRight"];
                    const isSubActive = subItem.href && path.startsWith(subItem.href);
                    
                    return (
                      <Link
                        key={subIndex}
                        href={subItem.href || "#"}
                        onClick={() => {
                          if (setOpen) setOpen(false);
                        }}
                      >
                        <span
                          className={cn(
                            "group flex items-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            isSubActive ? "bg-[#EDEFF3] text-main" : "transparent",
                            subItem.disabled && "cursor-not-allowed opacity-80",
                          )}
                        >
                          <SubIcon className="h-4 w-4" />
                          <span className="ml-2 truncate">{subItem.title}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Regular menu item (no dropdown)
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

                      {item.title === "Customers" &&
                        !isFetchingCustomerStatus && (
                          <div className="bg-red-500 text-sm font-medium min-w-[24px] h-[24px] text-center flex items-center justify-center rounded-lg text-white">
                            {customerCount?.[0]?.count ?? 0}
                          </div>
                        )}
                      {item.title === "Verifikasi Tambahan" &&
                        !isFetchingVerificationStatus && (
                          <div className="bg-red-500 text-sm font-medium min-w-[24px] h-[24px] text-center flex items-center justify-center rounded-lg text-white">
                            {verificationCount?.[0]?.count ?? 0}
                          </div>
                        )}
                      {item.title === "Reimburse" &&
                        !isFetchingReimburseStatus &&
                        user?.role !== "driver" && (
                          <div className="bg-red-500 text-sm font-medium min-w-[24px] h-[24px] text-center flex items-center justify-center rounded-lg text-white">
                            {reimburseCount?.[0]?.count ?? 0}
                          </div>
                        )}
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
