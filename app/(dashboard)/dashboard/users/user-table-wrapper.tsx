"use client";
import TabLists from "@/components/TabLists";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import { UserColumns } from "@/components/tables/user-tables/columns";
import { UserTable } from "@/components/tables/user-tables/user-table";
import { TabsContent } from "@/components/ui/tabs";
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

  const { data: operationData, isFetching: isFetchingOperation } = useGetUsers(
    {
      role: "operation",
      limit: pageLimit,
      page: page,
      q: searchDebounce,
    },
    {
      enabled: defaultTab === "operation",
    }
  );

  const { data: adminData, isFetching: isFetchingAdmin } = useGetUsers(
    {
      role: "admin",
      limit: pageLimit,
      page: page,
      q: searchDebounce,
    },
    {
      enabled: defaultTab === "admin",
    }
  );

  const { data: financeData, isFetching: isFetchingFinance } = useGetUsers(
    {
      role: "finance",
      limit: pageLimit,
      page: page,
      q: searchDebounce,
    },
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

  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        role: defaultTab,
        q: searchDebounce || null,
        page: null,
        limit: pageLimit,
      })}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDebounce]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TabLists lists={lists} />
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
