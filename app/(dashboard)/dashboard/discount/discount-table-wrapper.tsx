"use client";
import Spinner from "@/components/spinner";
import { DiscountTable } from "@/components/tables/discount-tables/discount-table";
import { completedColumns } from "@/components/tables/discount-tables/collumn";
import { useGetInfinityDiscount } from "@/hooks/api/useDiscount";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useDebounce } from "use-debounce";

const DiscountTableWrapper = () => {

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const q = searchParams.get("q");

  const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
  const [searchDebounce] = useDebounce(searchQuery, 500);

  const {
    data: response,
    isFetching: isFetchingData,
    error
  } = useGetInfinityDiscount()

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const newSearchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [],
  );

  return (
    <>
      {isFetchingData && <Spinner />}
      {!isFetchingData && response?.data && (
        <DiscountTable
          columns={completedColumns}
          data={response.data.items || []}
          searchKey="discount"
          totalUsers={response.data.meta?.total_items || 0}
          pageCount={Math.ceil((response.data.meta?.total_items || 0) / limit)}
          pageNo={page}
          searchQuery={searchQuery}
        />
      )}
    </>
  );
};

export default DiscountTableWrapper;
