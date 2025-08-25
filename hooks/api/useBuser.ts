import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";
import { Buser } from "@/components/tables/buser-tables/columns";

export const useGetBuser = (
  params: any,
  options = {},
  queryKeyPrefix: string = "buser",
) => {
  const getBuser = async () => {
    // Pastikan params.status dikirim ke getBussersByStatus
    const response = await import("@/client/busserClient").then((mod) =>
      mod.getBussersByStatus(params.status, params),
    );
    return response.data;
  };

  return useQuery({
    queryKey: [queryKeyPrefix, params.status, params],
    queryFn: getBuser,
    ...options,
  });
};

export const useGetDetailBuser = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const getDetailBuser = () => {
    return axiosAuth.get(`/busser/${id}`);
  };
  return useQuery({
    queryKey: ["buser", id],
    queryFn: getDetailBuser,
  });
};

// Custom hook to invalidate all buser queries
export const useInvalidateBuserQueries = () => {
  const queryClient = useQueryClient();

  const invalidateBuserQueries = () => {
    // Invalidate all buser queries with different prefixes
    queryClient.invalidateQueries({ queryKey: ["buser"] });
    queryClient.invalidateQueries({ queryKey: ["peringatan"] });
    queryClient.invalidateQueries({ queryKey: ["butuh_tindakan"] });
    queryClient.invalidateQueries({ queryKey: ["urgent"] });
    queryClient.invalidateQueries({ queryKey: ["tindak_lanjut"] });
    queryClient.invalidateQueries({ queryKey: ["selesai"] });

    // Also invalidate by status pattern
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "buser" ||
        query.queryKey[0] === "peringatan" ||
        query.queryKey[0] === "butuh_tindakan" ||
        query.queryKey[0] === "urgent" ||
        query.queryKey[0] === "tindak_lanjut" ||
        query.queryKey[0] === "selesai",
    });
  };

  return invalidateBuserQueries;
};

// Tambahkan custom hook untuk fetch semua buser dari semua status sekaligus
import { useEffect, useState } from "react";

const BUSSER_STATUSES = [
  "peringatan",
  "butuh_tindakan",
  "urgent",
  "tindak_lanjut",
  "selesai",
];

export const useGetAllBuser = (params = {}) => {
  const [allBuser, setAllBuser] = useState<Buser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    Promise.all(
      BUSSER_STATUSES.map((status) =>
        import("@/client/busserClient")
          .then((mod) => mod.getBussersByStatus(status, params))
          .then((res) => res.data.data || [])
          .catch((err) => []),
      ),
    )
      .then((results) => {
        if (isMounted) {
          setAllBuser(results.flat());
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(params)]);

  return { data: allBuser, isLoading, error };
};
export const useGetGroupBuser = (
  params: { customer_id: string; fleet_id: string },
  options = {},
) => {
  const axiosAuth = useAxiosAuth();
  const getGroupBuser = () => {
    return axiosAuth.get(
      `/busser/grouped?customer_id=${params.customer_id}&fleet_id=${params.fleet_id}`,
    );
  };
  return useQuery({
    queryKey: ["grouped-buser", params],
    queryFn: getGroupBuser,
    ...options,
  });
};

// New hook for direct API call without grouping
export const useGetBuserTotals = (
  params: { customer_id: string; fleet_id: string },
  options = {},
) => {
  const axiosAuth = useAxiosAuth();
  const getBuserTotals = () => {
    return axiosAuth.get(
      `/busser/grouped?customer_id=${params.customer_id}&fleet_id=${params.fleet_id}`,
    );
  };
  return useQuery({
    queryKey: ["buser-totals", params],
    queryFn: getBuserTotals,
    ...options,
  });
};

export const useGetBusserStatistics = () => {
  const axiosAuth = useAxiosAuth();
  const getBusserStatistics = () => {
    return axiosAuth.get('/busser/statistics');
  };
  return useQuery({
    queryKey: ['busser-statistics'],
    queryFn: getBusserStatistics,
  });
};
