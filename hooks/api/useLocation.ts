import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/locations";
export const useGetLocation = (params: any, options = {}, type: string) => {
  const axiosAuth = useAxiosAuth();

  const getLocation = () => {
    return axiosAuth.get(baseEndpoint, { params });
  };

  return useQuery({
    queryKey: ["locations", params, type],
    queryFn: getLocation,
    ...options,
  });
};

export const useGetLocations = () => {
  const axiosAuth = useAxiosAuth();

  const getLocations = () => {
    return axiosAuth.get(baseEndpoint, { 
      params: { 
        limit: 100, // Get all locations
        page: 1 
      } 
    });
  };

  return useQuery({
    queryKey: ["locations", "all"],
    queryFn: getLocations,
  });
};

export const useGetDetailLocation = (id: string | number) => {
  const axiosAuth = useAxiosAuth();

  const getDetailLocation = () => {
    return axiosAuth.get(`${baseEndpoint}/${id}`);
  };

  return useQuery({
    queryKey: ["locations", id],
    queryFn: getDetailLocation,
  });
};

export const useGetInfinityLocation = (query?: string) => {
  const axiosAuth = useAxiosAuth();
  const getLocation = ({
    pageParam = 1,
    query,
  }: {
    pageParam?: number;
    query?: string;
  }) => {
    return axiosAuth.get(baseEndpoint, {
      params: {
        limit: 10,
        page: pageParam,
        q: query,
      },
    });
  };

  return useInfiniteQuery({
    queryKey: ["locations", query],
    queryFn: ({ pageParam }) => getLocation({ pageParam, query }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.pagination?.next_page,
  });
};

export const usePostLocation = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postLocation = (body: any) => {
    return axiosAuth.post(baseEndpoint, body);
  };

  return useMutation({
    mutationFn: postLocation,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["locations"] });
    },
  });
};

export const useEditLocation = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const editLocation = (body: any) => {
    return axiosAuth.patch(`${baseEndpoint}/${id}`, body);
  };

  return useMutation({
    mutationFn: editLocation,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["locations"] });
    },
  });
};

export const useDeleteLocation = (id: string | number) => {
  const axiosAuth = useAxiosAuth();

  const queryClient = useQueryClient();

  const deleteLocation = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/${id}`);
  };

  return useMutation({
    mutationFn: deleteLocation,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["locations"] });
    },
  });
};
