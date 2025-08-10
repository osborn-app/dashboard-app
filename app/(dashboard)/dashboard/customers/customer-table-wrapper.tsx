"use client";
import TabLists from "@/components/TabLists";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import {
  PendingColumns,
  VerifiedColumns,
} from "@/components/tables/customer-tables/columns";
import { CustomerTable } from "@/components/tables/customer-tables/customer-table";
import { TabsContent } from "@/components/ui/tabs";
import { useGetCustomers } from "@/hooks/api/useCustomer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CustomerTableWrapper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const defaultTab = searchParams.get("status") ?? "pending";
  const q = searchParams.get("q");
  const role = (searchParams.get("role") || "all") as "all" | "customer" | "product_customer";
  const [roleValue, setRoleValue] = React.useState<typeof role>(role);
  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQuery, 500);

  const roleParam = roleValue === "all" ? undefined : roleValue;

  const { data: pendingData, isFetching: isFetchingPendingData } =
    useGetCustomers(
      {
        limit: pageLimit,
        page: page,
        q: searchDebounce,
        status: "pending",
        role: roleParam,
      },
      {
        enabled: defaultTab === "pending",
      },
      "pending",
    );

  const { data: verifiedData, isFetching: isFetchingVerifiedData } =
    useGetCustomers(
      {
        limit: pageLimit,
        page: page,
        q: searchDebounce,
        status: "verified",
        role: roleParam,
      },
      {
        enabled: defaultTab === "verified",
      },
      "verified",
    );

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const newSearchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [],
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const lists = [
    {
      name: "Pending",
      value: "pending",
    },
    {
      name: "Verified",
      value: "verified",
    },
  ];

  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        q: searchDebounce || null,
        page: null,
        limit: pageLimit,
        role: roleValue === "all" ? null : roleValue,
      })}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDebounce]);

  const handleRoleChange = (val: string) => {
    const nextRole = (val as "all" | "customer" | "product_customer") || "all";
    setRoleValue(nextRole);
    router.push(
      `${pathname}?${createQueryString({
        status: defaultTab,
        q: searchDebounce || null,
        page: 1,
        limit: pageLimit,
        role: nextRole === "all" ? null : nextRole,
      })}`,
    );
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TabLists lists={lists} />
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <Select value={roleValue} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Semua Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="product_customer">Product Customer</SelectItem>
            </SelectContent>
          </Select>
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Cari Customer"
          />
        </div>
      </div>
      <TabsContent value="pending" className="space-y-4">
        {isFetchingPendingData && <Spinner />}
        {!isFetchingPendingData && pendingData && (
          <CustomerTable
            columns={PendingColumns}
            data={pendingData.items}
            searchKey="name"
            totalUsers={pendingData.meta?.total_items}
            pageCount={Math.ceil(pendingData.meta?.total_items / pageLimit)}
            pageNo={page}
          />
        )}
      </TabsContent>
      <TabsContent value="verified" className="space-y-4">
        {isFetchingVerifiedData && <Spinner />}
        {!isFetchingVerifiedData && verifiedData && (
          <CustomerTable
            columns={VerifiedColumns}
            data={verifiedData.items}
            searchKey="name"
            totalUsers={verifiedData.meta?.total_items}
            pageCount={Math.ceil(verifiedData.meta?.total_items / pageLimit)}
            pageNo={page}
          />
        )}
      </TabsContent>
    </>
  );
};

export default CustomerTableWrapper;
