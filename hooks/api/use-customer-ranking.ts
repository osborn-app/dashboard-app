import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

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

export const useCustomerRanking = (limit: number = 10, date?: string) => {
  const axiosAuth = useAxiosAuth();

  return useQuery<RankingResponse>({
    queryKey: ["customer-ranking", limit, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (date) {
        params.append('this_week', date);
      }
      
      const response = await axiosAuth.get(`/customers/ranking/transaction-amount?${params.toString()}`);
      return response.data;
    },
    staleTime: 0, // No caching - always fresh data
    gcTime: 0, // No garbage collection time
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on component mount
  });
};

export type { CustomerRanking, RankingResponse };
