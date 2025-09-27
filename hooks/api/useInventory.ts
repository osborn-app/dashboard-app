import { useQuery } from "@tanstack/react-query";
import { getInventory, getInventoryStatistics } from "@/client/inventoryClient";

export const useGetInventory = (
  params: {
    limit?: number;
    page?: number;
    q?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    order_by?: string;
    order_column?: string;
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
