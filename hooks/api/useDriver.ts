import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";
import { useUser } from "@/context/UserContext";

const baseEndpoint = "/drivers";
export const useGetDrivers = (params: any) => {
  const axiosAuth = useAxiosAuth();

  const getDrivers = () => {
    return axiosAuth.get(baseEndpoint, {
      params,
    });
  };

  return useQuery({
    queryKey: ["drivers", params],
    queryFn: getDrivers,
  });
};

export const useGetInfinityDrivers = (query?: string) => {
  const { user } = useUser();
  const axiosAuth = useAxiosAuth();
  const getDrivers = ({
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
    queryKey: ["driver", query],
    queryFn: ({ pageParam }) => getDrivers({ pageParam, query }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.pagination?.next_page,
    enabled: user?.role !== "owner",
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useGetDetailDriver = (id: string | number) => {
  const { user } = useUser();
  const axiosAuth = useAxiosAuth();

  const getDetailDriver = () => {
    return axiosAuth.get(`${baseEndpoint}/${id}`);
  };

  return useQuery({
    queryKey: ["drivers", id],
    queryFn: getDetailDriver,
    enabled: user?.role !== "owner",
  });
};

type Body = {
  name: string;
  email: string;
  gender?: string;
  date_of_birth?: string;
  nik?: string;
  password?: string;
  file: string;
  id_photo: string;
};

export const usePostDriver = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postDriver = (body: any) => {
    return axiosAuth.post(baseEndpoint, body);
  };

  return useMutation({
    mutationFn: postDriver,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["drivers"] });
    },
  });
};

export const useEditDriver = (id: number | string) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const editDriverFn = (body: any) => {
    return axiosAuth.patch(`${baseEndpoint}/${id}`, body);
  };

  return useMutation({
    mutationFn: editDriverFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["drivers"] });
    },
  });
};

export const useDeleteDriver = (id: number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteDriverFn = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/${id}`);
  };

  return useMutation({
    mutationFn: deleteDriverFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["drivers"] });
    },
  });
};
