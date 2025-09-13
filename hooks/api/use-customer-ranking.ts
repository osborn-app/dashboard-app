import { useQuery } from "@tanstack/react-query";
import { getCustomerRanking } from "@/client/customerClient";

interface CustomerRanking {
  rank: number;
  customer_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  total_transaction_amount: number;
  total_orders: number;
}

interface RankingResponse {
  success: boolean;
  message: string;
  data: CustomerRanking[];
  meta: {
    total_customers: number;
    limit: number;
  };
}

export const useCustomerRanking = (limit: number = 10) => {
  return useQuery<RankingResponse>({
    queryKey: ["customer-ranking", limit],
    queryFn: async () => {
      const response = await getCustomerRanking(limit);
      return response.data;
    },
    staleTime: 0, // No caching - always fresh data
    gcTime: 0, // No garbage collection time
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on component mount
  });
};

export type { CustomerRanking, RankingResponse };
