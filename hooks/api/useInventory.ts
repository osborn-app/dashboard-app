import { useQuery } from "@tanstack/react-query";
import { getInventory, getInventoryStatistics } from "@/client/inventoryClient";

export const useGetInventory = (
  params: {
    limit?: number;
    page?: number;
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["inventory", params],
    queryFn: () => getInventory(params),
    enabled: options?.enabled ?? true,
  });
};

export const useGetInventoryStatistics = (
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ["inventory-stats"],
    queryFn: getInventoryStatistics,
    enabled: options?.enabled ?? true,
  });
};
