import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";
import { useUser } from "@/context/UserContext";

// Types
export interface OutOfTownRate {
  id: number;
  region_name: string;
  daily_rate: string; // Harga harian (string dari backend)
  description?: string | null; // Deskripsi (ada di response)
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Missing fields that should be added when backend entity is updated
  region_code?: string;
  min_distance_km?: number;
  max_distance_km?: number;
  priority_order?: number;
}

export interface CreateOutOfTownRateData {
  region_name: string;
  daily_rate: number;
  description?: string;
  is_active?: boolean;
  // Missing fields that should be added when backend entity is updated
  region_code?: string;
  min_distance_km?: number;
  max_distance_km?: number;
  priority_order?: number;
}

export interface UpdateOutOfTownRateData {
  region_name?: string;
  daily_rate?: number;
  description?: string;
  is_active?: boolean;
  // Missing fields that should be added when backend entity is updated
  region_code?: string;
  min_distance_km?: number;
  max_distance_km?: number;
  priority_order?: number;
}

export interface OutOfTownRateResponse {
  items: OutOfTownRate[];
  meta: {
    total_items: number;
    item_count: number;
  };
  pagination: {
    current_page: number;
    total_page: number;
    next_page?: number | null;
  };
}

export interface OutOfTownRateStatusCount {
  active: number;
  inactive: number;
  total: number;
}

export interface OutOfTownRateFormData {
  region_name: string;
  daily_rate: number;
  description?: string;
  is_active?: boolean;
}

const baseEndpoint = "/out-of-town-rates";

export const useGetOutOfTownRates = (
  params: any,
  options = {},
  type: string,
  queryKeyPrefix: string = "out-of-town-rates"
) => {
  const axiosAuth = useAxiosAuth();

  const getOutOfTownRates = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, { params });
    return data;
  };

  return useQuery({
    queryKey: [queryKeyPrefix, params, type],
    queryFn: getOutOfTownRates,
    ...options,
  });
};

export const useGetInfinityOutOfTownRates = (query?: string, status?: string) => {
  const { user } = useUser();
  const axiosAuth = useAxiosAuth();

  const getOutOfTownRates = ({
    pageParam = 1,
    query,
    status,
  }: {
    pageParam?: number;
    query?: string;
    status?: string;
  }) => {
    return axiosAuth.get(baseEndpoint, {
      params: {
        limit: 10,
        page: pageParam,
        q: query,
        status: status,
      },
    });
  };

  return useInfiniteQuery({
    queryKey: ["out-of-town-rates", query, status],
    queryFn: ({ pageParam }) => getOutOfTownRates({ pageParam, query, status }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.pagination?.next_page,
    enabled: user?.role === "admin" || user?.role === "superadmin",
  });
};

export const useGetDetailOutOfTownRate = (id: string | number) => {
  const { user } = useUser();
  const axiosAuth = useAxiosAuth();

  const getDetailOutOfTownRate = () => {
    return axiosAuth.get(`${baseEndpoint}/${id}`);
  };

  return useQuery({
    queryKey: ["out-of-town-rates", id],
    queryFn: getDetailOutOfTownRate,
    enabled: (user?.role === "admin" || user?.role === "superadmin") && !!id,
  });
};

export const usePostOutOfTownRate = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  
  const postOutOfTownRate = (body: any) => {
    return axiosAuth.post(baseEndpoint, body);
  };

  return useMutation({
    mutationFn: postOutOfTownRate,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["out-of-town-rates"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["out-of-town-rates"] });
    },
  });
};

export const usePatchOutOfTownRate = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  
  const patchOutOfTownRate = ({ id, body }: { body: any; id: string | number }) => {
    return axiosAuth.patch(`${baseEndpoint}/${id}`, body);
  };

  return useMutation({
    mutationFn: patchOutOfTownRate,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["out-of-town-rates"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["out-of-town-rates"] });
    },
  });
};

export const useDeleteOutOfTownRate = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteOutOfTownRate = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/${id}`);
  };

  return useMutation({
    mutationFn: deleteOutOfTownRate,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["out-of-town-rates"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["out-of-town-rates"] });
    },
  });
};

export const useToggleOutOfTownRateStatus = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const toggleStatus = ({ id, is_active }: { id: number; is_active: boolean }) => {
    // FIXED: Use correct endpoint from backend
    return axiosAuth.patch(`${baseEndpoint}/${id}/toggle-active`, { is_active });
  };

  return useMutation({
    mutationFn: toggleStatus,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["out-of-town-rates"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["out-of-town-rates"] });
    },
  });
};

// REMOVED: This endpoint doesn't exist in backend
// export const useOutOfTownRatesStatusCount = () => { ... }

// NEW: Hook to get active out of town rates only
export const useGetActiveOutOfTownRates = () => {
  const { user } = useUser();
  const axiosAuth = useAxiosAuth();
  
  const getActiveRates = () => {
    return axiosAuth.get(`${baseEndpoint}/active`);
  };
  
  return useQuery({
    queryKey: ["out-of-town-rates", "active"],
    queryFn: getActiveRates,
    enabled: user?.role === "admin" || user?.role === "superadmin",
  });
};

// NEW: Hook to get out of town rate by region name
export const useGetOutOfTownRateByRegion = (regionName: string) => {
  const { user } = useUser();
  const axiosAuth = useAxiosAuth();
  
  const getByRegion = () => {
    return axiosAuth.get(`${baseEndpoint}/by-region/${regionName}`);
  };
  
  return useQuery({
    queryKey: ["out-of-town-rates", "by-region", regionName],
    queryFn: getByRegion,
    enabled: (user?.role === "admin" || user?.role === "superadmin") && !!regionName,
  });
};
