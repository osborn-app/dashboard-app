import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/fleets";
export const useGetFleets = (params: any) => {
  const axiosAuth = useAxiosAuth();

  const getFleets = () => {
    return axiosAuth.get(baseEndpoint, { params });
  };

  return useQuery({
    queryKey: ["fleets", params],
    queryFn: getFleets,
  });
};

export const useGetInfinityFleets = (query?: string) => {
  const axiosAuth = useAxiosAuth();
  const getFleets = ({
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
    queryKey: ["fleets", query],
    queryFn: ({ pageParam }) => getFleets({ pageParam, query }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.pagination?.next_page,
  });
};

export const useGetInfinityFleetsForNeeds = (query?: string) => {
  const axiosAuth = useAxiosAuth();
  const getFleets = ({
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
    queryKey: ["fleets", query],
    queryFn: ({ pageParam }) => getFleets({ pageParam, query }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.pagination?.next_page,
  });
};

export const useGetDetailFleet = (id: number | string) => {
  const axiosAuth = useAxiosAuth();

  const getDetailFleet = () => {
    return axiosAuth.get(`${baseEndpoint}/${id}`);
  };

  return useQuery({
    queryKey: ["fleets", id],
    queryFn: getDetailFleet,
  });
};

type PayloadBody = {
  name: string;
  type: string;
  color?: string;
  plate_number: string;
  photos?: string[];
  status: string;
};

export const usePostFleet = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postFleet = (body: any) => {
    return axiosAuth.post(baseEndpoint, body);
  };

  return useMutation({
    mutationFn: postFleet,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["fleets"] });
    },
  });
};

export const useEditFleet = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const editFleet = (body: any) => {
    return axiosAuth.patch(`${baseEndpoint}/${id}`, body);
  };

  return useMutation({
    mutationFn: editFleet,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["fleets"] });
    },
  });
};

export const useDeleteFleet = (id: number) => {
  const axiosAuth = useAxiosAuth();

  const queryClient = useQueryClient();

  const deleteFleet = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/${id}`);
  };

  return useMutation({
    mutationFn: deleteFleet,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["fleets"] });
    },
  });
};

// New hook specifically for fleet table with network visibility
export const useFleetTableData = (params: any) => {
  const axiosAuth = useAxiosAuth();

  const getFleetTableData = async () => {
    const response = await axiosAuth.get(baseEndpoint, { params });
    return response.data;
  };

  return useQuery({
    queryKey: ["fleets", "table", params],
    queryFn: getFleetTableData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
