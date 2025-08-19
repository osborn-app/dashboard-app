import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";
import { useUser } from "@/context/UserContext";

const baseEndpoint = "/requests";
interface GetRequestsParams {
  status: string;
  page: number;
  limit: number;
  q?: string;
  start_date?: string | Date | undefined;
  end_date?: string | Date | undefined;
  request_type?: 'all' | 'product' | 'fleet';
}

export const useGetRequests = (
  params: GetRequestsParams,
  options = {},
  type: string,
) => {
  const axiosAuth = useAxiosAuth();

  const getRequests = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["requests", params, type],
    queryFn: getRequests,
    ...options,
  });
};

export const useGetDetailRequest = (id: string | number) => {
  const axiosAuth = useAxiosAuth();

  const getDetailRequest = () => {
    return axiosAuth.get(`${baseEndpoint}/${id}`);
  };

  return useQuery({
    queryKey: ["requests", id],
    queryFn: getDetailRequest,
  });
};

type PayloadBody = {
  customer_id: number;
  fleet_id?: number;
  product_id?: number;
  driver_id: number;
  start_date: string;
  type: string;
  address?: string;
  description?: string;
  is_self_pickup: boolean;
  distance: number;
};

export const usePostRequest = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postRequest = (body: any) => {
    return axiosAuth.post(baseEndpoint, body);
  };

  return useMutation({
    mutationFn: postRequest,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["requests"] });
    },
  });
};

export const useEditRequest = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const editRequest = (body: any) => {
    return axiosAuth.patch(`${baseEndpoint}/${id}`, body);
  };

  return useMutation({
    mutationFn: editRequest,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["requests"] });
    },
  });
};

export const useDeleteRequest = (id: string | number) => {
  const axiosAuth = useAxiosAuth();

  const queryClient = useQueryClient();

  const deleteRequest = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/${id}`);
  };

  return useMutation({
    mutationFn: deleteRequest,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["requests"] });
    },
  });
};

export const useRequestsStatusCount = () => {
  const { user } = useUser();
  const axiosAuth = useAxiosAuth();
  const getStatusCountFn = () => {
    return axiosAuth.get(`${baseEndpoint}/status/count`);
  };
  return useQuery({
    queryKey: ["requests"],
    queryFn: getStatusCountFn,
    enabled: user?.role !== "owner",
  });
};
