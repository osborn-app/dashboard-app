import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/products";
const addonsEndpoint = "/addons";

interface GetProductsParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  status?: string;
  location_id?: number;
  owner_id?: number;
}

interface GetAddonsParams {
  category?: string;
}

// Products hooks
export const useGetProducts = (params: GetProductsParams = {}, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getProducts = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["products", params],
    queryFn: getProducts,
    ...options,
  });
};

export const useGetAvailableProducts = (params: GetProductsParams = {}, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getAvailableProducts = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/available`, {
      params: {
        limit: 10,
        page: 1,
        ...params,
      },
    });
    // Transform response to match expected format for dropdown
    return {
      pages: [
        {
          data: {
            items: Array.isArray(data) ? data : [],
            meta: {},
            pagination: {}
          }
        }
      ]
    };
  };

  return useQuery({
    queryKey: ["products", "available", params],
    queryFn: getAvailableProducts,
    ...options,
  });
};

export const useGetDetailProduct = (id: number | string, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getDetailProduct = () => {
    return axiosAuth.get(`${baseEndpoint}/${id}`);
  };

  return useQuery({
    queryKey: ["products", id],
    queryFn: getDetailProduct,
    enabled: !!id,
    ...options,
  });
};

export const usePostProduct = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postProduct = (body: any) => {
    return axiosAuth.post(baseEndpoint, body);
  };

  return useMutation({
    mutationFn: postProduct,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useEditProduct = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const editProduct = (body: any) => {
    return axiosAuth.patch(`${baseEndpoint}/${id}`, body);
  };

  return useMutation({
    mutationFn: editProduct,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProductStatus = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updateProductStatus = (body: any) => {
    return axiosAuth.put(`${baseEndpoint}/${id}/status`, body);
  };

  return useMutation({
    mutationFn: updateProductStatus,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = (id: number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteProduct = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/${id}`);
  };

  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Addons hooks
export const useGetAddons = (params: GetAddonsParams = {}, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getAddons = async () => {
    const { data } = await axiosAuth.get(addonsEndpoint, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["addons", params],
    queryFn: getAddons,
    ...options,
  });
};

export const useGetDetailAddon = (id: number | string) => {
  const axiosAuth = useAxiosAuth();

  const getDetailAddon = () => {
    return axiosAuth.get(`${addonsEndpoint}/${id}`);
  };

  return useQuery({
    queryKey: ["addons", id],
    queryFn: getDetailAddon,
    enabled: !!id,
  });
};

export const usePostAddon = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postAddon = (body: any) => {
    return axiosAuth.post(addonsEndpoint, body);
  };

  return useMutation({
    mutationFn: postAddon,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["addons"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    },
  });
};

export const useEditAddon = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const editAddon = (body: any) => {
    return axiosAuth.patch(`${addonsEndpoint}/${id}`, body);
  };

  return useMutation({
    mutationFn: editAddon,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["addons"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    },
  });
};

export const useDeleteAddon = (id: number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteAddon = (id: number) => {
    return axiosAuth.delete(`${addonsEndpoint}/${id}`);
  };

  return useMutation({
    mutationFn: deleteAddon,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["addons"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    },
  });
};