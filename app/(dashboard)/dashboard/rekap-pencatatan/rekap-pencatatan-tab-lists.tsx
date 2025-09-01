"use client";
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface ListProps {
  name: string;
  value: string;
}

interface RekapPencatatanTabListsProps {
  lists: ListProps[];
}

const RekapPencatatanTabLists: React.FC<RekapPencatatanTabListsProps> = ({
  lists,
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      params.set("page", "1"); // Reset to first page when changing type
      return params.toString();
    },
    [searchParams],
  );

  return (
    <TabsList>
      {lists.map((list, index) => (
        <TabsTrigger
          key={index}
          value={list.value}
          onClick={() => {
            // Invalidate queries to trigger data re-fetch when tab changes
            queryClient.invalidateQueries({ queryKey: ["rekap-pencatatan"] });
            router.push(pathname + "?" + createQueryString("type", list.value));
          }}
        >
          {list.name}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default RekapPencatatanTabLists;
