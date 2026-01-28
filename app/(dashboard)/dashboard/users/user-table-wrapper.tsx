"use client";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import { UserColumns } from "@/components/tables/user-tables/columns";
import { UserTable } from "@/components/tables/user-tables/user-table";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetUsers } from "@/hooks/api/useUser";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";

const UserTableWrapper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const defaultTab = searchParams.get("role") ?? "operation";
  const q = searchParams.get("q");
  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQuery, 500);

  const operationParams = {
    role: "operation",
    limit: pageLimit,
    page: page,
    q: searchDebounce || undefined,
  };

  const adminParams = {
    role: "admin",
    limit: pageLimit,
    page: page,
    q: searchDebounce || undefined,
  };

  const financeParams = {
    role: "finance",
    limit: pageLimit,
    page: page,
    q: searchDebounce || undefined,
  };

  const { data: operationData, isFetching: isFetchingOperation } = useGetUsers(
    operationParams,
    {
      enabled: defaultTab === "operation",
    }
  );

  const { data: adminData, isFetching: isFetchingAdmin } = useGetUsers(
    adminParams,
    {
      enabled: defaultTab === "admin",
    }
  );

  const { data: financeData, isFetching: isFetchingFinance } = useGetUsers(
    financeParams,
    {
      enabled: defaultTab === "finance",
    }
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
      name: "Operation",
      value: "operation",
    },
    {
      name: "Admin",
      value: "admin",
    },
    {
      name: "Finance",
      value: "finance",
    },
  ];

  // Set initial role in URL if not present
  useEffect(() => {
    if (!searchParams.get("role")) {
      router.replace(
        `${pathname}?${createQueryString({
          role: defaultTab,
          q: searchDebounce || null,
          page: 1,
          limit: pageLimit,
        })}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL when search changes (but keep current role)
  useEffect(() => {
    const currentRole = searchParams.get("role") || defaultTab;
    router.push(
      `${pathname}?${createQueryString({
        role: currentRole,
        q: searchDebounce || null,
        page: null,
        limit: pageLimit,
      })}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDebounce]);

  const handleTabChange = (value: string) => {
    router.push(
      `${pathname}?${createQueryString({
        role: value,
        q: searchDebounce || null,
        page: 1,
        limit: pageLimit,
      })}`,
    );
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TabsList>
          {lists.map((list, index) => (
            <TabsTrigger
              key={index}
              value={list.value}
              onClick={() => handleTabChange(list.value)}
            >
              {list.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Cari User"
          />
        </div>
      </div>
      <TabsContent value="operation" className="space-y-4">
        {isFetchingOperation && <Spinner />}
        {!isFetchingOperation && operationData && (
          <UserTable
            columns={UserColumns}
            data={operationData.items || []}
            searchKey="name"
            totalUsers={operationData.meta?.total_items || 0}
            pageCount={Math.ceil((operationData.meta?.total_items || 0) / pageLimit)}
            pageNo={page}
          />
        )}
      </TabsContent>
      <TabsContent value="admin" className="space-y-4">
        {isFetchingAdmin && <Spinner />}
        {!isFetchingAdmin && adminData && (
          <UserTable
            columns={UserColumns}
            data={adminData.items || []}
            searchKey="name"
            totalUsers={adminData.meta?.total_items || 0}
            pageCount={Math.ceil((adminData.meta?.total_items || 0) / pageLimit)}
            pageNo={page}
          />
        )}
      </TabsContent>
      <TabsContent value="finance" className="space-y-4">
        {isFetchingFinance && <Spinner />}
        {!isFetchingFinance && financeData && (
          <UserTable
            columns={UserColumns}
            data={financeData.items || []}
            searchKey="name"
            totalUsers={financeData.meta?.total_items || 0}
            pageCount={Math.ceil((financeData.meta?.total_items || 0) / pageLimit)}
            pageNo={page}
          />
        )}
      </TabsContent>
    </>
  );
};

export default UserTableWrapper;
