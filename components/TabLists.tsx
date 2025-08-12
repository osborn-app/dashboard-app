"use client";
import React from "react";
import { TabsList, TabsTrigger } from "./ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface ListProps {
  name: string;
  value: string;
}

interface TabListsProps {
  lists: ListProps[];
}

const TabLists: React.FC<TabListsProps> = ({ lists }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      params.set('page', '1'); // Reset to first page when changing status
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
            queryClient.invalidateQueries({ queryKey: ["orders", "product"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            router.push(
              pathname + "?" + createQueryString("status", list.value),
            );
          }}
        >
          {list.name}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default TabLists;
