"use client";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";
import { createColumns } from "@/components/tables/OutofTownRates-tables/columns";
import { OutOfTownRatesTable } from "@/components/tables/OutofTownRates-tables/out-of-town-rates-table";
import { useGetOutOfTownRates } from "@/hooks/api/useOutOfTownRates";
import { OutOfTownRate } from "@/hooks/api/useOutOfTownRates";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { CreateEditModal } from "./components/create-edit-modal";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const OutOfTownRatesTableWrapper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const pageLimit = Number(searchParams.get("limit")) || 10;
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  
  const [searchQuery, setSearchQuery] = useState<string>(q ?? "");
  const [statusFilter, setStatusFilter] = useState<string>(status ?? "all");
  const [searchDebounce] = useDebounce(searchQuery, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<OutOfTownRate | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const { data: allData, isFetching: isFetchingAllData } = useGetOutOfTownRates(
    {
      limit: pageLimit,
      page: page,
      q: searchDebounce,
      is_active: statusFilter === "all" ? undefined : statusFilter === "active",
    },
    {},
    "all",
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

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleEdit = (data: OutOfTownRate) => {
    setEditingData(data);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingData(null);
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
    setIsEdit(false);
  };


  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        q: searchDebounce || null,
        status: statusFilter === "all" ? null : statusFilter,
        page: null,
        limit: pageLimit,
      })}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDebounce, statusFilter]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <SearchInput
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder="Cari tarif luar kota"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleCreate}
          className={cn(buttonVariants({ variant: "main" }), "w-full sm:w-auto")}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Tarif
        </Button>
      </div>
      
      <div className="space-y-4">
        {isFetchingAllData && <Spinner />}
        {!isFetchingAllData && allData && (
          <OutOfTownRatesTable
            columns={createColumns({ onEdit: handleEdit })}
            data={allData.items || []}
            searchKey="region_name"
            totalItems={allData.meta?.total_items || 0}
            pageCount={allData.pagination?.total_page || 1}
            pageNo={page}
          />
        )}
      </div>

      <CreateEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        data={editingData}
        isEdit={isEdit}
      />
    </>
  );
};

export default OutOfTownRatesTableWrapper;
