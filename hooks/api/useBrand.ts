import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/brands";

// Get paginated brands
export const useGetBrands = (params: any = {}) => {
  const axiosAuth = useAxiosAuth();
  
  const getBrands = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, { params });
    return data;
  };

  return useQuery({
    queryKey: ["brands", params],
    queryFn: getBrands,
  });
};

// Get brands list for dropdown (cached)
export const useGetBrandsList = () => {
  const axiosAuth = useAxiosAuth();
  
  const getBrandsList = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/list`);
    return data;
  };

  return useQuery({
    queryKey: ["brands", "list"],
    queryFn: getBrandsList,
    staleTime: 4 * 60 * 60 * 1000, // 4 hours cache
  });
};

// Get single brand by ID
export const useGetBrandById = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  
  const getBrandById = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/${id}`);
    return data;
  };

  return useQuery({
    queryKey: ["brands", id],
    queryFn: getBrandById,
    enabled: !!id,
  });
};

// Create brand
export const useCreateBrand = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  
  const createBrand = async (data: { name: string }) => {
    const response = await axiosAuth.post(baseEndpoint, data);
    return response.data;
  };

  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

// Update brand
export const useUpdateBrand = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  
  const updateBrand = async ({ id, data }: { id: string | number; data: { name: string } }) => {
    const response = await axiosAuth.patch(`${baseEndpoint}/${id}`, data);
    return response.data;
  };

  return useMutation({
    mutationFn: updateBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

// Delete brand
export const useDeleteBrand = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  
  const deleteBrand = async (id: string | number) => {
    const response = await axiosAuth.delete(`${baseEndpoint}/${id}`);
    return response.data;
  };

  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};