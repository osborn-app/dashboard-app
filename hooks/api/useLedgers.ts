import { compact } from "lodash";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import useAxiosAuth from "../axios/use-axios-auth";

const BASE_ENDPOINT = "/ledgers";

export const useGetRecaps = (params?: Record<string, any>) => {
  const axiosAuth = useAxiosAuth();

  const getRecaps = () => {
    return axiosAuth.get("/ledgers/recaps", {
      params,
    });
  };

  return useQuery({
    queryKey: compact(["ledgers", "recaps", params]),
    queryFn: getRecaps,
  });
};

export const useGetFleetsRecaps = (params?: Record<string, any>) => {
  const axiosAuth = useAxiosAuth();

  const getRecaps = () => {
    return axiosAuth.get("/ledgers/recaps/fleets", {
      params,
    });
  };

  return useQuery({
    queryKey: compact(["ledgers", "recaps", params]),
    queryFn: getRecaps,
  });
};

export const useGetLedgersFleet = (
  id: number,
  params: {
    page: number;
    limit: number;
  },
) => {
  const axiosAuth = useAxiosAuth();

  const getLedgersFleet = async () => {
    return axiosAuth.get(`${BASE_ENDPOINT}/fleet/${id}`, {
      params: {
        ...params,
        fleet_id: id,
      },
    });
  };

  return useQuery({
    queryKey: compact(["ledgers", "fleet", id, params]),
    queryFn: getLedgersFleet,
  });
};

export const useDeleteLedgers = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteLedgers = (id: number) => {
    return axiosAuth.delete(`${BASE_ENDPOINT}/${id}`);
  };

  return useMutation({
    mutationFn: deleteLedgers,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["ledgers", "fleet"] });
    },
  });
};

export const useGetInfinityCategories = (query?: string) => {
  const axiosAuth = useAxiosAuth();

  const getInfinityCategories = (pageParam = 1, query?: string) => {
    return axiosAuth.get(`${BASE_ENDPOINT}/categories`, {
      params: {
        limit: 10,
        pageParam,
        q: query,
      },
    });
  };

  return useInfiniteQuery({
    queryKey: ["ledgers", "categories", query],
    queryFn: ({ pageParam }) => getInfinityCategories(pageParam, query),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.pagination?.next_page,
  });
};

export const usePostLedgers = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postLedgers = (body: any) => {
    return axiosAuth.post(BASE_ENDPOINT, body);
  };

  return useMutation({
    mutationFn: postLedgers,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["ledgers", "fleet"] });
    },
  });
};

export const usePatchLedgers = (id: number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postLedgers = (body: any) => {
    return axiosAuth.patch(`${BASE_ENDPOINT}/${id}`, body);
  };

  return useMutation({
    mutationFn: postLedgers,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["ledgers", "fleet"] });
    },
  });
};
