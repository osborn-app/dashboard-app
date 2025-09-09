import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";
import { useUser } from "@/context/UserContext";

const baseEndpoint = "/orders";

interface GetProductOrdersParams {
  status: string;
  page: number;
  limit: number;
  q?: string;
  start_date?: string | Date | undefined;
  end_date?: string | Date | undefined;
  order_by?: string | undefined;
  order_column?: string | undefined;
  type?: string;
  order_type?: string;
}

export const useGetProductOrders = (
  params: GetProductOrdersParams,
  options = {},
  type: string,
) => {
  const axiosAuth = useAxiosAuth();

  const getProductOrders = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["orders", params, type, "product"],
    queryFn: getProductOrders,
    ...options,
  });
};

export const useGetDetailProductOrder = (id: number | string) => {
  const axiosAuth = useAxiosAuth();

  const getDetailProductOrder = () => {
    return axiosAuth.get(`${baseEndpoint}/${id}`);
  };

  return useQuery({
    queryKey: ["orders", id, "product"],
    queryFn: getDetailProductOrder,
  });
};

export const usePostProductOrder = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postProductOrder = (body: any) => {
    return axiosAuth.post(baseEndpoint, body);
  };

  return useMutation({
    mutationFn: postProductOrder,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["orders", "product"] });
    },
  });
};

export const useEditProductOrder = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const editProductOrder = (body: any) => {
    return axiosAuth.patch(`${baseEndpoint}/${id}`, body);
  };

  return useMutation({
    mutationFn: editProductOrder,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["orders", "product"] });
    },
  });
};

export const useProductOrderCalculate = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const calculatePrice = (body: any) => {
    return axiosAuth.post(`${baseEndpoint}/calculate-price`, body);
  };

  return useMutation({
    mutationFn: calculatePrice,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["orders", "product"] });
    },
  });
};

export const useProductOrdersStatusCount = () => {
  const { user } = useUser();
  const axiosAuth = useAxiosAuth();
  const getStatusCountFn = () => {
    return axiosAuth.get(`${baseEndpoint}/status/count`);
  };
  return useQuery({
    queryKey: ["orders", "product"],
    queryFn: getStatusCountFn,
    enabled: user?.role !== "owner",
  });
};

export const useDeleteProductOrder = (id: number, force: boolean) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteProductOrder = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/${id}`, {
      params: {
        force,
      },
    });
  };

  return useMutation({
    mutationFn: deleteProductOrder,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["orders", "product"] });
    },
  });
};

export const useAcceptProductOrder = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const acceptProductOrder = (body: any) => {
    return axiosAuth.post(`${baseEndpoint}/${id}/accept`, body);
  };

  return useMutation({
    mutationFn: acceptProductOrder,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["orders", "product"] });
    },
  });
};

export const useRejectProductOrder = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const rejectProductOrder = ({ orderId, reason }: any) => {
    return axiosAuth.post(`${baseEndpoint}/${orderId}/reject`, { reason });
  };

  return useMutation({
    mutationFn: rejectProductOrder,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["orders", "product"] });
    },
  });
};

export const useUpdatePaymentStatus = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updatePaymentStatus = (body: { payment_status: string }) => {
    return axiosAuth.patch(`${baseEndpoint}/${id}/payment-status`, body);
  };

  return useMutation({
    mutationFn: updatePaymentStatus,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["orders", "product"] });
      await queryClient.cancelQueries({ queryKey: ["orders", id, "product"] });
    },
    onSuccess: () => {
      // Invalidate and refetch order details
      queryClient.invalidateQueries({ queryKey: ["orders", id, "product"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "product"] });
    },
  });
}; 