import { compact } from "lodash";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import useAxiosAuth from "../axios/use-axios-auth";

const BASE_ENDPOINT = "/product-ledgers";

export const useGetProductLedgersRecaps = (params?: Record<string, any>) => {
  const axiosAuth = useAxiosAuth();

  const getRecaps = () => {
    return axiosAuth.get("/product-ledgers/recap", {
      params,
    });
  };

  return useQuery({
    queryKey: compact(["product-ledgers", "recaps", params]),
    queryFn: getRecaps,
  });
};

export const useGetProductLedgersProductsRecaps = (params?: Record<string, any>) => {
  const axiosAuth = useAxiosAuth();

  const getRecaps = () => {
    return axiosAuth.get("/product-ledgers/recap/products", {
      params,
    });
  };

  return useQuery({
    queryKey: compact(["product-ledgers", "recaps", "products", params]),
    queryFn: getRecaps,
  });
};

export const useGetProductLedgers = (
  id: number,
  params: {
    page: number;
    limit: number;
  },
) => {
  const axiosAuth = useAxiosAuth();

  const getProductLedgers = async () => {
    return axiosAuth.get(`${BASE_ENDPOINT}/product/${id}`, {
      params: {
        ...params,
        product_id: id,
      },
    });
  };

  return useQuery({
    queryKey: compact(["product-ledgers", "product", id, params]),
    queryFn: getProductLedgers,
  });
};

export const useDeleteProductLedgers = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteProductLedgers = (id: number) => {
    return axiosAuth.delete(`${BASE_ENDPOINT}/${id}`);
  };

  return useMutation({
    mutationFn: deleteProductLedgers,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["product-ledgers", "product"] });
    },
  });
};

export const useGetInfinityProductLedgerCategories = (query?: string) => {
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
    queryKey: ["product-ledgers", "categories", query],
    queryFn: ({ pageParam }) => getInfinityCategories(pageParam, query),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.pagination?.next_page,
  });
};
